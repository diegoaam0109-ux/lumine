import sys
from pathlib import Path

PROTO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROTO))
