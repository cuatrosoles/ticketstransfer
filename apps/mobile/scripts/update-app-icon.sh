#!/bin/bash
# Regenera los iconos de la app desde el master 1024.png
# Requiere ImageMagick (convert o magick)
# Uso: ./scripts/update-app-icon.sh [ruta-al-1024.png]
# Por defecto usa ios/.../AppIcon.appiconset/1024.png

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

MASTER="${1:-ios/TTMobileTemp/Images.xcassets/AppIcon.appiconset/1024.png}"
if [[ ! -f "$MASTER" ]]; then
  echo "Error: No se encuentra $MASTER"
  exit 1
fi

CMD="convert"
if command -v magick &>/dev/null; then
  CMD="magick"
fi

echo "Regenerando iconos desde $MASTER..."

# iOS - todos los tamaños
IOS_DIR="ios/TTMobileTemp/Images.xcassets/AppIcon.appiconset"
for size in 16 20 29 32 40 48 50 55 57 58 60 64 66 72 76 80 87 88 92 100 102 108 114 120 128 144 152 167 172 180 196 216 234 256 258 512; do
  $CMD "$MASTER" -resize ${size}x${size} "$IOS_DIR/${size}.png" 2>/dev/null
done
echo "iOS: OK"

# Android
for dpi in mdpi:48 hdpi:72 xhdpi:96 xxhdpi:144 xxxhdpi:192; do
  size="${dpi#*:}"
  dir="android/app/src/main/res/mipmap-${dpi%:*}"
  $CMD "$MASTER" -resize ${size}x${size} "$dir/ic_launcher.png" 2>/dev/null
  $CMD "$MASTER" -resize ${size}x${size} "$dir/ic_launcher_round.png" 2>/dev/null
done
echo "Android: OK"

echo "Iconos actualizados."
