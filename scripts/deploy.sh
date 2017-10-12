#!/usr/bin/env bash

MODULES="api app web"

for mod in ${MODULES[@]};
do
  pushd sub/$mod
  npm run deploy
  popd
done
