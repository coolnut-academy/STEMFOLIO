import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Select } from '@/components/ui/Select';
import { DashboardFilters } from '@/lib/firestore/dashboard';
import { getCategories } from '@/lib/firestore/settings';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface FilterBarProps {
  onFilterChange: (filters: DashboardFilters) => void;
}

export const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const [dateRangeMode, setDateRangeMode] = useState('all');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    getCategories().then(setCategories);

    const fetchYears = async () => {
      const snap = await getDocs(collection(db, 'projects'));
      const yrSet = new Set<string>();
      snap.docs.forEach(doc => {
        const y = doc.data().academicYear;
        if (y) yrSet.add(y);
      });
      setYears(Array.from(yrSet).sort().reverse());
    };
    fetchYears();
  }, []);

  useEffect(() => {
    const filters: DashboardFilters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (academicYear) filters.academicYear = academicYear;

    if (dateRangeMode === 'thisMonth') {
      const start = new Date();
      start.setDate(1);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23,59,59,999);
      filters.dateRange = { start, end };
    } else if (dateRangeMode === 'thisYear') {
      const start = new Date();
      start.setMonth(0, 1);
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setMonth(11, 31);
      end.setHours(23,59,59,999);
      filters.dateRange = { start, end };
    }

    onFilterChange(filters);
  }, [dateRangeMode, category, status, academicYear, onFilterChange]);

  return (
    <GlassCard className="p-4 sticky top-4 z-20 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {(['all', 'thisMonth', 'thisYear'] as const).map((mode) => {
          const labels = { all: 'ทั้งหมด', thisMonth: 'เดือนนี้', thisYear: 'ปีนี้' };
          const active = dateRangeMode === mode;
          return (
            <button
              type="button"
              key={mode}
              className={`px-4 py-2 text-sm rounded-xl whitespace-nowrap transition-all duration-150 font-medium ${
                active
                  ? 'bg-[rgba(99,102,241,0.20)] border border-[rgba(99,102,241,0.35)] text-[#c7d2fe]'
                  : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/60 hover:text-white/85 hover:bg-[rgba(255,255,255,0.08)]'
              }`}
              onClick={() => setDateRangeMode(mode)}
            >
              {labels[mode]}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Select
          value={category}
          onChange={e => setCategory(e.target.value)}
          options={[{label: 'ทุกหมวดหมู่', value: ''}, ...categories.map(c => ({label: c, value: c}))]}
        />
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          options={[
            {label: 'ทุกสถานะ', value: ''},
            {label: 'ดำเนินการ', value: 'active'},
            {label: 'จัดเก็บแล้ว', value: 'archived'},
          ]}
        />
        <Select
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          options={[{label: 'ทุกปีการศึกษา', value: ''}, ...years.map(y => ({label: `ปี ${y}`, value: y}))]}
        />
      </div>
    </GlassCard>
  );
};
