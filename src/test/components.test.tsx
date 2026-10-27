import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';
import { BookCard } from '../components/BookCard';
import { Toaster } from '../components/Toaster';
import { LibraryProvider } from '../context/LibraryProvider';
import { ToastProvider } from '../context/ToastProvider';
import { makeBook } from './fixtures';

describe('SearchForm', () => {
  it('envia o termo e o tipo de busca escolhidos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchForm onSearch={onSearch} />);

    await user.type(
      screen.getByRole('searchbox', { name: /buscar livros/i }),
      '  Duna  ',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: /buscar por/i }),
      'title',
    );
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith({
      query: 'Duna',
      searchType: 'title',
    });
  });

  it('bloqueia o envio vazio quando a busca é obrigatória', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchForm onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/digite um título/i);
  });

  it('permite busca vazia quando requireQuery é falso', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchForm onSearch={onSearch} requireQuery={false} />);

    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith({
      query: '',
      searchType: 'all',
    });
  });
});

describe('BookCard', () => {
  it('salva o livro na biblioteca local e atualiza o estado', async () => {
    const user = userEvent.setup();
    const book = makeBook({ title: 'Livro Interativo' });

    render(
      <MemoryRouter>
        <ToastProvider>
          <LibraryProvider>
            <BookCard book={book} />
            <Toaster />
          </LibraryProvider>
        </ToastProvider>
      </MemoryRouter>,
    );

    const addButton = screen.getByRole('button', {
      name: /adicionar livro interativo à biblioteca/i,
    });
    await user.click(addButton);

    expect(
      await screen.findByRole('button', {
        name: /remover livro interativo da biblioteca/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      await screen.findByText(/foi salvo em quero ler/i),
    ).toBeInTheDocument();

    const stored = window.localStorage.getItem('bluebook:library:v1');
    expect(stored).toContain('Livro Interativo');
  });
});
