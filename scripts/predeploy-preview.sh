#!/usr/bin/env bash

set -euo pipefail

echo "Running preview pre-deploy checks..."
echo "1) Type checking"
npm run type-check

echo "2) Linting"
npm run lint

echo "3) Preview build simulation (no Convex deploy)"
if [[ -d ".next" ]]; then
  mv ".next" ".next_prev_$(date +%s)"
fi
VERCEL_ENV=preview npm run vercel:build

echo "Pre-deploy checks passed."
