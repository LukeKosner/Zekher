#!/usr/bin/env bash

set -euo pipefail

source_mode="auto"
target_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      source_mode="${2:-}"
      shift 2
      ;;
    *)
      target_args+=("$1")
      shift
      ;;
  esac
done

tmp_dir="$(mktemp -d)"
values_tsv="${tmp_dir}/values.tsv"
source_file="${tmp_dir}/source.env"

cleanup() {
  rm -rf "${tmp_dir}"
}
trap cleanup EXIT

# Keep deploy/url selector variables out of Convex runtime env.
is_excluded_key() {
  case "$1" in
    CONVEX_DEPLOY_KEY|CONVEX_DEPLOYMENT|NEXT_PUBLIC_CONVEX_URL|NEXT_PUBLIC_CONVEX_SITE_URL)
      return 0
      ;;
    VERCEL|VERCEL_*|TURBO_*|NX_*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

branch_name="${VERCEL_GIT_COMMIT_REF:-}"
if [[ -z "${branch_name}" ]]; then
  branch_name="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi

pull_from_vercel_preview() {
  local env_arg=(--environment preview)
  if [[ -n "${branch_name}" ]]; then
    env_arg+=(--git-branch "${branch_name}")
  fi

  if vercel env pull "${source_file}" "${env_arg[@]}" >/dev/null 2>&1; then
    return 0
  fi

  vercel env pull "${source_file}" --environment preview >/dev/null 2>&1
}

if [[ "${source_mode}" == "vercel-preview" || "${source_mode}" == "auto" ]]; then
  pull_from_vercel_preview || true
fi

if [[ ! -s "${source_file}" ]]; then
  if [[ -f ".env.local" ]]; then
    cp ".env.local" "${source_file}"
  else
    echo "No source env found (Vercel preview pull failed and .env.local missing)."
    exit 1
  fi
fi

node - <<'NODE' "${source_file}" > "${values_tsv}"
const fs = require("fs");
const dotenv = require("dotenv");
const srcPath = process.argv[2];
const parsed = dotenv.parse(fs.readFileSync(srcPath));
for (const [k, v] of Object.entries(parsed)) {
  if (!k || typeof v !== "string") continue;
  process.stdout.write(`${k}\t${Buffer.from(v, "utf8").toString("base64")}\n`);
}
NODE

echo "Syncing Preview env vars to Convex..."
synced=0
skipped=0
failed=0

while IFS=$'\t' read -r key b64; do
  if [[ -z "${key}" ]]; then
    continue
  fi

  if is_excluded_key "${key}"; then
    skipped=$((skipped + 1))
    continue
  fi

  if [[ ${#key} -ge 40 ]]; then
    echo "Skipping ${key} (Convex env key length limit is 39 chars)."
    skipped=$((skipped + 1))
    continue
  fi

  if [[ -z "${b64}" ]]; then
    skipped=$((skipped + 1))
    continue
  fi

  value="$(printf '%s' "${b64}" | base64 --decode)"
  if [[ -z "${value}" ]]; then
    skipped=$((skipped + 1))
    continue
  fi

  if [[ "${#target_args[@]}" -gt 0 ]]; then
    if printf '%s' "${value}" | npx convex env set "${target_args[@]}" "${key}" >/dev/null; then
      synced=$((synced + 1))
    else
      echo "Failed to sync ${key}."
      failed=$((failed + 1))
    fi
  else
    if printf '%s' "${value}" | npx convex env set "${key}" >/dev/null; then
      synced=$((synced + 1))
    else
      echo "Failed to sync ${key}."
      failed=$((failed + 1))
    fi
  fi
done < "${values_tsv}"

if [[ "${synced}" -eq 0 ]]; then
  echo "No environment variables were synced to Convex."
else
  echo "Synced ${synced} environment variable(s) to Convex. Skipped ${skipped}. Failed ${failed}."
fi
