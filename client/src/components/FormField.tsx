import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, X, Plus } from "lucide-react";
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import Image from "next/image";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "textarea"
    | "number"
    | "select"
    | "switch"
    | "password"
    | "file"
    | "multi-input"
    | "multi-select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  value?: string;
  disabled?: boolean;
  multiple?: boolean;
  isIcon?: boolean;
  initialValue?: string | number | boolean | string[];
  min?: number;
  max?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  render?: (props: { field: any }) => React.ReactNode;
}

export const CustomFormField = ({
  name,
  label,
  type = "text",
  options = [],
  ...props
}: FormFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={props.labelClassName}>{label}</FormLabel>
          <FormControl>
            {type === "select" ? (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={props.disabled}
              >
                <SelectTrigger className={props.className}>
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "multi-select" ? (
              <div>
                <Select
                  onValueChange={(value) => {
                    const currentValues = Array.isArray(field.value)
                      ? field.value
                      : [];
                    if (currentValues.includes(value)) {
                      field.onChange(
                        currentValues.filter((v: string) => v !== value)
                      );
                    } else {
                      field.onChange([...currentValues, value]);
                    }
                  }}
                  disabled={props.disabled}
                >
                  <SelectTrigger className={props.className}>
                    <SelectValue placeholder={`Select ${label}`}>
                      {Array.isArray(field.value) && field.value.length > 0
                        ? `${field.value.length} selected`
                        : `Select ${label}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={
                          Array.isArray(field.value) &&
                          field.value.includes(option.value)
                            ? "bg-primary-500/20"
                            : ""
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((value: string) => (
                      <div
                        key={value}
                        className="flex items-center gap-1 bg-primary-500/20 text-primary-700 px-2 py-1 rounded-md"
                      >
                        <span>
                          {options.find((opt) => opt.value === value)?.label ||
                            value}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(
                              field.value.filter((v: string) => v !== value)
                            );
                          }}
                          className="text-primary-700 hover:text-primary-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : type === "number" ? (
              <Input
                {...field}
                {...props}
                type="number"
                className={props.inputClassName}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : Number(e.target.value);
                  field.onChange(value);
                }}
              />
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                {...props}
                onChange={(e) => field.onChange(e.target.value)}
                className={props.inputClassName}
              />
            ) : type === "switch" ? (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={props.disabled}
                className={props.inputClassName}
              />
            ) : type === "file" ? (
              <div className="space-y-4">
                <FilePond
                  files={field.value}
                  onupdatefiles={(fileItems) => {
                    const files = fileItems.map((fileItem) => fileItem.file);
                    field.onChange(files);
                  }}
                  allowMultiple={true}
                  maxFiles={10}
                  name="files"
                  labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
                  credits={false}
                  acceptedFileTypes={["image/*"]}
                />
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {field.value.map((file: File, index: number) => (
                      <div key={index} className="relative group">
                        {/* <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        /> */}

                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = [...field.value];
                            newFiles.splice(index, 1);
                            field.onChange(newFiles);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Input
                type={type}
                {...field}
                {...props}
                className={props.inputClassName}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
  inputClassName?: string;
}

export const MultiInputField: React.FC<MultiInputFieldProps> = ({
  name,
  control,
  placeholder,
  inputClassName,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className={`flex-1 border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
                />
              </FormControl>
            )}
          />
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="icon"
            className="text-customgreys-dirtyGrey"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append("")}
        variant="outline"
        size="sm"
        className="mt-2 text-customgreys-dirtyGrey"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};
