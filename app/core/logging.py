import logging
import sys
import json
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """
    Formats log records as JSON strings.
    """
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.name,
            "funcName": record.funcName,
            "lineno": record.lineno,
        }
        if record.exc_info:
            log_record['exc_info'] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    """
    Configures the root logger for the application.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Remove any existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Create a handler that writes to stdout
    handler = logging.StreamHandler(sys.stdout)

    # Use the JSON formatter
    formatter = JsonFormatter()
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    
    # Suppress the specific bcrypt warning from passlib
    logging.getLogger("passlib.handlers.bcrypt").setLevel(logging.ERROR)
