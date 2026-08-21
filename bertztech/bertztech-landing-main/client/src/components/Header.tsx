import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Header Component - BertzTech Digital
 * Design: Minimalismo Corporativo
 * - Logo com ícone cerebral + texto
 * - Navegação limpa com links para seções
 * - CTA button destacado em ciano
 * - Toggle para cor ciano nas letras
 * - Menu mobile responsivo
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 border-b shadow-sm transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/images/logo.jpeg"
            alt="BertzTech Digital"
            className="h-14 w-14 rounded-full object-cover"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('services')} className={`hover:text-[#00FFFF] transition-colors font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Serviços
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className={`hover:text-[#00FFFF] transition-colors font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Como Funciona
          </button>
          <button onClick={() => scrollToSection('benefits')} className={`hover:text-[#00FFFF] transition-colors font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Benefícios
          </button>
          <button onClick={() => scrollToSection('contact')} className={`hover:text-[#00FFFF] transition-colors font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Contato
          </button>
        </nav>

        {/* Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isDark
                ? 'bg-gray-700 text-[#00FFFF] hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDark ? 'Tema claro' : 'Tema escuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* CTA Button */}
          <a
            href="https://wa.me/5562981692621?text=Olá%20BertzTech!%20Gostaria%20de%20solicitar%20um%20atendimento."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta text-sm"
          >
            WhatsApp
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden p-2.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden border-t ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <nav className="container py-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection('services')} className={`text-left hover:text-[#00FFFF] transition-colors font-medium py-3 px-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Serviços
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className={`text-left hover:text-[#00FFFF] transition-colors font-medium py-3 px-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('benefits')} className={`text-left hover:text-[#00FFFF] transition-colors font-medium py-3 px-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Diferenciais
            </button>
            <button onClick={() => scrollToSection('contact')} className={`text-left hover:text-[#00FFFF] transition-colors font-medium py-3 px-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Contato
            </button>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toggleTheme?.();
                  setIsMenuOpen(false);
                }}
                className={`flex-1 p-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] ${
                  isDark
                    ? 'bg-gray-700 text-[#00FFFF]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-base font-medium">{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
              </button>
            </div>
            <a
              href="https://wa.me/5562981692621?text=Olá%20BertzTech!%20Gostaria%20de%20solicitar%20um%20atendimento."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta text-center text-sm"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
