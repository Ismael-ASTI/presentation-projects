interface LoadingOverlayProps {
  isVisible?: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible = true, message = 'Carregando...' }: LoadingOverlayProps = {}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-neutral-900 dark:text-white">Processando...</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
      </div>
    </div>
  );
}
