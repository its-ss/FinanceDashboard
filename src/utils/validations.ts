/** Returns an error string or null if valid */

export function validateAmount(value: string): string | null {
  if (!value.trim()) return 'Amount is required';
  const num = Number(value);
  if (isNaN(num)) return 'Enter a valid number';
  if (num <= 0) return 'Amount must be greater than 0';
  if (num > 999_999) return 'Amount cannot exceed $999,999';
  // Check max 2 decimal places
  if (/\.\d{3,}/.test(value)) return 'Maximum 2 decimal places';
  return null;
}

export function validateDescription(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Description is required';
  if (trimmed.length < 2) return 'At least 2 characters required';
  if (trimmed.length > 200) return 'Maximum 200 characters';
  return null;
}

export function validateDate(value: string): string | null {
  if (!value) return 'Date is required';
  const date = new Date(value + 'T00:00:00');
  if (isNaN(date.getTime())) return 'Invalid date';
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return 'Date cannot be in the future';
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  if (date < tenYearsAgo) return 'Date cannot be more than 10 years ago';
  return null;
}

export function validateMerchant(value: string): string | null {
  if (value.trim().length > 100) return 'Maximum 100 characters';
  return null;
}

export function validateBudgetLimit(value: string): string | null {
  if (!value.trim()) return null; // empty is allowed (clears limit)
  const num = Number(value);
  if (isNaN(num)) return 'Enter a valid number';
  if (num <= 0) return 'Must be greater than 0';
  if (num > 999_999) return 'Cannot exceed $999,999';
  return null;
}
