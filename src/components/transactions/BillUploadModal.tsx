import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, FileText, ImageIcon, Table, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { parseExcelFile } from '../../utils/billParser';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../data/mockData';
import {
  validateAmount,
  validateDescription,
  validateDate,
  validateMerchant,
} from '../../utils/validations';
import type { Transaction, TransactionType } from '../../types';

type FileKind = 'image' | 'pdf' | 'excel' | null;

interface BillUploadModalProps {
  isOpen: boolean;
  onClose: (saved?: boolean) => void;
}

function generateId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  type: 'expense' as TransactionType,
  category: 'Food',
  description: '',
  merchant: '',
};

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
    ${hasError
      ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
      : 'border-gray-200 dark:border-gray-700'}`;
}

function detectFileKind(file: File): FileKind {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel' ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls')
  ) return 'excel';
  return null;
}

export function BillUploadModal({ isOpen, onClose }: BillUploadModalProps) {
  const addTransaction = useStore((s) => s.addTransaction);
  const addToast = useStore((s) => s.addToast);

  const [file, setFile] = useState<File | null>(null);
  const [fileKind, setFileKind] = useState<FileKind>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [excelRows, setExcelRows] = useState<Record<string, string>[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL on unmount / file change
  useEffect(() => {
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [objectUrl]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setFile(null);
      setFileKind(null);
      setObjectUrl(null);
      setParseError(null);
      setParsing(false);
      setExcelRows([]);
      setExcelHeaders([]);
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const processFile = useCallback(async (f: File) => {
    const kind = detectFileKind(f);
    if (!kind) {
      setParseError('Unsupported file type. Please upload a JPG, PNG, PDF, XLSX, or XLS file.');
      return;
    }

    // Revoke any previous URL
    if (objectUrl) URL.revokeObjectURL(objectUrl);

    setFile(f);
    setFileKind(kind);
    setParseError(null);
    setExcelRows([]);
    setExcelHeaders([]);

    if (kind === 'image' || kind === 'pdf') {
      setObjectUrl(URL.createObjectURL(f));
    } else if (kind === 'excel') {
      setObjectUrl(null);
      setParsing(true);
      try {
        const result = await parseExcelFile(f);
        setExcelRows(result.rows);
        setExcelHeaders(result.headers);
        // Pre-fill form with detected values
        setForm(prev => ({
          ...prev,
          amount: result.suggestedAmount ?? prev.amount,
          date: result.suggestedDate ?? prev.date,
          description: result.suggestedDescription ?? prev.description,
          merchant: result.suggestedMerchant ?? prev.merchant,
        }));
        setErrors({});
        setTouched({});
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse Excel file.');
      } finally {
        setParsing(false);
      }
    }
  }, [objectUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const validateField = (field: string, value: string) => {
    let error: string | null = null;
    if (field === 'description') error = validateDescription(value);
    if (field === 'amount') error = validateAmount(value);
    if (field === 'date') error = validateDate(value);
    if (field === 'merchant') error = validateMerchant(value);

    setErrors(prev => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleAmountBlur = () => {
    setTouched(prev => ({ ...prev, amount: true }));
    const num = Number(form.amount);
    if (!isNaN(num) && num > 0) {
      setForm(f => ({ ...f, amount: num.toFixed(2) }));
    }
    validateField('amount', form.amount);
  };

  const validateAll = (): boolean => {
    const fields = { description: form.description, amount: form.amount, date: form.date, merchant: form.merchant };
    const newErrors: Record<string, string> = {};
    for (const [field, value] of Object.entries(fields)) {
      let err: string | null = null;
      if (field === 'description') err = validateDescription(value);
      if (field === 'amount') err = validateAmount(value);
      if (field === 'date') err = validateDate(value);
      if (field === 'merchant') err = validateMerchant(value);
      if (err) newErrors[field] = err;
    }
    setErrors(newErrors);
    setTouched({ description: true, amount: true, date: true, merchant: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const data: Transaction = {
      id: generateId(),
      date: form.date,
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      description: form.description.trim(),
      merchant: form.merchant.trim() || undefined,
    };

    addTransaction(data);
    addToast(`Transaction added from bill upload`, 'success');
    onClose(true);
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const hasErrors = Object.keys(errors).length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose()} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upload Bill</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">JPG, PNG, PDF, or Excel (.xlsx/.xls)</p>
          </div>
          <button onClick={() => onClose()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body: two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: drop zone / preview */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 overflow-hidden">
            {!file ? (
              <div
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all
                  ${isDragging
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isDragging ? 'Drop file here' : 'Click or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG, PDF, XLSX, XLS</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* File info bar */}
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  {fileKind === 'image' && <ImageIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                  {fileKind === 'pdf' && <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  {fileKind === 'excel' && <Table className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => { if (objectUrl) URL.revokeObjectURL(objectUrl); setFile(null); setFileKind(null); setObjectUrl(null); setExcelRows([]); setExcelHeaders([]); setParseError(null); }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* Preview area */}
                <div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  {parsing && (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span className="ml-2 text-sm text-gray-500">Parsing spreadsheet…</span>
                    </div>
                  )}
                  {parseError && (
                    <div className="h-full flex items-center justify-center p-4">
                      <div className="flex items-start gap-2 text-red-500">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs">{parseError}</p>
                      </div>
                    </div>
                  )}
                  {!parsing && !parseError && fileKind === 'image' && objectUrl && (
                    <img
                      src={objectUrl}
                      alt="Bill preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                  {!parsing && !parseError && fileKind === 'pdf' && objectUrl && (
                    <iframe
                      src={objectUrl}
                      title="PDF preview"
                      className="w-full h-full min-h-48"
                    />
                  )}
                  {!parsing && !parseError && fileKind === 'excel' && excelHeaders.length > 0 && (
                    <div className="overflow-auto h-full">
                      <table className="min-w-full text-xs">
                        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                          <tr>
                            {excelHeaders.map(h => (
                              <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap border-b border-gray-200 dark:border-gray-600">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {excelRows.map((row, i) => (
                            <tr key={i} className={`${i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} hover:bg-gray-100 dark:hover:bg-gray-700/50`}>
                              {excelHeaders.map(h => (
                                <td key={h} className="px-2 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap border-b border-gray-100 dark:border-gray-800">
                                  {row[h]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-xs text-gray-400 px-2 py-1.5">↑ First row is highlighted and used to pre-fill the form</p>
                    </div>
                  )}
                  {!parsing && !parseError && fileKind === 'excel' && excelHeaders.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-gray-400">No data rows found in spreadsheet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: transaction form */}
          <div className="w-1/2 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {fileKind === 'excel' && excelRows.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <Table className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">Form pre-filled from first spreadsheet row. Review before saving.</p>
                </div>
              )}
              {!file && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <Upload className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload a file on the left, then fill in the details below.</p>
                </div>
              )}

              {/* Type toggle */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {(['expense', 'income'] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const firstCat = t === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
                        setForm(f => ({ ...f, type: t, category: firstCat }));
                      }}
                      className={`flex-1 py-2 text-sm font-medium capitalize transition-all
                        ${form.type === t
                          ? t === 'expense' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description *</label>
                  {touched.description && !errors.description && form.description.trim() && (
                    <span className="text-xs text-emerald-500">✓</span>
                  )}
                </div>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => {
                    setForm(f => ({ ...f, description: e.target.value }));
                    if (touched.description) validateField('description', e.target.value);
                  }}
                  onBlur={(e) => handleBlur('description', e.target.value)}
                  placeholder="e.g. Grocery shopping"
                  maxLength={200}
                  className={inputClass(!!errors.description && touched.description)}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && touched.description ? <FieldError message={errors.description} /> : <span />}
                  <span className={`text-xs ml-auto ${form.description.length > 180 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {form.description.length}/200
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Amount *</label>
                    {touched.amount && !errors.amount && form.amount && (
                      <span className="text-xs text-emerald-500">✓</span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      min="0.01"
                      max="999999"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => {
                        setForm(f => ({ ...f, amount: e.target.value }));
                        if (touched.amount) validateField('amount', e.target.value);
                      }}
                      onBlur={handleAmountBlur}
                      placeholder="0.00"
                      className={`${inputClass(!!errors.amount && touched.amount)} pl-7`}
                    />
                  </div>
                  {errors.amount && touched.amount && <FieldError message={errors.amount} />}
                </div>

                {/* Date */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Date *</label>
                    {touched.date && !errors.date && form.date && (
                      <span className="text-xs text-emerald-500">✓</span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={form.date}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => {
                      setForm(f => ({ ...f, date: e.target.value }));
                      if (touched.date) validateField('date', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('date', e.target.value)}
                    className={inputClass(!!errors.date && touched.date)}
                  />
                  {errors.date && touched.date && <FieldError message={errors.date} />}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Merchant */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Merchant <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={form.merchant}
                  onChange={(e) => {
                    setForm(f => ({ ...f, merchant: e.target.value }));
                    if (touched.merchant) validateField('merchant', e.target.value);
                  }}
                  onBlur={(e) => handleBlur('merchant', e.target.value)}
                  placeholder="e.g. Whole Foods"
                  maxLength={100}
                  className={inputClass(!!errors.merchant && touched.merchant)}
                />
                {errors.merchant && touched.merchant && <FieldError message={errors.merchant} />}
              </div>

              {hasErrors && Object.values(touched).some(Boolean) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">Please fix the errors above before saving.</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors active:scale-95"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
