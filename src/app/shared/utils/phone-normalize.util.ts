export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  return `+${digits}`;
}
