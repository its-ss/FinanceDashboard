import * as XLSX from 'xlsx';
import type { TransactionType } from '../types';

export interface ParsedBillData {
  suggestedAmount?: string;
  suggestedDate?: string;
  suggestedDescription?: string;
  suggestedMerchant?: string;
  suggestedType?: TransactionType;
  rows: Record<string, string>[];
  headers: string[];
}

/** Keyword lists for fuzzy column detection */
const AMOUNT_KEYWORDS = ['amount', 'price', 'total', 'cost', 'charge', 'fee', 'sum', 'value'];
const DATE_KEYWORDS = ['date', 'time', 'day', 'period', 'when'];
const DESC_KEYWORDS = ['description', 'desc', 'item', 'detail', 'notes', 'note', 'name', 'product', 'service', 'memo'];
const MERCHANT_KEYWORDS = ['merchant', 'vendor', 'store', 'supplier', 'from', 'payee', 'company'];

function findColumn(headers: string[], keywords: string[]): string | undefined {
  const lower = headers.map(h => h.toLowerCase().trim());
  for (const kw of keywords) {
    const idx = lower.findIndex(h => h.includes(kw));
    if (idx !== -1) return headers[idx];
  }
  return undefined;
}

/** Format an Excel serial date or date string to YYYY-MM-DD */
function parseExcelDate(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;

  // Numeric serial date (Excel)
  if (typeof raw === 'number') {
    const date = XLSX.SSF.parse_date_code(raw);
    if (!date) return undefined;
    const y = String(date.y).padStart(4, '0');
    const m = String(date.m).padStart(2, '0');
    const d = String(date.d).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // String date — try native parsing
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;

    // Try ISO or common formats
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }

    // Try MM/DD/YYYY or DD/MM/YYYY
    const parts = trimmed.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // Assume MM/DD/YYYY if first part ≤ 12
      if (Number(a) <= 12) {
        const attempt = new Date(`${c}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`);
        if (!isNaN(attempt.getTime())) return attempt.toISOString().slice(0, 10);
      }
    }
  }

  return undefined;
}

/** Clean and format an amount string to a numeric string */
function parseAmount(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;
  if (typeof raw === 'number') {
    return raw > 0 ? raw.toFixed(2) : undefined;
  }
  if (typeof raw === 'string') {
    // Strip currency symbols and commas
    const cleaned = raw.replace(/[$€£¥,\s]/g, '').trim();
    const num = Number(cleaned);
    if (!isNaN(num) && num > 0) return num.toFixed(2);
  }
  return undefined;
}

export function parseExcelFile(file: File): Promise<ParsedBillData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays (raw values)
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        if (raw.length === 0) {
          resolve({ rows: [], headers: [] });
          return;
        }

        const headers = Object.keys(raw[0]);

        // Detect columns
        const amountCol = findColumn(headers, AMOUNT_KEYWORDS);
        const dateCol = findColumn(headers, DATE_KEYWORDS);
        const descCol = findColumn(headers, DESC_KEYWORDS);
        const merchantCol = findColumn(headers, MERCHANT_KEYWORDS);

        // Convert all rows to string record for display
        const rows: Record<string, string>[] = raw.map(row =>
          Object.fromEntries(headers.map(h => [h, String(row[h] ?? '')]))
        );

        // Extract suggestions from first data row
        const first = raw[0];
        const suggestedAmount = amountCol ? parseAmount(first[amountCol]) : undefined;
        const suggestedDate = dateCol ? parseExcelDate(first[dateCol]) : undefined;
        const suggestedDescription = descCol ? String(first[descCol] ?? '').trim() || undefined : undefined;
        const suggestedMerchant = merchantCol ? String(first[merchantCol] ?? '').trim() || undefined : undefined;

        resolve({
          suggestedAmount,
          suggestedDate,
          suggestedDescription,
          suggestedMerchant,
          rows,
          headers,
        });
      } catch (err) {
        reject(new Error('Failed to parse Excel file. Ensure it is a valid .xlsx or .xls file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}
