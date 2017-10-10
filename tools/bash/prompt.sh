#!/usr/bin/env bash

#
# Terminal colors
# http://www.tldp.org/HOWTO/Bash-Prompt-HOWTO/bash-prompt-escape-sequences.html
#
# \h host
# \u user
# \w path
# \W basename
# \! history
#

RED="\[\e[0;31m\]"
GRN="\[\e[0;32m\]"
BLU="\[\e[0;34m\]"
BLK="\[\e[0m\]"

function prompt_command {

  # Swallow errors.
  REPO_PATH="$(git rev-parse --show-toplevel 2> /dev/null)"
  if [ -z $REPO_PATH ];
  then
    export PS1="$GRN\h:$BLU\w$BLK: "
  else
    # Format if inside repo.
    BRANCH=$(git branch 2>/dev/null | grep '^*' | colrm 1 2)
    REPO="$(basename `git rev-parse --show-toplevel`)"
    REL=${PWD#${REPO_PATH}}
    if [ -z $REL ];
    then
      REL="/"
    fi

    # Warn of wrong virtualenv (python).
    # TODO(burdon): Auto change to correct path (or warn).
    if [ ${VIRTUAL_ENV} ];
    then
      REL_ENV=${VIRTUAL_ENV#${REPO_PATH}}
      if [ "$REL_ENV" = "${REL_ENV#${REL}}" ];
      then
        LOCAL_ENV=`find . -name activate`
        if [ ${LOCAL_ENV} ];
        then
          source $LOCAL_ENV
          REL_ENV=${VIRTUAL_ENV#${REPO_PATH}}
          echo "Switched VIRTUAL_ENV => ${REPO}:${REL_ENV}"
        fi
      fi
    fi

    export PS1="[$BLU$REPO$BLK:$RED$BRANCH$BLK] $BLU$REL$BLK: "
  fi
}

# Runs before each prompt is displayed.
export PROMPT_COMMAND=prompt_command
