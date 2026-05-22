import { ReactNode, type HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Basic glass card component
export function GlassCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-8 shadow-xl shadow-blue-900/5 transition-all group hover:bg-white/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
