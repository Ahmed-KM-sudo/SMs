"""
Patch to fix bcrypt version detection issue with passlib.
This module should be imported early in the application startup.
"""
import warnings
import sys
from io import StringIO

# Monkey patch to suppress the specific bcrypt error
def patch_bcrypt_version_detection():
    """Suppress the bcrypt version detection error"""
    try:
        import bcrypt
        # Try to add the missing __about__ attribute if it doesn't exist
        if not hasattr(bcrypt, '__about__'):
            class About:
                __version__ = getattr(bcrypt, '__version__', '4.0.0')
            bcrypt.__about__ = About()
    except ImportError:
        pass

# Redirect stderr temporarily to suppress the error message
class StderrRedirect:
    def __init__(self):
        self._stderr = sys.stderr
        self._buffer = StringIO()
        
    def __enter__(self):
        sys.stderr = self._buffer
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stderr = self._stderr
        # Filter out the bcrypt warning from the captured output
        output = self._buffer.getvalue()
        filtered_lines = []
        for line in output.split('\n'):
            if 'error reading bcrypt version' not in line and 'AttributeError: module \'bcrypt\' has no attribute \'__about__\'' not in line:
                filtered_lines.append(line)
        
        filtered_output = '\n'.join(filtered_lines).strip()
        if filtered_output:
            self._stderr.write(filtered_output + '\n')

# Apply the patch
patch_bcrypt_version_detection()

# Export the redirect context manager for use in other modules
__all__ = ['StderrRedirect', 'patch_bcrypt_version_detection']
