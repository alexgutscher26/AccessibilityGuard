"use client";

import { Input } from "@/components/ui/input";

interface URLInputProps {
  url: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function URLInput({ url, onChange, disabled }: URLInputProps) {
  return (
    <Input
      type="url"
      placeholder="Enter website URL (e.g., https://example.com)"
      value={url}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="flex-1"
    />
  );
}