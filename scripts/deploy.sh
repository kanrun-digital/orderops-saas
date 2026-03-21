#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-$(git config --get remote.origin.url || true)}"
DEPLOY_REF="${DEPLOY_REF:-}"
WORKTREE_ROOT="${WORKTREE_ROOT:-/tmp/orderops-deploy}"
APP_DIR="${APP_DIR:-$WORKTREE_ROOT/app}"
IMAGE_TAG="${IMAGE_TAG:-orderops-saas:latest}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-Dockerfile}"
REACT_QUERY_INTRO_COMMIT="${REACT_QUERY_INTRO_COMMIT:-c05a24707e589ad7788ef56d1c86d138e934d007}"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-$(git remote show origin 2>/dev/null | sed -n '/HEAD branch/s/.*: //p' || true)}"

if [[ -z "$REPO_URL" ]]; then
  echo "[deploy] REPO_URL is required because origin is not configured."
  exit 1
fi

if [[ -z "$DEFAULT_BRANCH" ]]; then
  DEFAULT_BRANCH="main"
fi

rm -rf "$APP_DIR"
mkdir -p "$WORKTREE_ROOT"

clone_repo() {
  if [[ -n "$DEPLOY_REF" ]] && git ls-remote --exit-code --heads "$REPO_URL" "$DEPLOY_REF" >/dev/null 2>&1; then
    echo "[deploy] Cloning branch '$DEPLOY_REF' explicitly."
    git clone --branch "$DEPLOY_REF" --single-branch "$REPO_URL" "$APP_DIR"
  else
    echo "[deploy] Cloning default branch '$DEFAULT_BRANCH'."
    git clone "$REPO_URL" "$APP_DIR"

    if [[ -n "$DEPLOY_REF" ]]; then
      echo "[deploy] Explicitly checking out ref '$DEPLOY_REF' after clone."
      git -C "$APP_DIR" checkout "$DEPLOY_REF"
    fi
  fi
}

clone_repo

echo "[deploy] Server clone branch: $(git -C "$APP_DIR" branch --show-current)"
echo "[deploy] Server clone HEAD: $(git -C "$APP_DIR" rev-parse HEAD)"

CLONED_HEAD="$(git -C "$APP_DIR" rev-parse HEAD)"
if [[ "$CLONED_HEAD" == "$REACT_QUERY_INTRO_COMMIT" ]]; then
  echo "[deploy] HEAD exactly matches the commit that added @tanstack/react-query: $REACT_QUERY_INTRO_COMMIT"
elif git -C "$APP_DIR" merge-base --is-ancestor "$REACT_QUERY_INTRO_COMMIT" "$CLONED_HEAD"; then
  echo "[deploy] HEAD $CLONED_HEAD is newer than the @tanstack/react-query introduction commit $REACT_QUERY_INTRO_COMMIT"
elif git -C "$APP_DIR" merge-base --is-ancestor "$CLONED_HEAD" "$REACT_QUERY_INTRO_COMMIT"; then
  echo "[deploy] HEAD $CLONED_HEAD is older than the @tanstack/react-query introduction commit $REACT_QUERY_INTRO_COMMIT"
else
  echo "[deploy] HEAD $CLONED_HEAD and $REACT_QUERY_INTRO_COMMIT have diverged"
fi

if [[ -n "$DEPLOY_REF" && "$DEPLOY_REF" != "$DEFAULT_BRANCH" ]]; then
  echo "[deploy] Non-default deploy requested: '$DEPLOY_REF' (default branch is '$DEFAULT_BRANCH')."
fi

echo "[deploy] package.json dependencies block in server clone:"
node - "$APP_DIR/package.json" <<'EOF_NODE'
const fs = require('fs');
const pkgPath = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
console.log(JSON.stringify(pkg.dependencies ?? {}, null, 2));
EOF_NODE

if ! node - "$APP_DIR/package.json" <<'EOF_NODE'
const fs = require('fs');
const pkgPath = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
process.exit(pkg.dependencies && pkg.dependencies['@tanstack/react-query'] ? 0 : 1);
EOF_NODE
then
  echo "[deploy] Refusing production deploy: @tanstack/react-query is missing from package.json in the server clone."
  exit 1
fi

echo "[deploy] Confirmed @tanstack/react-query is present in package.json. Proceeding to docker build."
docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_TAG" "$APP_DIR"
