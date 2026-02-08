#!/bin/sh
set -e
# Sync dependencies with package.json (handles new deps when volumes persist)
npm install
exec "$@"
