# Minimal helper script to build local docker images to use in docker-compose based end to end testing
npm install --prefer-offline
npm run build-local-fl-net-staging
docker build -t "local-frontend:tmptag" -f ./Dockerfile  .

npm run build-global-fl-net-staging
docker build -t "global-frontend:tmptag" -f ./Dockerfile .
