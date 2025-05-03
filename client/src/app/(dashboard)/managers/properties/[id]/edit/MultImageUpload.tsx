import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";
interface MultiImageUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFileTypes?: string[];
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  files,
  setFiles,
  maxFiles = 10,
  maxSizeInMB = 5,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Reset errors
      setErrors([]);

      // Handle file rejections
      const fileErrors: string[] = [];
      rejectedFiles.forEach((rejection) => {
        rejection.errors.forEach((error: any) => {
          if (error.code === "file-too-large") {
            fileErrors.push(
              `${rejection.file.name} is larger than ${maxSizeInMB}MB`
            );
          } else if (error.code === "file-invalid-type") {
            fileErrors.push(
              `${rejection.file.name} is not a supported image type`
            );
          } else {
            fileErrors.push(`${rejection.file.name}: ${error.message}`);
          }
        });
      });

      if (fileErrors.length > 0) {
        setErrors(fileErrors);
        return;
      }

      // Check if adding new files would exceed the max files limit
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum of ${maxFiles} files allowed`);
        return;
      }

      // Create preview URLs for all files
      const newFiles = acceptedFiles.map((file) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
      });

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files, maxFiles, maxSizeInMB, setFiles]
  );

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxSize: maxSizeInBytes,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop the files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-gray-500">
              or click to browse (max. {maxFiles} files, {maxSizeInMB}MB each)
            </p>
            <p className="text-xs text-gray-500">
              Accepted types: {acceptedFileTypes.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                The following errors occurred:
              </h3>
              <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            New Photos to Upload ({files.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                  {file.type.startsWith("image/") ? (
                    // <img
                    //   src={(file as any).preview || URL.createObjectURL(file)}
                    //   alt={`Preview ${index}`}
                    //   className="w-full h-full object-cover"
                    //   onLoad={() => {
                    //     // Free memory when image is loaded
                    //     if ((file as any).preview) {
                    //       URL.revokeObjectURL((file as any).preview);
                    //     }
                    //   }}
                    // />

                    <Image
                      src={(file as any).preview || URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      width={300} // You can adjust this
                      height={200} // You can adjust this
                      className="w-full h-full object-cover"
                      onLoad={() => {
                        if ((file as any).preview) {
                          URL.revokeObjectURL((file as any).preview);
                        }
                      }}
                      unoptimized // Required for object URLs since they are not static or remote
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
