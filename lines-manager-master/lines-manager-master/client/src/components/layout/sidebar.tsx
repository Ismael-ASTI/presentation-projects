import { Link, useLocation } from 'wouter';
import { useAuth } from '@/components/auth/auth-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { } from 'react';
import { 
  Gauge, 
  Route, 
  FileUp, 
  FileDown, 
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { canAccessAdmin, canImport, canExport } = usePermissions();
  // Sidebar always expanded by design

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={`bg-white dark:bg-neutral-800 shadow-sm border-r border-neutral-200 dark:border-neutral-700 flex flex-col w-64`}> 
      {/* Logo Section */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
            <Route className="text-white text-sm" />
          </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight">Lines Manager</h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">by itscomports.com.br</p>
            </div>
        </div>
      </div>

  {/* Toggle removed - sidebar is always expanded */}

      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {/* Dashboard - Sempre visível */}
          <li>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  location === '/dashboard'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Gauge className={`w-5 h-5 mr-3`} />
                {'Dashboard'}
              </Button>
            </Link>
          </li>

          {/* Gerenciar Linhas - Sempre visível para usuários logados */}
          <li>
            <Link href="/lines">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  location === '/lines'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Route className={`w-5 h-5 mr-3`} />
                {'Gerenciar Linhas'}
              </Button>
            </Link>
          </li>

          {/* Excel Analyzer - Somente para quem pode importar */}
          {canImport && (
            <li>
              <Link href="/excel-analyzer">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    location === '/excel-analyzer'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <FileUp className={`w-5 h-5 mr-3`} />
                  {'Analisar Excel'}
                </Button>
              </Link>
            </li>
          )}
          
          {/* Seção Admin */}
          {canAccessAdmin && (
            <>
              <li className="pt-2">
                <Separator className={`mb-4`} />
              </li>
              <li>
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      location === '/admin'
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Settings className={`w-5 h-5 mr-3`} />
                    {'Administração'}
                  </Button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
  <div className={`flex items-center space-x-3 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700`}> 
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name ? getUserInitials(user.name) : 'U'}
            </span>
          </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {user?.role === 'super_admin' ? 'Super Admin' : 
                 user?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
              title="Sair"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
