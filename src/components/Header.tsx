import { useEffect, useRef, useState } from 'react';
import { LibraryBig, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../lib/constants';
import { useLibrary } from '../hooks/useLibrary';
import { Logo } from './Logo';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `main-nav__link${isActive ? ' is-active' : ''}`;
}

export function Header() {
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const { counts } = useLibrary();
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const open = menuPath === location.pathname;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusables?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuPath(null);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !focusables || focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand">
          <Logo showTagline />
        </Link>

        <nav className="main-nav" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={navLinkClass}
            >
              {item.to === '/biblioteca' ? (
                <>
                  <LibraryBig size={17} aria-hidden="true" />
                  <span>{item.label}</span>
                  {counts.total > 0 && (
                    <span className="nav-badge" aria-hidden="true">
                      {counts.total}
                    </span>
                  )}
                </>
              ) : (
                item.label
              )}
            </NavLink>
          ))}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="mobile-toggle"
          onClick={() => setMenuPath(open ? null : location.pathname)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? (
            <X size={24} aria-hidden="true" />
          ) : (
            <Menu size={24} aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          <button
            type="button"
            className="mobile-nav__backdrop"
            aria-label="Fechar menu"
            onClick={() => setMenuPath(null)}
          />
          <div className="mobile-nav__panel" id="menu-mobile" ref={panelRef}>
            <div className="mobile-nav__header">
              <Logo compact />
              <button
                type="button"
                className="mobile-nav__close"
                onClick={() => {
                  setMenuPath(null);
                  toggleRef.current?.focus();
                }}
                aria-label="Fechar menu"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Navegação móvel">
              <ul className="mobile-nav__list">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `mobile-nav__link${isActive ? ' is-active' : ''}`
                      }
                      onClick={() => setMenuPath(null)}
                    >
                      <span>{item.label}</span>
                      {item.to === '/biblioteca' && (
                        <span className="mobile-nav__count">
                          {counts.total}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mobile-nav__footer">
              <p>
                Sua biblioteca fica salva neste navegador, sem necessidade de
                conta.
              </p>
              <Link
                to="/explorar"
                className="btn btn--primary btn--md"
                onClick={() => setMenuPath(null)}
              >
                Explorar livros
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
