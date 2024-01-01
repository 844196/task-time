export function ceilManHour(hour: number, step: number = 0.5): number {
  const inv = 1 / step
  return Math.ceil(hour * inv) / inv
}
