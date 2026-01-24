'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';

const OTPInput = forwardRef(
  ({ length = 4, onComplete, className, error, disabled }, ref) => {
    const [otp, setOtp] = useState(Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
      // Only focus first field if not already filled (e.g. from paste)
      if (otp.every((d) => d === '')) {
        inputRefs.current[0]?.focus();
      }
    }, []);

    const handleChange = (index, value) => {
      // Only allow numeric input
      const numericValue = value.replace(/[^0-9]/g, '');
      if (!numericValue && value !== '') return;

      const newOtp = [...otp];
      // Take the last character if multiple are entered (some mobile keyboards)
      newOtp[index] = numericValue.slice(-1);
      setOtp(newOtp);

      // Focus next input
      if (newOtp[index] && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Trigger complete only if all fields are filled
      if (newOtp.every((digit) => digit !== '')) {
        onComplete?.(newOtp.join(''));
      }
    };

    const handleKeyDown = (index, e) => {
      // Backspace to previous input
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData('text')
        .replace(/[^0-9]/g, '')
        .slice(0, length);
      if (!pastedData) return;

      const newOtp = [...otp];
      pastedData.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);

      const lastFilledIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();

      if (newOtp.every((digit) => digit !== '')) {
        onComplete?.(newOtp.join(''));
      }
    };

    return (
      <div className={cn('flex justify-center gap-2 sm:gap-4', className)} ref={ref}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              'h-12 w-10 rounded-xl border-2 text-center text-xl font-bold transition-all outline-none sm:h-14 sm:w-12',
              'bg-background text-foreground border-muted focus:border-primary focus:ring-primary/10 focus:ring-4',
              error &&
                'border-destructive focus:border-destructive focus:ring-destructive/10',
              disabled && 'cursor-not-allowed opacity-50 grayscale-[0.5]'
            )}
            autoComplete="one-time-code"
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';

export { OTPInput };
