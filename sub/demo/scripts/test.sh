#!/usr/bin/env bash

SLS_DEBUG=true

echo
echo "### LOCAL ###"
echo
sls invoke local -f status

echo
echo "### REMOTE ###"
echo
sls invoke -f status

echo
echo "### LOGS ###"
echo
sls logs -f status -t
