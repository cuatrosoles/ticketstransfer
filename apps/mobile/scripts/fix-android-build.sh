#!/usr/bin/env bash
# Limpia caché de Gradle corrupta y el build del proyecto para que el próximo pnpm android funcione.
# Uso: desde apps/mobile ejecutar: ./scripts/fix-android-build.sh  o  pnpm run fix:android

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GRADLE_CACHE="${GRADLE_USER_HOME:-$HOME/.gradle}/caches"

echo "[fix-android-build] Deteniendo daemons de Gradle..."
cd "$MOBILE_ROOT/android"
./gradlew --stop 2>/dev/null || true

echo "[fix-android-build] Eliminando caché de transforms (evita checkDebugAarMetadata / metadata.bin)..."
rm -rf "$GRADLE_CACHE/transforms-4"

echo "[fix-android-build] Limpiando build del proyecto Android..."
./gradlew clean --no-daemon || true

echo "[fix-android-build] Listo. Ejecutá: pnpm android"
