from celery import Celery
from app.core.config import settings

# Celery Application initialized with Redis as broker and result backend
celery_app = Celery(
    "enterprise_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.AI_AGENT_TIMEOUT_SECONDS + 30,
)


@celery_app.task(name="execute_background_ai_agent")
def execute_background_ai_agent(agent_id: str, prompt: str, user_id: str):
    """
    Background Celery task for long-running AI Agent tasks,
    batch summarization, autonomous web crawling, or multi-step reasoning.
    """
    import time
    time.sleep(2)  # Simulate model inference processing
    return {
        "status": "completed",
        "agent_id": agent_id,
        "user_id": user_id,
        "result": f"Asynchronously processed prompt: '{prompt}' successfully.",
    }


if __name__ == "__main__":
    celery_app.start()
