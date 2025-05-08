// --- BEGIN FILE: @/components/CreateFormField.tsx ---
import React from 'react';
import { Controller, Control, FieldError, Path, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerDemo } from '@/components/ui/date-picker'; // Import your DatePicker
import { DatePickert } from './ui/date-pickert';

interface FormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'switch' | 'multi-select' | 'date';
  options?: { value: string | number; label: string }[];
  inputClassName?: string;
  labelClassName?: string;
  description?: string;
  min?: number;
}

export function CreateFormFieldt<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  options = [],
  inputClassName = "",
  labelClassName = "",
  description,
  min,
}: FormFieldProps<TFieldValues>) {
  return (
    <div className="space-y-1.5 w-full">
      <Label htmlFor={name} className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            {type === 'textarea' ? (
              <Textarea
                {...field}
                id={name}
                placeholder={placeholder}
                className={`mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${inputClassName} ${error ? 'border-destructive' : 'border-border dark:border-gray-600'}`}
              />
            ) : type === 'select' ? (
              <Select onValueChange={field.onChange} value={field.value as string} defaultValue={field.value as string}>
                <SelectTrigger id={name} className={`w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${inputClassName} ${error ? 'border-destructive' : 'border-border dark:border-gray-600'}`}>
                  <SelectValue placeholder={placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {options.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} className="dark:text-gray-200 dark:focus:bg-gray-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'switch' ? (
              <div className="flex items-center space-x-2 pt-1">
                <Switch id={name} checked={field.value as boolean} onCheckedChange={field.onChange} />
                {placeholder && <Label htmlFor={name} className="text-sm text-muted-foreground dark:text-gray-400">{placeholder}</Label>}
              </div>
            ) : type === 'multi-select' ? (
              <div className="space-y-2 pt-1">
                 {description && <p className="text-xs text-muted-foreground dark:text-gray-400 pb-1">{description}</p>}
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${name}-${option.value}`}
                      checked={(field.value as any[])?.includes(option.value as any)}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value as any[] || [];
                        if (checked) {
                          field.onChange([...currentValue, option.value]);
                        } else {
                          field.onChange(currentValue.filter((val) => val !== option.value));
                        }
                      }}
                      className="dark:border-gray-600 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor={`${name}-${option.value}`} className="font-normal dark:text-gray-300">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            ) : type === 'date' ? (
              <DatePickerDemo
                value={field.value as Date | null | undefined}
                onSelect={field.onChange}
                // disabled={field.disabled} // Pass disabled state if needed
              />
            ) : (
              <Input
                type={type}
                id={name}
                {...field}
                value={field.value ?? ''} // Ensure defined value, handle potential null/undefined from number coercion
                onChange={(e) => {
                    const val = e.target.value;
                    if (type === 'number') {
                        // Allow empty string for clearing, otherwise parse as float
                        // Use undefined for optional numbers if schema expects it, otherwise null or handle NaN
                        field.onChange(val === '' ? undefined : parseFloat(val));
                    } else {
                        field.onChange(val);
                    }
                }}
                placeholder={placeholder}
                min={min}
                className={`mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${inputClassName} ${error ? 'border-destructive' : 'border-border dark:border-gray-600'}`}
              />
            )}
            {/* Render description below input if not multi-select */}
            {description && type !== 'multi-select' && <p className="text-xs text-muted-foreground dark:text-gray-400 pt-1">{description}</p>}
            {error && <p className="text-xs text-destructive pt-1">{error.message}</p>}
          </>
        )}
      />
    </div>
  );
}