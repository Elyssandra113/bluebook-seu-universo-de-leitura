import { Compass, Home, SearchX } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ButtonLink } from '../components/Button';
import { Logo } from '../components/Logo';

export function NotFoundPage() {
  useDocumentTitle('Página não encontrada');

  return (
    <div className="not-found">
      <div className="container not-found__inner">
        <div className="not-found__art" aria-hidden="true">
          <span className="not-found__number">404</span>
          <span className="not-found__book">
            <Logo compact />
          </span>
          <SearchX className="not-found__icon" size={26} />
        </div>

        <p className="eyebrow">Página fora do catálogo</p>
        <h1 className="not-found__title">Esta história não está aqui</h1>
        <p className="not-found__description">
          O endereço que você abriu não corresponde a uma página do BlueBook.
          Pode ter sido digitado incorretamente ou o link pode estar
          desatualizado.
        </p>

        <div className="not-found__actions">
          <ButtonLink to="/" variant="primary" size="lg" icon={<Home size={18} />}>
            Voltar ao início
          </ButtonLink>
          <ButtonLink
            to="/explorar"
            variant="secondary"
            size="lg"
            icon={<Compass size={18} />}
          >
            Explorar livros
          </ButtonLink>
        </div>

        <nav className="not-found__links" aria-label="Atalhos">
          <span>Ou vá direto para:</span>
          <ButtonLink to="/biblioteca" variant="ghost" size="sm">
            Minha biblioteca
          </ButtonLink>
          <ButtonLink to="/dados" variant="ghost" size="sm">
            Análise de dados
          </ButtonLink>
        </nav>
      </div>
    </div>
  );
}
