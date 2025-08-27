import React, { useState } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = 'm',
}: SliderInputProps) {
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsInvalid(false);
    onChange(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (newValue < min || newValue > max) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) {
      newValue = min;
    }
    if (newValue < min) {
      newValue = min;
    }
    if (newValue > max) {
      newValue = max;
    }
    setIsInvalid(false);
    onChange(newValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center space-x-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="relative">
          <input
            type="number"
            step={step}
            value={value.toFixed(2)}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-24 rounded-md border-gray-300 text-center ${isInvalid ? 'border-red-500' : ''}`}
          />
          {unit && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              {unit}
            </span>
          )}
        </div>
      </div>
      {isInvalid && (
        <p className="mt-1 text-xs text-red-600">
          Value must be between {min} and {max}.
        </p>
      )}
    </div>
  );
}
