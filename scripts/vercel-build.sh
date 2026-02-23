#!/usr/bin/env bash

set -euo pipefail

if [[ -d ".next" ]]; then
  mv ".next" ".next_prev_$(date +%s)"
fi

if [[ "${VERCEL_ENV:-}" == "preview" ]]; then
  if [[ "${SKIP_CONVEX_DEPLOY:-0}" == "1" ]]; then
    echo "Running preview build check (skipping Convex deploy)..."
    npm run build
    exit 0
  fi

  if [[ -z "${CONVEX_DEPLOY_KEY:-}" ]]; then
    echo "Missing CONVEX_DEPLOY_KEY for preview deploy."
    exit 1
  fi

  BRANCH_NAME="${VERCEL_GIT_COMMIT_REF:-preview}"
  DEPLOY_SUFFIX="${VERCEL_GIT_COMMIT_SHA:-${VERCEL_DEPLOYMENT_ID:-$(date +%s)}}"
  DEPLOY_SUFFIX="${DEPLOY_SUFFIX:0:12}"
  PREVIEW_NAME="$(printf '%s-%s' "${BRANCH_NAME}" "${DEPLOY_SUFFIX}" \
    | tr '[:upper:]' '[:lower:]' \
    | tr -cs 'a-z0-9-' '-' \
    | sed -E 's/^-+//; s/-+$//')"

  echo "Running Convex preview deploy for '${PREVIEW_NAME}' and building Next.js..."
  deploy_log="$(mktemp)"

  # Create a unique preview deployment per Vercel deployment so older preview
  # URLs remain pinned to their original Convex backend.
  npx convex deploy \
    --preview-create "${PREVIEW_NAME}" \
    --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL \
    --cmd "npm run build" 2>&1 | tee "${deploy_log}"

  preview_url="$(
    sed -E $'s/\x1b\\[[0-9;]*[mK]//g' "${deploy_log}" \
      | grep -Eo 'https://[a-z0-9-]+\.convex\.cloud' \
      | tail -n1 || true
  )"
  rm -f "${deploy_log}"

  if [[ -z "${preview_url}" ]]; then
    echo "Failed to detect Convex preview URL from deploy output; skipping backfill."
    exit 1
  fi

  echo "Running backfill against ${preview_url}..."
  NEXT_PUBLIC_CONVEX_URL="${preview_url}" npm run convex:backfill

  # Env sync improves preview parity but should not block deploy readiness.
  if ! bash ./scripts/sync-convex-env.sh --preview-name "${PREVIEW_NAME}" --source vercel-preview; then
    echo "Warning: Convex preview env sync failed; continuing without blocking preview deploy."
  fi
  exit 0
fi

echo "Running standard build for '${VERCEL_ENV:-local}' (no Convex deploy)..."
npm run build
