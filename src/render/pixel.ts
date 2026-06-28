/** 4-bit greyscale bitmap for G2 image containers (288×144). */
export function createBitmap(w: number, h: number): Uint8Array {
  const rowBytes = Math.ceil(w / 2)
  return new Uint8Array(rowBytes * h)
}

export function setPixel(buf: Uint8Array, w: number, x: number, y: number, level: number): void {
  const rowBytes = Math.ceil(w / 2)
  const idx = y * rowBytes + Math.floor(x / 2)
  const nibble = level & 0x0f
  if (x % 2 === 0) buf[idx] = (buf[idx] & 0x0f) | (nibble << 4)
  else buf[idx] = (buf[idx] & 0xf0) | nibble
}

export function fill(buf: Uint8Array, w: number, h: number, level: number): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) setPixel(buf, w, x, y, level)
  }
}

export function drawCircle(
  buf: Uint8Array,
  w: number,
  cx: number,
  cy: number,
  r: number,
  level: number,
  fillCircle = false,
): void {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) {
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (fillCircle ? d <= r : Math.abs(d - r) < 1.2) {
        if (x >= 0 && y >= 0 && x < w) setPixel(buf, w, x, y, level)
      }
    }
  }
}

export function drawRect(
  buf: Uint8Array,
  w: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  level: number,
): void {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x >= 0 && y >= 0 && x < w) setPixel(buf, w, x, y, level)
    }
  }
}
