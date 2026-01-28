'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

const TabsContext = React.createContext(null);

const Tabs = React.forwardRef(
  ({ className, value, defaultValue, onValueChange, ...props }, ref) => {
    const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedTab(value);
      }
    }, [value]);

    const handleValueChange = React.useCallback(
      (newValue) => {
        if (value === undefined) {
          setSelectedTab(newValue);
        }
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      [onValueChange, value]
    );

    return (
      <TabsContext.Provider
        value={{ value: selectedTab, onValueChange: handleValueChange }}
      >
        <div ref={ref} className={cn('w-full', className)} {...props} />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => context?.onValueChange(value)}
      className={cn(
        'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
