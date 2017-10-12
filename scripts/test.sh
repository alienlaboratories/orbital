#!/usr/bin/env bash

for dir in ./sub/*/
do
  pushd $dir
  npm run test
  popd
done
