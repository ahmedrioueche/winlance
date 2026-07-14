from celery import shared_task


@shared_task(name="contracts.tasks.generate_contract_draft", bind=True, max_retries=3)
def generate_contract_draft(self, contract_id):
    from .models import Contract
    from .services import generate_contract_content

    try:
        contract = Contract.objects.select_related(
            "user",
            "proposal",
            "proposal__lead",
            "lead",
            "lead__company",
            "template",
        ).get(id=contract_id)
    except Contract.DoesNotExist:
        return {"ok": False, "error": "not_found"}

    try:
        generate_contract_content(contract)
        return {"ok": True, "contract_id": str(contract.id), "status": contract.status}
    except Exception as exc:
        Contract.objects.filter(id=contract_id).update(status=Contract.Status.DRAFT)
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@shared_task(name="contracts.tasks.export_contract_document", bind=True, max_retries=3)
def export_contract_document(self, contract_id):
    from .models import Contract
    from .services import build_contract_export

    try:
        contract = Contract.objects.select_related(
            "user", "proposal", "lead", "template"
        ).get(id=contract_id)
    except Contract.DoesNotExist:
        return {"ok": False, "error": "not_found"}

    try:
        build_contract_export(contract)
        return {
            "ok": True,
            "contract_id": str(contract.id),
            "export_length": len(contract.export_content),
        }
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
