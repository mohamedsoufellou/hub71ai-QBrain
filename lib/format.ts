export function aed(value: number) {
  return `AED ${Math.round(value).toLocaleString("en-AE")}`;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
