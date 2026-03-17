"""
Background scheduler for automated daily data ingestion.
Runs every day at 00:00 UTC to fetch trending articles across all topics.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from ingestion import run_ingestion
import logging

logger = logging.getLogger(__name__)

TOPICS = ["AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"]


def scheduled_daily_ingest():
    """
    Runs every day at 00:00 UTC.
    Fetches 20 trending articles per topic.
    """
    logger.info("⏰ Scheduled ingestion starting — 00:00 UTC")
    for topic in TOPICS:
        try:
            run_ingestion(topic=topic, limit=20)
            logger.info(f"✅ Ingested topic: {topic}")
        except Exception as e:
            logger.error(f"❌ Failed topic {topic}: {e}")
    logger.info("✅ Daily ingestion complete")


# Create scheduler instance
scheduler = BackgroundScheduler(timezone="UTC")


def start():
    """Start the background scheduler."""
    try:
        scheduler.add_job(
            scheduled_daily_ingest,
            trigger=CronTrigger(hour=0, minute=0),  # 00:00 UTC daily
            id="daily_ingest",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("📅 Scheduler started — daily ingestion at 00:00 UTC")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def stop():
    """Stop the background scheduler."""
    try:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {e}")
