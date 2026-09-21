import React from 'react';
import { SingleTestMeta } from '../../../types/singleTest';
import { Input } from '../../../components/ui/Input';
import { AlertCircle } from 'lucide-react';

interface TestDetailsPanelProps {
  meta: SingleTestMeta;
  onChange: (meta: SingleTestMeta) => void;
}

export function TestDetailsPanel({ meta, onChange }: TestDetailsPanelProps) {
  const isPassInvalid = meta.pass > meta.max;

  const handleChange = (key: keyof SingleTestMeta, value: string | number) => {
    onChange({
      ...meta,
      [key]: value,
    });
  };

  return (
    <div className="space-y-3.5">
      <Input
        label="Test Name"
        value={meta.testName}
        onChange={(e) => handleChange('testName', e.target.value)}
        placeholder="e.g. Core Java Assessment 1"
      />

      <Input
        label="College / Institute Name"
        value={meta.college}
        onChange={(e) => handleChange('college', e.target.value)}
        placeholder="e.g. CBIT Hyderabad"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Batch"
          value={meta.batch}
          onChange={(e) => handleChange('batch', e.target.value)}
          placeholder="e.g. 2024-2028"
        />
        <Input
          label="Test Date"
          type="date"
          value={meta.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Maximum Marks"
          type="number"
          min={1}
          step="any"
          value={meta.max}
          onChange={(e) => handleChange('max', parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Pass Mark"
          type="number"
          min={0}
          step="any"
          value={meta.pass}
          onChange={(e) => handleChange('pass', parseFloat(e.target.value) || 0)}
          error={isPassInvalid ? 'Pass mark cannot exceed max marks' : undefined}
        />
      </div>

      {isPassInvalid && (
        <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>The pass mark is higher than maximum marks. Please correct both values.</span>
        </div>
      )}

      <Input
        label="Prepared By (Optional)"
        value={meta.preparedBy}
        onChange={(e) => handleChange('preparedBy', e.target.value)}
        placeholder="e.g. Training & Placement Cell"
      />
    </div>
  );
}
