#!/bin/sh
set -e

pnpm run migration:run:prod
exec node dist/main.js
