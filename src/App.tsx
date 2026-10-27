import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { LibraryProvider } from './context/LibraryProvider';
import { ToastProvider } from './context/ToastProvider';
import { HomePage } from './pages/HomePage';

const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((module) => ({
    default: module.ExplorePage,
  })),
);
const BookDetailPage = lazy(() =>
  import('./pages/BookDetailPage').then((module) => ({
    default: module.BookDetailPage,
  })),
);
const LibraryPage = lazy(() =>
  import('./pages/LibraryPage').then((module) => ({
    default: module.LibraryPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((module) => ({
    default: module.AnalyticsPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading__bar" aria-hidden="true" />
      <span className="route-loading__bar route-loading__bar--short" aria-hidden="true" />
      <span className="sr-only">Carregando página…</span>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LibraryProvider>
          <HashRouter>
            <ScrollToTop />
            <Layout>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explorar" element={<ExplorePage />} />
                  <Route
                    path="/livro/:source/:sourceId"
                    element={<BookDetailPage />}
                  />
                  <Route path="/biblioteca" element={<LibraryPage />} />
                  <Route path="/dados" element={<AnalyticsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Layout>
          </HashRouter>
        </LibraryProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
