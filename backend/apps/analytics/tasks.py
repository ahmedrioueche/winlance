from celery import shared_task


@shared_task(name="analytics.tasks.refresh_funnel_snapshot", bind=True, max_retries=3)
def refresh_funnel_snapshot(self, user_id):
    from django.contrib.auth import get_user_model

    from .services import compute_funnel_metrics, save_funnel_snapshot

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return {"ok": False, "error": "not_found"}

    try:
        metrics = compute_funnel_metrics(user)
        snapshot = save_funnel_snapshot(user, metrics)
        return {"ok": True, "snapshot_id": str(snapshot.id)}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
