#!/bin/sh
#
# Use this script to run your program LOCALLY.


set -e # Exit early if any commands fail


# - Edit this to change how your program runs locally
# - Edit .codecrafters/run.sh to change how your program runs remotely
exec bun run $(dirname $0)/app/main.ts "$@"
