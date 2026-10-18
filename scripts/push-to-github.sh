#!/usr/bin/env bash
# Push this project to https://github.com/Stephen-Qiu-RUC/focus-quad
# Run inside WSL from the project root:
#   bash scripts/push-to-github.sh

set -euo pipefail

OWNER="Stephen-Qiu-RUC"
REPO="focus-quad"
URL="https://github.com/${OWNER}/${REPO}.git"

if ! command -v gh >/dev/null 2>&1; then
  echo "Installing GitHub CLI..."
  (type -p wget >/dev/null || sudo apt-get install -y wget) >/dev/null
  sudo mkdir -p -m 755 /etc/apt/keyrings
  wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  sudo apt-get update -qq
  sudo apt-get install -y gh
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Please log in to GitHub (browser will open)..."
  gh auth login -h github.com -p https -w
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository: $ROOT"
  exit 1
fi

# Prefer main; fall back to the feature branch if needed.
if git show-ref --verify --quiet refs/heads/main; then
  BRANCH=main
elif git show-ref --verify --quiet refs/heads/cursor/quadrant-mvp-9124; then
  BRANCH=cursor/quadrant-mvp-9124
else
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
fi

git checkout "$BRANCH"
git pull --ff-only || true

if gh repo view "${OWNER}/${REPO}" >/dev/null 2>&1; then
  echo "Repo already exists: ${URL}"
else
  echo "Creating public repo ${OWNER}/${REPO}..."
  gh repo create "${OWNER}/${REPO}" --public --description "四象 · Eisenhower matrix todo with weekly habits"
fi

if git remote get-url github >/dev/null 2>&1; then
  git remote set-url github "$URL"
else
  git remote add github "$URL"
fi

echo "Pushing ${BRANCH} -> github main..."
git push -u github "${BRANCH}:main"

echo ""
echo "Done: https://github.com/${OWNER}/${REPO}"
