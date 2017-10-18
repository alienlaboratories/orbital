#!/usr/bin/env bash

sls invoke -f site -p testing/login.json

sls invoke --local -f site -p testing/login.json | jq
