#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-${APP_DIR:-$(pwd)}}"
NPM_CMD="${NPM_CMD:-npm}"
LOG_PREFIX="[pre-deploy]"

if [[ ! -d "$APP_DIR" ]]; then
  echo "$LOG_PREFIX App directory does not exist: $APP_DIR"
  exit 1
fi

PACKAGE_JSON="$APP_DIR/package.json"
PACKAGE_LOCK="$APP_DIR/package-lock.json"

if [[ ! -f "$PACKAGE_JSON" ]]; then
  echo "$LOG_PREFIX package.json not found: $PACKAGE_JSON"
  exit 1
fi

COMMIT_HASH="$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo 'unknown')"
echo "$LOG_PREFIX Commit hash: $COMMIT_HASH"

if [[ ! -f "$PACKAGE_LOCK" ]]; then
  echo "$LOG_PREFIX Missing required file: package-lock.json"
  exit 1
fi

echo "$LOG_PREFIX package-lock.json detected."

if ! node - "$PACKAGE_JSON" <<'EOF_NODE'
const fs = require('fs');
const pkgPath = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const dependencyVersion = pkg.dependencies?.['@tanstack/react-query'] ?? pkg.devDependencies?.['@tanstack/react-query'];
if (!dependencyVersion) {
  process.exit(1);
}
console.log(`@tanstack/react-query=${dependencyVersion}`);
EOF_NODE
then
  echo "$LOG_PREFIX Missing required dependency in package.json: @tanstack/react-query"
  exit 1
fi

echo "$LOG_PREFIX Preparing clean production build environment in $APP_DIR"
rm -rf "$APP_DIR/node_modules" "$APP_DIR/.next"

TMP_NPM_LOG="$(mktemp)"
TMP_BUILD_LOG="$(mktemp)"
cleanup() {
  rm -f "$TMP_NPM_LOG" "$TMP_BUILD_LOG"
}
trap cleanup EXIT

echo "$LOG_PREFIX Installing dependencies with npm ci"
(
  cd "$APP_DIR"
  "$NPM_CMD" ci --no-audit --no-fund
)

echo "$LOG_PREFIX Checking for missing modules"
(
  cd "$APP_DIR"
  "$NPM_CMD" ls --all --json > /dev/null 2>"$TMP_NPM_LOG" || true
)

node - "$TMP_NPM_LOG" <<'EOF_NODE'
const fs = require('fs');
const logPath = process.argv[2];
const content = fs.readFileSync(logPath, 'utf8');
const missing = [...new Set(content.split('\n').filter(line => /missing:/i.test(line)).map(line => line.trim()))];
console.log('[pre-deploy] Missing modules:');
if (missing.length === 0) {
  console.log('[pre-deploy]   none');
} else {
  for (const item of missing) {
    console.log(`[pre-deploy]   ${item}`);
  }
}
if (missing.length > 0) {
  process.exit(1);
}
EOF_NODE

echo "$LOG_PREFIX Running production build"
set +e
(
  cd "$APP_DIR"
  NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 "$NPM_CMD" run build
) 2>&1 | tee "$TMP_BUILD_LOG"
BUILD_EXIT_CODE=${PIPESTATUS[0]}
set -e

node - "$TMP_BUILD_LOG" <<'EOF_NODE'
const fs = require('fs');
const logPath = process.argv[2];
const content = fs.readFileSync(logPath, 'utf8');
const missing = [...new Set([...content.matchAll(/Can't resolve ['"]([^'"]+)['"]/g)].map(match => match[1]))];
console.log('[pre-deploy] Build-reported missing modules:');
if (missing.length === 0) {
  console.log('[pre-deploy]   none');
} else {
  for (const item of missing) {
    console.log(`[pre-deploy]   ${item}`);
  }
}
EOF_NODE

if [[ $BUILD_EXIT_CODE -ne 0 ]]; then
  echo "$LOG_PREFIX Production build failed. Aborting deploy before docker build or container restart."
  exit $BUILD_EXIT_CODE
fi

echo "$LOG_PREFIX Pre-deploy checks completed successfully."
