import { cn } from '@/lib/cn';

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'border-border bg-card text-card-foreground rounded-xl border shadow-sm',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-xl leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
export default Card;
