import { cn } from '@/lib/cn';
import { Shield } from 'lucide-react';

function Logo({ className, size = 'default', showText = true }) {
  const sizes = {
    sm: { icon: 'h-8 w-8', text: 'text-lg' },
    default: { icon: 'h-12 w-12', text: 'text-2xl' },
    lg: { icon: 'h-16 w-16', text: 'text-3xl' },
    xl: { icon: 'h-20 w-20', text: 'text-4xl' },
  };

  const { icon, text } = sizes[size] || sizes.default;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative">
        <Shield className={cn('text-primary', icon)} strokeWidth={1.5} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn(
              'text-primary',
              size === 'sm'
                ? 'h-4 w-4'
                : size === 'lg'
                  ? 'h-8 w-8'
                  : size === 'xl'
                    ? 'h-10 w-10'
                    : 'h-6 w-6'
            )}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6v12M9 9c0-1 .5-2 3-2s3 1 3 2-.5 2-3 2-3 1-3 2 .5 2 3 2 3-1 3-2" />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={cn('text-foreground font-semibold', text)}>CDSS</span>
      )}
    </div>
  );
}

export { Logo };
