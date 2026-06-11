export function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(monthKey: string, delta: number): string {
  const [yearStr, monthStr] = monthKey.split("-").map(Number);
  if (!Number.isFinite(yearStr) || !Number.isFinite(monthStr)) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }
  const base = new Date(yearStr, monthStr - 1, 1);
  base.setMonth(base.getMonth() + delta);
  return formatMonthKey(base);
}

export function previousMonthKey(monthKey: string): string {
  return addMonths(monthKey, -1);
}

export function compareMonthKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function earlierMonthKey(a: string, b: string): string {
  return compareMonthKeys(a, b) <= 0 ? a : b;
}
