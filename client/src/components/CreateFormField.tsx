"use client"

import type React from "react"
import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "@/components/ui/multi-select"

interface Option {
  value: string
  label: string
}

interface CustomFormFieldProps {
  name: string
  label?: string
  placeholder?: string
  type?: "text" | "number" | "email" | "password" | "textarea" | "select" | "switch" | "file" | "multi-select" | "date"
  options?: Option[]
  className?: string
  labelClassName?: string
  inputClassName?: string
  min?: number
  max?: number
  accept?: string
  multiple?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  render?: (field: any) => React.ReactNode
}

export const CreateFormField: React.FC<CustomFormFieldProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  options = [],
  className = "",
  labelClassName = "",
  inputClassName = "",
  min,
  max,
  accept,
  multiple,
  onChange,
  render,
  ...props
}) => {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel className={labelClassName}>{label}</FormLabel>}
          <FormControl>
            {render ? (
              render(field)
            ) : type === "textarea" ? (
              <Textarea {...field} placeholder={placeholder} className={inputClassName} {...props} />
            ) : type === "select" ? (
              <Select onValueChange={field.onChange} defaultValue={field.value} {...props}>
                <SelectTrigger className={`${inputClassName} bg-[#0B1120] text-white`}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-[#0B1120] border-[#1E2A45] text-white">
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-[#1E2A45]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "switch" ? (
              <div className="flex items-center space-x-2">
                <Switch checked={field.value} onCheckedChange={field.onChange} {...props} />
                <span className="text-sm text-gray-400">{field.value ? "Yes" : "No"}</span>
              </div>
            ) : type === "multi-select" ? (
              <MultiSelect
                options={options}
                selected={field.value || []}
                onChange={field.onChange}
                className={inputClassName}
                {...props}
              />
            ) : type === "file" ? (
              <Input
                type="file"
                onChange={(e) => {
                  field.onChange(e.target.files)
                  if (onChange) onChange(e)
                }}
                accept={accept}
                multiple={multiple}
                className={inputClassName}
                {...props}
              />
            ) : type === "number" ? (
              // Special handling for number inputs to ensure proper conversion
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={inputClassName}
                min={min}
                max={max}
                onChange={(e) => {
                  // Convert empty string to 0 or the string value to a number
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  field.onChange(value);
                  if (onChange) onChange(e);
                }}
                {...props}
              />
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className={inputClassName}
                min={min}
                max={max}
                {...props}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}