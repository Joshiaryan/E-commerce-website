import sys
import os

# Add the project root to the import path so we can import the Flask app
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

# Import the Flask instance defined in the original app.py
from app import app as flask_app  # noqa: E402

def handler(request, context):
    """Vercel entry point.
    Vercel calls this function with the raw request and expects a
    WSGI‑compatible response. Flask already implements WSGI, so we simply
    forward the call.
    """
    return flask_app(request, context)
