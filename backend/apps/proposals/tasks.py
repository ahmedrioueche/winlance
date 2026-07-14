from celery import shared_task


@shared_task(name="proposals.tasks.generate_proposal_draft", bind=True, max_retries=3)
def generate_proposal_draft(self, proposal_id):
    from .models import Proposal
    from .services import generate_proposal_content

    try:
        proposal = Proposal.objects.select_related(
            "user", "lead", "lead__company", "template"
        ).get(id=proposal_id)
    except Proposal.DoesNotExist:
        return {"ok": False, "error": "not_found"}

    try:
        generate_proposal_content(proposal)
        return {"ok": True, "proposal_id": str(proposal.id), "status": proposal.status}
    except Exception as exc:
        Proposal.objects.filter(id=proposal_id).update(status=Proposal.Status.DRAFT)
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
