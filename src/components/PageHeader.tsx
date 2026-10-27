import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  aside?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  aside,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__content">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__description">{description}</p>
        {children && <div className="page-header__actions">{children}</div>}
      </div>
      {aside && <div className="page-header__aside">{aside}</div>}
    </header>
  );
}
