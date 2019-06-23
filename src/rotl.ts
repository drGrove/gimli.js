export function rotl32(x: number, y: number): number {
  // Tell v8 these are unsigned integers
  x = x >>> 0;
  y = y & 31;
  // left shift returns signed 32 bit integers, used a zero-fill right shift by
  // zero will cast to unsiged 32 bit integer
  return (((x << y) >>> 0) | (x >>> (32-y))) >>> 0;
}
