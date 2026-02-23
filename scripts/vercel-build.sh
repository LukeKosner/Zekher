#!/usr/bin/env bash

set -euo pipefail

if [[ -d ".next" ]]; then
  mv ".next" ".next_prev_$(date +%s)"
fi

if [[ "${VERCEL_ENV:-}" == "preview" ]]; then
  if [[ -z "${NEXT_PUBLIC_CONVEX_URL:-}" ]]; then
    echo "Preview build requires NEXT_PUBLIC_CONVEX_URL."
    exit 1
  fi

  echo "Running preview build against configured Convex deployment..."
fi

echo "Running build for '${VERCEL_ENV:-local}'..."
npm run build
