#!/usr/bin/env bash
set -euo pipefail

V86_DIR="${V86_DIR:-$HOME/Repos/v86}"   # default: your local clone; override via env
OUT=public/alpine

docker build --platform linux/386 -t v86-alpine alpine-build/

# export the container's filesystem to a folder
sudo rm -rf build/rootfs
mkdir -p build/rootfs
CID=$(docker create --platform linux/386 v86-alpine)
docker export "$CID" | sudo tar -xf - -C build/rootfs
docker rm "$CID"

sudo rm -rf "$OUT"
mkdir -p "$OUT/rootfs-flat"
sudo python3 "$V86_DIR/tools/fs2json.py" --out "$OUT/base-fs.json" build/rootfs
sudo python3 "$V86_DIR/tools/copy-to-sha256.py" build/rootfs "$OUT/rootfs-flat"
sudo chown -R "$(id -u):$(id -g)" "$OUT"

# docker export blanks these, so write them after extraction
echo "revan" | sudo tee build/rootfs/etc/hostname >/dev/null
printf '127.0.0.1\tlocalhost revan\n::1\tlocalhost\n' | sudo tee build/rootfs/etc/hosts >/dev/null
