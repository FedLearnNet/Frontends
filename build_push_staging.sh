set -e
echo "This will push staging images to the registry. Please do not use this on a macbook as the staging server is linux based! Are you sure you want to proceed? (y/n)"
read answer
if [ "$answer" != "y" ]; then
    echo "Aborting."
    exit 1
fi

npm install --prefer-offline

# npm run build-posymed-staging
# docker build -t "gitlab.cosy.bio:5050/cosybio/federated-learning/federated_db/frontend-shared/global-posymed:staging" -f ./Dockerfile --push .

npm run build-local-fl-net-staging
docker build -t "gitlab.cosy.bio:5050/cosybio/federated-learning/federated_db/frontend-shared/local-fl-net:staging" -f ./Dockerfile --push .

npm run build-global-fl-net-staging
docker build -t "gitlab.cosy.bio:5050/cosybio/federated-learning/federated_db/frontend-shared/global-fl-net:staging" -f ./Dockerfile --push .
