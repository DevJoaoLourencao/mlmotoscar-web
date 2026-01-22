import React from 'react';
import { cn } from './ui/core';

interface AdminPageContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export const AdminPageContainer = ({ children, className }: AdminPageContainerProps) => (
  <div className={cn("space-y-6 animate-fade-in-up", className)}>
    {children}
  </div>
);

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const AdminPageHeader = ({ title, description, actions }: AdminPageHeaderProps) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
    <div>
       <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
       {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    {actions && (
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
            {actions}
        </div>
    )}
  </div>
);