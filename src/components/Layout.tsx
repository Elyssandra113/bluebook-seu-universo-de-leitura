import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { SkipLink } from './SkipLink';
import { Toaster } from './Toaster';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SkipLink />
      <Header />
      <main id="conteudo" className="site-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
