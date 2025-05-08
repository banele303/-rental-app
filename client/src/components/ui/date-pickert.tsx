// --- BEGIN FILE: @/components/ui/date-picker.tsx (Basic Placeholder) ---
// Replace this with your actual Shadcn/UI DatePicker or a similar component
import React from 'react';
import { Input } from '@/components/ui/input'; // Assuming Shadcn Input
import { Label } from '@/components/ui/label'; // Assuming Shadcn Label

interface DatePickerProps {
  label?: string;
  date: Date | null | undefined;
  onDateChange: (date: Date | null) => void;
  disabled?: boolean;
}

export const DatePickert: React.FC<DatePickerProps> = ({ label, date, onDateChange, disabled }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      // Ensure the date is parsed correctly, considering potential timezone issues
      // Parsing as YYYY-MM-DD assumes local timezone if time is not specified.
      // For consistency, you might want to handle dates as UTC.
      const [year, month, day] = value.split('-').map(Number);
      // Create date in UTC to avoid timezone shifts if backend expects UTC
      const selectedDate = new Date(Date.UTC(year, month - 1, day));
      onDateChange(selectedDate);
    } else {
      onDateChange(null);
    }
  };

  const formatDateForInput = (d: Date | null | undefined): string => {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return ""; // Check for invalid date
    // Format to YYYY-MM-DD for <input type="date">
    try {
        // Use UTC methods to format if the date was intended as UTC
        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = d.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date:", d, e);
        return ""; // Return empty string if date is invalid
    }
  };


  return (
    <div className="space-y-1 w-full">
      {label && <Label htmlFor={`date-picker-${label}`}>{label}</Label>}
      <Input
        id={`date-picker-${label}`}
        type="date"
        value={formatDateForInput(date)}
        onChange={handleChange}
        disabled={disabled}
        className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      />
    </div>
  );
};
// --- END FILE: @/components/ui/date-picker.tsx ---


