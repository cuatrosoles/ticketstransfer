#!/usr/bin/env python3
"""
Genera src/assets/ticket-card-bg.png (RGBA, transparente fuera del ticket).
Reemplazá el archivo por el que exportes desde la IA manteniendo el mismo nombre, o actualizá el require en TicketStubBackground.
"""
from __future__ import annotations

import struct
import zlib
from pathlib import Path


def write_png(path: Path, w: int, h: int, rows: list[bytes]) -> None:
    raw = b"".join(b"\x00" + row for row in rows)
    z = zlib.compress(raw, 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", z) + chunk(b"IEND", b""))


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(a[0] + (b[0] - a[0]) * t),
        int(a[1] + (b[1] - a[1]) * t),
        int(a[2] + (b[2] - a[2]) * t),
    )


def ticket_inside(px: float, py: float, w: float, h: float, r: int, n: int) -> bool:
    m = h / 2.0
    nn = min(n, max(0, int(m - r - 3)))
    if nn < 3:
        nn = 0

    def rr() -> bool:
        if px < 0 or px > w or py < 0 or py > h:
            return False
        if px < r and py < r:
            return (px - r) ** 2 + (py - r) ** 2 <= r * r
        if px > w - r and py < r:
            return (px - (w - r)) ** 2 + (py - r) ** 2 <= r * r
        if px < r and py > h - r:
            return (px - r) ** 2 + (py - (h - r)) ** 2 <= r * r
        if px > w - r and py > h - r:
            return (px - (w - r)) ** 2 + (py - (h - r)) ** 2 <= r * r
        return True

    if not rr():
        return False
    if nn > 0:
        if (px - w) ** 2 + (py - m) ** 2 < nn * nn and px < w:
            return False
        if (px - 0) ** 2 + (py - m) ** 2 < nn * nn and px > 0:
            return False
    return True


def main() -> None:
    w, h = 540, 960
    r, notch = 22, 13
    top = hex_rgb("#2d4acb")
    mid = hex_rgb("#1e3a8a")
    bot = hex_rgb("#0f172a")
    hi = (120, 180, 255)  # brillo suave arriba-izquierda (overlay aprox)

    rows: list[bytes] = []
    for y in range(h):
        row = bytearray()
        t = y / max(h - 1, 1)
        base = lerp(lerp(top, mid, min(1.0, t * 1.2)), bot, max(0.0, ( t - 0.35) / 0.65))
        for x in range(w):
            px, py = x + 0.5, y + 0.5
            if not ticket_inside(px, py, float(w), float(h), r, notch):
                row.extend(b"\x00\x00\x00\x00")
                continue
            # Viñeta diagonal simple
            gx = x / max(w - 1, 1)
            glow = 0.12 * (1.0 - gx) * (1.0 - t)
            r_pix = min(255, int(base[0] + hi[0] * glow))
            g_pix = min(255, int(base[1] + hi[1] * glow))
            b_pix = min(255, int(base[2] + hi[2] * glow))
            row.extend(bytes([r_pix, g_pix, b_pix, 255]))
        rows.append(bytes(row))

    root = Path(__file__).resolve().parents[1]
    out = root / "src" / "assets" / "ticket-card-bg.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    write_png(out, w, h, rows)
    print("OK ->", out)


if __name__ == "__main__":
    main()
