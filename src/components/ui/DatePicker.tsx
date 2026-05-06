"use client";

import React, { useState, useEffect } from 'react';
import { Input } from './Input';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  allowUnknown?: boolean;
  error?: string;
}

export const DatePicker = ({ label, value, onChange, allowUnknown = false, error }: DatePickerProps) => {
  const [isUnknown, setIsUnknown] = useState(value === null && allowUnknown);
  const formattedDate = value ? value.toISOString().split('T')[0] : '';

  useEffect(() => {
    if (value !== null) setIsUnknown(false);
  }, [value]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsUnknown(checked);
    onChange(checked ? null : new Date());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(new Date(e.target.value));
      setIsUnknown(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <Input
          type="date"
          value={isUnknown ? '' : formattedDate}
          onChange={handleDateChange}
          disabled={isUnknown}
          error={error}
          className="flex-1"
        />
        {allowUnknown && (
          <label className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={isUnknown}
              onChange={handleCheckboxChange}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 accent-[#0066FF]"
            />
            ยังไม่ทราบ
          </label>
        )}
      </div>
    </div>
  );
};
