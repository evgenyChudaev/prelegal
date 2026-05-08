#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="prelegal"
CONTAINER_NAME="prelegal"
PORT="${PRELEGAL_PORT:-8000}"

cd "$ROOT_DIR"

echo "Building image $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Removing existing container $CONTAINER_NAME..."
    docker rm -f "$CONTAINER_NAME" >/dev/null
fi

echo "Starting container on http://localhost:${PORT} ..."
docker run -d --name "$CONTAINER_NAME" -p "${PORT}:8000" "$IMAGE_NAME"

echo "Prelegal is running. Open http://localhost:${PORT}"
