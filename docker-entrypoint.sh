#!/bin/bash
set -e

echo "[ZT] Starting ZeroTier..."
zerotier-one -d

sleep 5

if [ -n "$ZT_NETWORK" ]; then
  echo "[ZT] Joining network $ZT_NETWORK..."
  zerotier-cli join "$ZT_NETWORK"
fi

zerotier-cli info || true
zerotier-cli listnetworks || true

echo "[APP] Starting Node.js..."
exec npm run start
