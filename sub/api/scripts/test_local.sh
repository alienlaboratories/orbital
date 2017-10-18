#!/usr/bin/env bash

sls invoke local -f status -p testing/status.json

#sls invoke local -f status -p testing/status.json | jq
