import type { ValueTransformer } from 'typeorm';

/**
 * pg returns NUMERIC columns as strings to avoid float precision loss.
 * Money and rating values here never need that precision, so convert back.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};
