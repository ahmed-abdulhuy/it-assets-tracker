#!/bin/bash


echo "Creating database backup..."
./backup-db.sh

echo "Pulling latest code..."
git pull origin production

echo "Building containers..."
docker compose -f docker-compose.production.yml up -d --build