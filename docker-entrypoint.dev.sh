#!/bin/sh
set -e

pnpm run migration:run
exec pnpm run start:dev
