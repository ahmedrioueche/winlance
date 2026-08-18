from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from django.db.models import Q
from apps.clients.models import Client
from apps.contracts.models import Contract
from apps.contracts.serializers import ContractSerializer
from apps.contracts.services import mark_contract_signed
from apps.projects.models import Milestone, Project, Task
from apps.proposals.models import Proposal, ProposalVersion
from apps.proposals.serializers import ProposalSerializer
from apps.portal.serializers import (
    PortalProjectDetailSerializer,
    PortalProjectListSerializer,
)


def _get_client_by_token(token_str):
    try:
        return Client.objects.select_related("freelancer").get(portal_token=token_str)
    except (Client.DoesNotExist, ValueError):
        return None


def _check_passcode(client, request):
    if not client.is_portal_password_protected:
        return True
    header_passcode = request.headers.get("X-Portal-Passcode", "")
    query_passcode = request.query_params.get("passcode", "")
    provided = (header_passcode or query_passcode).strip()
    return provided == client.portal_passcode


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_info(request, token):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    freelancer = client.freelancer
    freelancer_name = freelancer.get_full_name() or freelancer.username

    return Response(
        {
            "client_name": client.name,
            "company_name": client.company_name,
            "freelancer_name": freelancer_name,
            "is_password_protected": client.is_portal_password_protected,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_passcode(request, token):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not client.is_portal_password_protected:
        return Response({"success": True, "detail": "No password protection required."})

    passcode = (request.data.get("passcode") or "").strip()
    if passcode != client.portal_passcode:
        return Response({"detail": "Invalid passcode."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"success": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_proposals_list(request, token):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    # Exclude internal DRAFT proposals
    proposals = Proposal.objects.filter(
        user=client.freelancer
    ).exclude(
        status=Proposal.Status.DRAFT
    ).select_related("lead", "template").prefetch_related("versions")

    serializer = ProposalSerializer(proposals, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_proposal_detail(request, token, proposal_id):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    proposal = Proposal.objects.filter(
        id=proposal_id, user=client.freelancer
    ).select_related("lead", "template").prefetch_related("versions", "milestones").first()

    if not proposal:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProposalSerializer(proposal, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def portal_suggest_edits(request, token, proposal_id):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    proposal = Proposal.objects.filter(
        id=proposal_id, user=client.freelancer
    ).prefetch_related("versions").first()

    if not proposal:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

    body = request.data.get("body", proposal.body)
    title = request.data.get("title", proposal.title)
    amount = request.data.get("amount", proposal.amount)
    feedback = request.data.get("feedback_notes", request.data.get("change_summary", "Client requested changes"))

    last_version = proposal.versions.order_by("-version_number").first()
    next_ver = (last_version.version_number + 1) if last_version else 1

    client_display_name = f"{client.name} ({client.company_name})" if client.company_name else client.name

    ProposalVersion.objects.create(
        proposal=proposal,
        version_number=next_ver,
        title=title,
        body=body,
        amount=amount,
        currency=proposal.currency,
        change_summary=feedback,
        created_by_name=client_display_name,
        created_by_role="client",
    )

    proposal.body = body
    proposal.title = title
    proposal.amount = amount
    proposal.client_feedback = feedback
    proposal.status = Proposal.Status.CHANGES_REQUESTED
    proposal.save(update_fields=["body", "title", "amount", "client_feedback", "status", "updated_at"])

    serializer = ProposalSerializer(proposal, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def portal_accept_proposal(request, token, proposal_id):
    from django.utils import timezone

    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    proposal = Proposal.objects.filter(
        id=proposal_id, user=client.freelancer
    ).first()

    if not proposal:
        return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

    if proposal.is_expired:
        return Response(
            {"detail": "This proposal has expired. Please contact the freelancer for an updated proposal."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Capture Audit Trail details
    signer_name = request.data.get("signer_name", "").strip() or client.name
    signer_email = request.data.get("signer_email", "").strip() or client.email
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    remote_ip = x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR", "127.0.0.1")
    user_agent = request.META.get("HTTP_USER_AGENT", "")

    # Selected Add-ons update
    selected_addon_ids = request.data.get("selected_addon_ids")
    if isinstance(selected_addon_ids, list) and isinstance(proposal.addons, list):
        updated_addons = []
        for item in proposal.addons:
            if isinstance(item, dict):
                item["is_selected"] = item.get("id") in selected_addon_ids
            updated_addons.append(item)
        proposal.addons = updated_addons

    proposal.status = Proposal.Status.ACCEPTED
    proposal.signed_at = timezone.now()
    proposal.signed_name = signer_name
    proposal.signed_email = signer_email
    proposal.signed_ip = remote_ip
    proposal.signed_user_agent = user_agent
    proposal.save(
        update_fields=[
            "status",
            "addons",
            "signed_at",
            "signed_name",
            "signed_email",
            "signed_ip",
            "signed_user_agent",
            "updated_at",
        ]
    )

    serializer = ProposalSerializer(proposal, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_projects_list(request, token):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    # Exclude internal DRAFT projects
    qs = Project.objects.filter(
        freelancer=client.freelancer
    ).exclude(
        status=Project.Status.DRAFT
    )

    # Prefer projects directly matching client email or client name/company
    matching_projects = qs.filter(
        Q(client_email__iexact=client.email)
        | Q(client_name__iexact=client.name)
        | Q(client_name__iexact=client.company_name)
    ).prefetch_related("milestones")

    projects = matching_projects if matching_projects.exists() else qs.prefetch_related("milestones")

    serializer = PortalProjectListSerializer(projects, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_project_detail(request, token, project_id):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    project = Project.objects.filter(
        id=project_id, freelancer=client.freelancer
    ).exclude(
        status=Project.Status.DRAFT
    ).prefetch_related("milestones", "requirements", "files", "reports").first()

    if not project:
        return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = PortalProjectDetailSerializer(project)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([AllowAny])
def portal_approve_task(request, token, project_id, task_id):
    """Allow a portal client to mark a task as DONE — only from IN_REVIEW status."""
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    task = Task.objects.filter(
        id=task_id,
        project_id=project_id,
        project__freelancer=client.freelancer,
    ).first()

    if not task:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if task.status != Task.Status.IN_REVIEW:
        return Response(
            {"detail": "Only tasks with status 'In Review' can be approved."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    task.status = Task.Status.DONE
    task.save(update_fields=["status", "updated_at"])

    return Response({
        "id": str(task.id),
        "title": task.title,
        "status": task.status,
        "detail": "Task approved and marked as Done.",
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def portal_approve_milestone(request, token, project_id, milestone_id):
    """Allow a portal client to formally approve/sign-off on a milestone."""
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    milestone = Milestone.objects.filter(
        id=milestone_id,
        project_id=project_id,
        project__freelancer=client.freelancer,
    ).first()

    if not milestone:
        return Response({"detail": "Milestone not found."}, status=status.HTTP_404_NOT_FOUND)

    milestone.status = Milestone.Status.DONE
    milestone.progress_percent = 100
    milestone.save(update_fields=["status", "progress_percent", "updated_at"])

    # Auto-activate next pending milestone
    next_milestone = Milestone.objects.filter(
        project_id=project_id,
        status=Milestone.Status.PENDING,
    ).order_by("order", "created_at").first()

    if next_milestone:
        next_milestone.status = Milestone.Status.IN_PROGRESS
        next_milestone.save(update_fields=["status", "updated_at"])

    return Response({
        "id": str(milestone.id),
        "title": milestone.title,
        "status": milestone.status,
        "detail": "Milestone signed off and accepted successfully.",
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_contracts_list(request, token):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    contracts = Contract.objects.filter(
        user=client.freelancer
    ).exclude(
        status=Contract.Status.DRAFT
    ).select_related("proposal", "lead", "template")

    serializer = ContractSerializer(contracts, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_contract_detail(request, token, contract_id):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    contract = Contract.objects.filter(
        id=contract_id, user=client.freelancer
    ).select_related("proposal", "lead", "template").first()

    if not contract:
        return Response({"detail": "Contract not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ContractSerializer(contract, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def portal_sign_contract(request, token, contract_id):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    contract = Contract.objects.filter(
        id=contract_id, user=client.freelancer
    ).first()

    if not contract:
        return Response({"detail": "Contract not found."}, status=status.HTTP_404_NOT_FOUND)

    signed_name = request.data.get("signed_name", "").strip() or client.name
    signed_email = request.data.get("signed_email", "").strip() or client.email

    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    remote_ip = x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR", "127.0.0.1")

    mark_contract_signed(
        contract,
        signed_name=signed_name,
        signed_email=signed_email,
        signed_ip=remote_ip,
    )

    serializer = ContractSerializer(contract, context={"request": request})
    return Response(serializer.data)



