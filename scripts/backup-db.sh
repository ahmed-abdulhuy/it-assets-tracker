#!/bin/bash

set -e
source .env

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p backups

docker exec IT-Inventory-Database \
  pg_dump \
  -U "$POSTGRES_USER" \
  "$POSTGRES_DB" \
  | gzip > "backups/db_${TIMESTAMP}.sql.gz"

echo "Database backup created:"
echo "backups/db_${TIMESTAMP}.sql.gz"