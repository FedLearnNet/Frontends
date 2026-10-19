#!/bin/sh
# Small helper script to build the frontend images (staging config, with local changes)
# to use in the testing bundle. Comment out any block you don't need.
set -eu
cd "$(dirname "$0")/.."

# The testing bundle always pulls new images on startup but ignores this tag,
# so keep the tag if you wanna use it in the testing bundle
TAG="${1:-testingtag}"

npm install --prefer-offline

# Like CI, use a minimal build context so node_modules isn't sent to docker
CONTEXT="$(mktemp -d)"
trap 'rm -rf "$CONTEXT"' EXIT
build_image() {
  npm run "$1"
  rm -rf "$CONTEXT/dist"
  mkdir -p "$CONTEXT/dist/app"
  cp nginx.conf "$CONTEXT/"
  cp -r dist/app/browser "$CONTEXT/dist/app/"
  docker build -t "$2:$TAG" -f Dockerfile "$CONTEXT"
}

# local frontend
build_image build-local-fl-net-staging local-fl-net

# global frontend
build_image build-global-fl-net-staging global-fl-net
