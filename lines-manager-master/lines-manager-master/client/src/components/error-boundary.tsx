import React from 'react';

type State = {
  hasError: boolean;
  error?: Error | null;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console — could be extended to remote logging
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="max-w-lg p-6 bg-white dark:bg-neutral-800 border rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Ocorreu um erro inesperado — você pode recarregar a página ou voltar ao dashboard.</p>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-primary-600 text-white rounded" onClick={() => window.location.reload()}>
                Recarregar
              </button>
              <button className="px-3 py-2 border rounded" onClick={() => (window.location.href = '/dashboard')}>
                Ir para Dashboard
              </button>
            </div>
            <details className="mt-4 text-xs text-neutral-500">
              <summary>Ver detalhes do erro</summary>
              <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
