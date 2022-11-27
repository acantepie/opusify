#!/bin/bash

# It's your lucky day if this script doesn't fail

if [ "$1" = '--python' ] || [ "$1" = '-p' ]; then
  echo ">>> building python (linux)... <<<"
  echo ""
  echo ""
  rm -Rf dist/youtube-dl
  (cd src/youtube-dl && make create-env && make build-linux) || exit 1
  (cd src/youtube-dl && make build-windows) || exit 1
  mkdir -p dist/youtube-dl
  mv src/youtube-dl/dist/* dist/youtube-dl
  rmdir src/youtube-dl/dist
fi


echo ">>> building node ... <<<"
echo ""
echo ""

yarn
yarn vite build

echo ">>> packaging app ... <<<"
echo ""
echo ""

docker run --rm \
  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v "${PWD}":/project \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "yarn release -wl && chown -R --reference=. ./release"
