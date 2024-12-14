'use client';

import { Shield } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Shield className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        AccessibilityGuard
      </span>
    </div>
  );
}
