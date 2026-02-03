export function formatMoney(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatRange(low?: number, high?: number) {
  if (low === undefined || high === undefined) return "—";
  return `${formatMoney(low)} - ${formatMoney(high)}`;
}
