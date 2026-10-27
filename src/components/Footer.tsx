import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/">
            <Logo showTagline />
          </Link>
          <p>
            Um espaço para descobrir livros, guardar suas leituras e enxergar o
            universo literário por meio de dados.
          </p>
        </div>

        <nav className="site-footer__column" aria-label="Navegação do rodapé">
          <h2>Navegar</h2>
          <Link to="/">Início</Link>
          <Link to="/explorar">Explorar livros</Link>
          <Link to="/biblioteca">Minha biblioteca</Link>
          <Link to="/dados">Análise de dados</Link>
        </nav>

        <div className="site-footer__column">
          <h2>Fontes de dados</h2>
          <a
            href="https://developers.google.com/books/docs/v1/using"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Books API
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <a
            href="https://openlibrary.org/developers/api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Library
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <Link to="/dados">Metodologia da análise</Link>
        </div>

        <div className="site-footer__column site-footer__about">
          <h2>Sobre o projeto</h2>
          <p>
            BlueBook é um artefato acadêmico de desenvolvimento web. A aplicação
            consulta APIs públicas, processa os dados recebidos e apresenta
            análises transparentes — sem números simulados.
          </p>
          <p className="site-footer__note">
            Projeto acadêmico · 2026
          </p>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>
          BlueBook — Seu Universo de Leitura. Feito com React, TypeScript e
          Vite.
        </p>
        <p>
          Dados fornecidos pela Google Books API. Contingência: Open Library.
        </p>
      </div>
    </footer>
  );
}
