import { useEffect } from 'react';

const BASE_TITLE = 'BlueBook — Seu Universo de Leitura';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · BlueBook` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
