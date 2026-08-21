import { MessageCircle, MapPin, Instagram, Facebook } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Footer Component - BertzTech Digital
 * Design: Minimalismo Corporativo
 * - Informações de contato
 * - Links de redes sociais
 * - Copyright
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer id="contact" className={`transition-colors duration-300 ${isDark ? 'bg-gray-950 text-gray-300' : 'bg-gray-900 text-gray-300'}`}>
      {/* Main Footer */}
      <div className="container py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img
                src="/images/logo.jpeg"
                alt="BertzTech Digital"
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Assistência técnica profissional em domicílio. Conveniência e confiança na sua porta.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: 'Serviços', href: '#services' },
                { label: 'Como Funciona', href: '#how-it-works' },
                { label: 'Diferenciais', href: '#benefits' },
                { label: 'Contato', href: '#contact' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-[#00FFFF] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-4">Serviços</h4>
            <ul className="space-y-2">
              {[
                'Assistência Técnica',
                'Troca de Película',
                'Venda de Acessórios',
                'Diagnóstico Gratuito',
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-gray-400 hover:text-[#00FFFF] transition-colors cursor-pointer">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#00FFFF] flex-shrink-0 mt-0.5" />
                <a
                  href="https://wa.me/5562981692621"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-[#00FFFF] transition-colors"
                >
                  (62) 98169-2621
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="w-5 h-5 text-[#00FFFF] flex-shrink-0 mt-0.5" />
                <a
                  href="https://www.instagram.com/bertztech_digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-[#00FFFF] transition-colors"
                >
                  @bertztech_digital
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#00FFFF] flex-shrink-0 mt-0.5" />
                <span className="text-sm">Uruaçu, GO</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-sm text-gray-400 text-center md:text-left">
            <p>© {currentYear} BertzTech Digital. Todos os direitos reservados.</p>
            <p className="mt-1">Desenvolvido por{' '}
              <a
                href="https://itscomports.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FFFF] hover:underline"
              >
                ITScomports
              </a>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/bertztech_digital"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#00FFFF] hover:text-gray-900 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com/bertztech"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#00FFFF] hover:text-gray-900 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://wa.me/5562981692621"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#00FFFF] hover:text-gray-900 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
