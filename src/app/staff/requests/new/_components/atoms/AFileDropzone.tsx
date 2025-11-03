/**
 * Atomic File Dropzone Component
 */

'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface AFileDropzoneProps {
  label?: string;
  error?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFilesChange?: (_files: File[]) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export const AFileDropzone: React.FC<AFileDropzoneProps> = ({
  label,
  error,
  helperText,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFilesChange,
  disabled,
  required,
  id,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropzoneId = id || `dropzone-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles = Array.from(fileList).filter((file) => {
      if (maxSize && file.size > maxSize) {
        alert(`${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    onFilesChange?.(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={dropzoneId} className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragOver && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          !isDragOver && !error && 'border-input hover:border-primary/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={inputRef}
          id={dropzoneId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
          aria-describedby={error ? `${dropzoneId}-error` : helperText ? `${dropzoneId}-helper` : undefined}
        />
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            📎 Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            {accept ? `Accepts: ${accept}` : 'All files accepted'} • Max {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="space-y-1 text-sm">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="ml-2 text-destructive hover:text-destructive/80"
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={`${dropzoneId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${dropzoneId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

AFileDropzone.displayName = 'AFileDropzone';
