export const STOCK_ALERT_THRESHOLD_KEY = "stockAlertThreshold";
export const DEFAULT_STOCK_ALERT_THRESHOLD = 5;
export const MIN_STOCK_ALERT_THRESHOLD = 1;
export const MAX_STOCK_ALERT_THRESHOLD = 9999;

export const clampStockAlertThreshold = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_STOCK_ALERT_THRESHOLD;
  return Math.min(
    MAX_STOCK_ALERT_THRESHOLD,
    Math.max(MIN_STOCK_ALERT_THRESHOLD, Math.trunc(value))
  );
};

export const getStockAlertThreshold = () => {
  if (typeof window === "undefined") return DEFAULT_STOCK_ALERT_THRESHOLD;

  const raw = window.localStorage.getItem(STOCK_ALERT_THRESHOLD_KEY);
  if (!raw) return DEFAULT_STOCK_ALERT_THRESHOLD;

  const parsed = Number(raw);
  return clampStockAlertThreshold(parsed);
};

export const setStockAlertThreshold = (value: number) => {
  if (typeof window === "undefined") return;

  const normalized = clampStockAlertThreshold(value);
  window.localStorage.setItem(STOCK_ALERT_THRESHOLD_KEY, String(normalized));
  window.dispatchEvent(new CustomEvent("stock-alert-threshold-updated"));
};
