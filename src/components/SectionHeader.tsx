import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  id,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header__content">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-header__title" id={id}>
          {title}
        </h2>
        {description && (
          <p className="section-header__description">{description}</p>
        )}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </div>
  );
}
