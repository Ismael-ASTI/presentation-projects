import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/common/theme-provider';
import { useAuth } from '@/components/auth/auth-provider';
import { useRealTime } from '@/context/RealTimeContext';
import { Moon, Sun, Bell, Search, LogOut } from 'lucide-react';
import { ConfirmationModal } from '@/components/common/confirmation-modal';

interface TopBarProps {
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export function TopBar({ title, searchPlaceholder = "Buscar...", onSearch, showSearch = true }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { systemStatus } = useRealTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThemeToggle}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              title="Alternar tema"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                  onClick={async () => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    try {
                      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
                      const headers: any = { 'Content-Type': 'application/json' };
                      if (token) headers['Authorization'] = `Bearer ${token}`;
                      const res = await fetch('/api/activity-logs', { headers });
                      if (res.ok) {
                        const all = await res.json();
                        const updates = (all || []).filter((i: any) => i.action === 'UPDATE_LINE');
                        setNotifications(updates.slice(0, 8));
                      }
                    } catch (e) {
                      console.error('Erro ao buscar notificações', e);
                    }
                  }
                }}
                className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {systemStatus?.pendingOperations && systemStatus.pendingOperations > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {systemStatus.pendingOperations > 9 ? '9+' : systemStatus.pendingOperations}
                    </span>
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border rounded shadow-lg z-50">
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Notificações</div>
                    {notifications.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhuma alteração recente</div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-auto">
                        {notifications.map((n, i) => (
                          <div key={i} className="text-sm border-b pb-2">
                            <div className="font-medium">{n.details?.message || n.action}</div>
                            <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search (toggleable) */}
            {showSearch && (
              <div className="relative">
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-64 pl-10 pr-4 py-2 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              </div>
            )}
            
            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirmar Logout"
        message="Tem certeza que deseja sair do sistema?"
        confirmText="Sair"
        cancelText="Cancelar"
      />
    </>
  );
}
