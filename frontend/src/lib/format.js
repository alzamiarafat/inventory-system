export function money(cents) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function secondsLeft(expiresAt, nowMs) {
  const ms = new Date(expiresAt).getTime() - nowMs;
  return Math.max(0, Math.ceil(ms / 1000));
}
