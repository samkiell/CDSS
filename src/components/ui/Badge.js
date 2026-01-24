import { cn } from '@/lib/cn';

const badgeVariants = {
  variant: {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-muted text-muted-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-border text-foreground bg-transparent',
  },
};

function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export default Badge;
