from celery import shared_task


@shared_task(name="ai_coach.tasks.generate_coach_advice", bind=True, max_retries=3)
def generate_coach_advice(self, session_id):
    from .models import CoachSession
    from .services import run_coach_generation

    try:
        session = CoachSession.objects.select_related(
            "user", "lead", "lead__company", "proposal"
        ).get(id=session_id)
    except CoachSession.DoesNotExist:
        return {"ok": False, "error": "not_found"}

    try:
        run_coach_generation(session)
        return {
            "ok": True,
            "session_id": str(session.id),
            "status": session.status,
        }
    except Exception as exc:
        CoachSession.objects.filter(id=session_id).update(
            status=CoachSession.Status.FAILED,
            error_message=str(exc),
        )
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
