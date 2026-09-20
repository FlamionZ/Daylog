import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          checked
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/40 bg-surface',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        {checked && <Check className="size-3 stroke-[3]" />}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
