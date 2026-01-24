import Image from 'next/image';
import { cn } from '@/lib/cn';

function Logo({ className, size = 'default', showText = true }) {
  const sizes = {
    sm: { image: 40, text: 'text-lg' },
    default: { image: 56, text: 'text-2xl' },
    lg: { image: 72, text: 'text-3xl' },
    xl: { image: 96, text: 'text-4xl' },
  };

  const { image, text } = sizes[size] || sizes.default;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="CDSS Logo"
        width={image}
        height={image}
        priority
        className="object-contain"
      />
      {showText && (
        <span className={cn('text-foreground font-semibold', text)}>CDSS</span>
      )}
    </div>
  );
}

export { Logo };
