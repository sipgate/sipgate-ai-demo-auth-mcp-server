#!/bin/bash
# Build and run the MCP server in a Docker container on port 8088

IMAGE_NAME="${MCP_SERVER_NAME:-mcp-server}"

docker build -t "$IMAGE_NAME" .

if [ -f .env ]; then
	docker run --rm --env-file .env -p 8088:8088 "$IMAGE_NAME"
else
	echo "Warning: No .env file found. Environment variables will use defaults."
	docker run --rm -p 8088:8088 "$IMAGE_NAME"
fi
