"""
Daily-style Postgres backup helper for Winlance.

Usage (Docker Compose prod/db service name "db"):
  docker compose -f docker-compose.prod.yml exec -T db \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backups/winlance_$(date +%Y%m%d_%H%M%S).sql

Or run this script from the host with POSTGRES_* env vars pointing at the DB:
  python scripts/backup_postgres.py

Retention: keep at least 7 daily dumps; prune older files manually or via cron.
"""

from __future__ import annotations

import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def main() -> int:
    host = os.environ.get("POSTGRES_HOST", "localhost")
    port = os.environ.get("POSTGRES_PORT", "5432")
    db = os.environ.get("POSTGRES_DB", "winlance")
    user = os.environ.get("POSTGRES_USER", "winlance")
    password = os.environ.get("POSTGRES_PASSWORD", "")

    backup_dir = Path(os.environ.get("BACKUP_DIR", Path(__file__).resolve().parents[1] / "backups"))
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    out = backup_dir / f"winlance_{stamp}.sql"

    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password

    cmd = [
        "pg_dump",
        "-h",
        host,
        "-p",
        str(port),
        "-U",
        user,
        "-d",
        db,
        "-f",
        str(out),
    ]
    try:
        subprocess.run(cmd, check=True, env=env)
    except FileNotFoundError:
        print("pg_dump not found. Install PostgreSQL client tools or use docker compose exec.", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print(f"Backup failed: {exc}", file=sys.stderr)
        return exc.returncode

    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
