#!/usr/bin/env bash

MODULES="orbital-api orbital-app orbital-web"

for mod in ${MODULES[@]};
do
  yarn workspace ${mod} run deploy
done
