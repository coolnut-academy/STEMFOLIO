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
  
  // Format Date to YYYY-MM-DD for input type="date"
  const formattedDate = value ? value.toISOString().split('T')[0] : '';

  useEffect(() => {
    if (value !== null) {
      setIsUnknown(false);
    } else if (allowUnknown && !isUnknown) {
      // If value is null and allowUnknown is true, but isUnknown is false, we should keep it false or adjust.
      // Usually handled by user interaction.
    }
  }, [value, allowUnknown, isUnknown]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsUnknown(checked);
    if (checked) {
      onChange(null);
    } else {
      onChange(new Date()); // fallback to today when unchecking
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(new Date(e.target.value));
      if (isUnknown) setIsUnknown(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
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
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isUnknown} 
              onChange={handleCheckboxChange}
              className="rounded border-gray-300 text-[var(--accent-blue)] focus:ring-[var(--accent-blue)]"
            />
            ยังไม่ทราบวันที่
          </label>
        )}
      </div>
    </div>
  );
};
