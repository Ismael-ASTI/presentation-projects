import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Home Page - BertzTech Digital
 * 
 * Design Philosophy: Minimalismo Corporativo com Ênfase em Movimento
 * 
 * Seções:
 * 1. Header - Navegação sticky com logo e CTA
 * 2. Hero - Imagem de fundo com título e CTA principal
 * 3. Services - 3 serviços principais com cards
 * 4. HowItWorks - Timeline com 4 passos
 * 5. Benefits - 6 diferenciais + estatísticas
 * 6. Footer - Contato e links
 * 
 * Design Elements:
 * - Paleta: Preto (#1a1a1a), Branco, Ciano (#00FFFF), Cinza neutro
 * - Tipografia: Poppins (títulos) + Inter (corpo)
 * - Animações: Fade-in ao scroll, hover effects em cards
 * - Spacing: Generoso, com divisores diagonais
 */

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Header />
      <Hero />
      <About />
      <Services />
      <HowItWorks />
      <Benefits />
      <Footer />
    </div>
  );
}
