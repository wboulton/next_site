#!/usr/bin/env bash
# Shared by local runs and deployment so both use the same sandbox settings.
set -euo pipefail
repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
image=${1:-next-site:latest}
name=${2:-next-site}
port=${3:-3000}

apparmor_options=()
case $(docker info --format '{{json .SecurityOptions}}') in
  *name=apparmor*)
    # Load docker/apparmor.profile on the Docker host before launching.
    apparmor_options=(--security-opt apparmor=next-site-nsjail)
    ;;
esac

# systempaths=unconfined permits a fresh procfs in nsjail's PID namespace;
# the outer process remains UID 1000 with no capabilities.
exec docker run -d \
  --name "$name" \
  --restart unless-stopped \
  --user 1000:1000 \
  --cap-drop ALL \
  --security-opt no-new-privileges=true \
  --security-opt "seccomp=$repo_root/docker/seccomp.json" \
  --security-opt systempaths=unconfined \
  "${apparmor_options[@]}" \
  --read-only \
  --tmpfs /tmp:rw,nosuid,nodev,noexec,size=64m,mode=1777 \
  --memory 512m \
  --memory-swap 512m \
  --cpus 1 \
  --pids-limit 128 \
  --ulimit nofile=1024:1024 \
  -p "$port:3000" \
  "$image"
