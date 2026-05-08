#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="prelegal"
CONTAINER_NAME="prelegal"
PORT="${PRELEGAL_PORT:-8000}"

cd "$ROOT_DIR"

ENV_ARGS=()
if [ -f "$ROOT_DIR/.env" ]; then
    KEY=$(grep -E '^[[:space:]]*OPENROUTER_API_KEY[[:space:]]*=' "$ROOT_DIR/.env" \
        | head -1 \
        | sed -E 's/^[^=]*=[[:space:]]*//' \
        | sed -E 's/^["'\'']//; s/["'\'']$//')
    if [ -n "$KEY" ]; then
        ENV_ARGS+=(-e "OPENROUTER_API_KEY=$KEY")
    fi
fi

echo "Building image $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Removing existing container $CONTAINER_NAME..."
    docker rm -f "$CONTAINER_NAME" >/dev/null
fi

echo "Starting container on http://localhost:${PORT} ..."
docker run -d --name "$CONTAINER_NAME" -p "${PORT}:8000" "${ENV_ARGS[@]}" "$IMAGE_NAME"

echo "Prelegal is running. Open http://localhost:${PORT}"
