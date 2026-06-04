Set-Location E:\Apps\it-assets-tracker

git checkout production

git pull origin production

docker compose `
-f docker-compose.prod.yml `
down

docker compose `
-f docker-compose.prod.yml `
up -d --build

docker image prune -f