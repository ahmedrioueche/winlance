from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.clients.models import Client
from apps.proposals.models import Proposal, ProposalVersion
from apps.proposals.serializers import ProposalSerializer


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
    ).select_related("lead", "template").prefetch_related("versions").first()

    if not proposal or proposal.status == Proposal.Status.DRAFT:
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
    change_summary = request.data.get("change_summary", "Client requested changes")

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
        change_summary=change_summary,
        created_by_name=client_display_name,
        created_by_role="client",
    )

    proposal.body = body
    proposal.title = title
    proposal.amount = amount
    proposal.status = Proposal.Status.CHANGES_REQUESTED
    proposal.save(update_fields=["body", "title", "amount", "status", "updated_at"])

    serializer = ProposalSerializer(proposal, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def portal_accept_proposal(request, token, proposal_id):
    client = _get_client_by_token(token)
    if not client:
        return Response({"detail": "Client portal not found."}, status=status.HTTP_404_NOT_FOUND)

    if not _check_passcode(client, request):
        return Response({"detail": "Passcode required."}, status=status.HTTP_401_UNAUTHORIZED)

    proposal = Proposal.objects.filter(
        id=proposal_id, user=client.freelancer
    ).first()

    proposal.status = Proposal.Status.ACCEPTED
    proposal.save(update_fields=["status", "updated_at"])

    serializer = ProposalSerializer(proposal, context={"request": request})
    return Response(serializer.data)
