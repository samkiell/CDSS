'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const DropdownMenu = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(false);

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return;
    const handleOutsideClick = () => setOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left" {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent immediate closing from the window listener
    setOpen(!open);
  };

  return (
    <div ref={ref} className="cursor-pointer" onClick={handleClick} {...props}>
      {children}
    </div>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(
  ({ className, children, align = 'end', ...props }, ref) => {
    const { open } = React.useContext(DropdownMenuContext);

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-popover text-popover-foreground animate-in fade-in zoom-in-95 absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-[1.5rem] border p-2 shadow-2xl transition-all',
          align === 'end' ? 'right-0' : 'left-0',
          className
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    const handleClick = (e) => {
      if (onClick) onClick(e);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex cursor-pointer items-center rounded-xl px-4 py-2 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          inset && 'pl-8',
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
