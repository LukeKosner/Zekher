#!/usr/bin/env bash

set -euo pipefail

if [[ "${VERCEL_ENV:-}" == "preview" ]]; then
  if [[ -z "${CONVEX_DEPLOY_KEY:-}" ]]; then
    echo "Missing CONVEX_DEPLOY_KEY for preview deploy."
    exit 1
  fi

  PREVIEW_NAME="${VERCEL_GIT_COMMIT_REF:-preview}"
  echo "Running Convex preview deploy for '${PREVIEW_NAME}' and building Next.js..."
  npx convex deploy \
    --preview-create "${PREVIEW_NAME}" \
    --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL \
    --cmd "npm run build"
  exit 0
fi

echo "Running standard build for '${VERCEL_ENV:-local}' (no Convex deploy)..."
npm run build
