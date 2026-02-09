import type { FieldValidator } from "@/hooks/useValidatedForm";

const isEmpty = (value: unknown) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const required =
  <TValues, TValue = any>(message = "This field is required"): FieldValidator<TValues, TValue> =>
  (value) =>
    isEmpty(value) ? message : null;

export const email =
  <TValues>(message = "Enter a valid email"): FieldValidator<TValues, string> =>
  (value) => {
    if (!value) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : message;
  };

export const minLength =
  <TValues>(min: number, message?: string): FieldValidator<TValues, string> =>
  (value) => {
    if (!value) return null;
    return value.trim().length < min ? message ?? `Must be at least ${min} characters` : null;
  };

export const nonNegativeNumber =
  <TValues>(message = "Value must be 0 or greater"): FieldValidator<TValues, string | number> =>
  (value) => {
    if (value === undefined || value === null || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) return "Enter a valid number";
    return numeric < 0 ? message : null;
  };

export const positiveNumber =
  <TValues>(message = "Value must be greater than 0"): FieldValidator<TValues, string | number> =>
  (value) => {
    if (value === undefined || value === null || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) return "Enter a valid number";
    return numeric <= 0 ? message : null;
  };

export const arrayMin =
  <TValues, TValue = any>(min: number, message: string): FieldValidator<TValues, TValue[]> =>
  (value) =>
    Array.isArray(value) && value.length < min ? message : null;

export const url =
  <TValues>(message = "Enter a valid URL"): FieldValidator<TValues, string> =>
  (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  };

export const hourlyRateString =
  <TValues>(message = "Enter a valid hourly rate"): FieldValidator<TValues, string> =>
  (value) => {
    if (!value) return message;
    const numberMatches = value
      .trim()
      .match(/([0-9]+(?:\.[0-9]+)?)/g)
      ?.map(Number) || [];

    if (numberMatches.length === 0) return message;
    if (numberMatches.length === 1) return numberMatches[0] > 0 ? null : message;

    const [low, high] = numberMatches;
    if (low <= 0 || high <= 0 || high < low) return message;
    return null;
  };
