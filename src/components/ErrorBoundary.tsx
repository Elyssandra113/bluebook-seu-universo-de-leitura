import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // The fallback below replaces the broken tree without exposing internals.
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="state state--error" role="alert">
          <p className="eyebrow">Algo saiu do prumo</p>
          <h1 className="state__title">Não foi possível exibir esta página</h1>
          <p className="state__description">
            Ocorreu um erro inesperado na interface. Recarregue a página para
            voltar à sua biblioteca.
          </p>
          <div className="state__actions">
            <button
              type="button"
              className="btn btn--primary btn--md"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
