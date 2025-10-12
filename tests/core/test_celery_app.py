from app.core.celery_app import celery_app

def test_celery_beat_schedule():
    """
    Tests that the Celery Beat schedule is configured correctly.
    """
    schedule = celery_app.conf.beat_schedule
    assert 'process-sms-batch-every-minute' in schedule
    assert schedule['process-sms-batch-every-minute']['task'] == 'app.tasks.sms_tasks.process_sms_batch'
    assert schedule['process-sms-batch-every-minute']['schedule'] == 60.0

    assert 'send-scheduled-campaigns-every-minute' in schedule
    assert schedule['send-scheduled-campaigns-every-minute']['task'] == 'app.tasks.sms_tasks.send_scheduled_campaigns'
    assert schedule['send-scheduled-campaigns-every-minute']['schedule'] == 60.0
