import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../data/mockData';
import {
  validateAmount,
  validateDescription,
  validateDate,
  validateMerchant,
} from '../../utils/validations';
import type { Transaction, TransactionType } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: (saved?: boolean, action?: 'add' | 'edit') => void;
  transaction?: Transaction | null;
  /** Optional pre-fill values (from bill upload) */
  prefill?: Partial<{ description: string; amount: string; date: string; merchant: string; category: string; type: TransactionType }>;
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

function inputClass(hasError: boolean, hasWarning = false) {
  return `w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
    ${hasError
      ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
      : hasWarning
        ? 'border-yellow-400 dark:border-yellow-500 focus:ring-yellow-400'
        : 'border-gray-200 dark:border-gray-700'}`;
}

export function TransactionModal({ isOpen, onClose, transaction, prefill }: TransactionModalProps) {
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!transaction;

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setForm({
          date: transaction.date,
          amount: String(transaction.amount),
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          merchant: transaction.merchant ?? '',
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          ...(prefill ?? {}),
          category: prefill?.category ?? (prefill?.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        });
      }
      setErrors({});
      setWarnings({});
      setTouched({});
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen, transaction, prefill]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const validateField = (field: string, value: string) => {
    let error: string | null = null;
    let warning: string | null = null;

    if (field === 'description') error = validateDescription(value);
    if (field === 'amount') error = validateAmount(value);
    if (field === 'date') {
      error = validateDate(value);
      // Warn on dates more than 1 year ago (not an error, just informational)
      if (!error && value) {
        const d = new Date(value + 'T00:00:00');
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (d < oneYearAgo) warning = 'This date is over a year ago — is that correct?';
      }
    }
    if (field === 'merchant') error = validateMerchant(value);

    setErrors(prev => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
    setWarnings(prev => {
      const next = { ...prev };
      if (warning) next[field] = warning;
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
    // Normalize amount to 2 decimal places on blur
    const num = Number(form.amount);
    if (!isNaN(num) && num > 0) {
      setForm(f => ({ ...f, amount: num.toFixed(2) }));
    }
    validateField('amount', form.amount);
  };

  const validateAll = (): boolean => {
    const fields: Record<string, string> = {
      description: form.description,
      amount: form.amount,
      date: form.date,
      merchant: form.merchant,
    };
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
    // Mark all fields as touched
    setTouched({ description: true, amount: true, date: true, merchant: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const data: Transaction = {
      id: transaction?.id ?? generateId(),
      date: form.date,
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      description: form.description.trim(),
      merchant: form.merchant.trim() || undefined,
    };

    if (isEdit) {
      updateTransaction(data.id, data);
      onClose(true, 'edit');
    } else {
      addTransaction(data);
      onClose(true, 'add');
    }
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const hasErrors = Object.keys(errors).length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onClose()} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={() => onClose()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
              ref={firstInputRef}
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
              {errors.description && touched.description
                ? <FieldError message={errors.description} />
                : <span />}
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
                {touched.date && !errors.date && !warnings.date && form.date && (
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
                className={inputClass(!!errors.date && touched.date, !!warnings.date && touched.date)}
              />
              {errors.date && touched.date && <FieldError message={errors.date} />}
              {!errors.date && warnings.date && touched.date && (
                <p className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {warnings.date}
                </p>
              )}
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

          {/* Merchant (optional) */}
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

          {/* Form-level error summary (only shown on submit attempt) */}
          {hasErrors && Object.values(touched).some(Boolean) && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">Please fix the errors above before saving.</p>
            </div>
          )}

          {/* Actions */}
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
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
