import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

function buttonClass(
  variant: ButtonVariant,
  size: ButtonSize,
  className: string | undefined,
): string {
  return ['btn', `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: BaseButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  ...rest
}: BaseButtonProps &
  Omit<LinkProps, 'to' | 'children' | 'className'> & { to: string }) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
