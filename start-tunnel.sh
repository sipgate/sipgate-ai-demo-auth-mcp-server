#!/bin/bash
set -e

MOCK_PORT="${MOCK_SERVICE_PORT:-3001}"
MCP_PORT="${PORT:-8088}"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $MOCK_PID $MCP_PID $CF_MOCK_PID $CF_MCP_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

if ! command -v cloudflared &> /dev/null; then
  echo "Error: cloudflared is not installed."
  echo "Install with: brew install cloudflared"
  exit 1
fi

wait_for_tunnel_url() {
  local logfile=$1
  local max_attempts=15
  local attempt=0
  local url=""

  while [ $attempt -lt $max_attempts ]; do
    url=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$logfile" 2>/dev/null | head -1)
    if [ -n "$url" ]; then
      echo "$url"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done

  return 1
}

echo "Starting Mock Auth Service on port $MOCK_PORT..."
npx ts-node src/mock-service/server.ts &
MOCK_PID=$!
sleep 2

echo "Starting tunnel for Mock Service..."
cloudflared tunnel --url "http://localhost:$MOCK_PORT" > /tmp/cf-mock.log 2>&1 &
CF_MOCK_PID=$!

echo "Waiting for Mock Service tunnel..."
MOCK_URL=$(wait_for_tunnel_url /tmp/cf-mock.log)

if [ -z "$MOCK_URL" ]; then
  echo "Error: Could not get cloudflared URL for Mock Service after 30s."
  echo "Log output:"
  cat /tmp/cf-mock.log
  cleanup
fi

echo "Mock Service tunnel: $MOCK_URL"

echo "Starting MCP Server on port $MCP_PORT..."
MOCK_SERVICE_URL="$MOCK_URL" npx nest start &
MCP_PID=$!
sleep 4

echo "Starting tunnel for MCP Server..."
cloudflared tunnel --url "http://localhost:$MCP_PORT" > /tmp/cf-mcp.log 2>&1 &
CF_MCP_PID=$!

echo "Waiting for MCP Server tunnel..."
MCP_URL=$(wait_for_tunnel_url /tmp/cf-mcp.log)

if [ -z "$MCP_URL" ]; then
  echo "Error: Could not get cloudflared URL for MCP Server after 30s."
  echo "Log output:"
  cat /tmp/cf-mcp.log
  cleanup
fi

echo ""
echo "================================================"
echo "  All services running!"
echo ""
echo "  Mock Service:  $MOCK_URL"
echo "  MCP Server:    $MCP_URL"
echo "  MCP Endpoint:  $MCP_URL/mcp"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop all services."

wait
