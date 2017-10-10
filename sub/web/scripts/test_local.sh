#!/usr/bin/env bash

sls invoke --local -f site -p testing/login.json | jq
