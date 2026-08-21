import { useTheme } from '@/contexts/ThemeContext';
import { Quote } from 'lucide-react';

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="about" className={`py-20 md:py-32 transition-colors duration-300 relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#00FFFF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00FFFF]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Photo */}
          <div className="flex-shrink-0 fade-in-up">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#00FFFF] to-[#009999] rounded-full blur-sm opacity-60"></div>
              {/* Border ring */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full p-1 bg-gradient-to-br from-[#00FFFF] to-[#009999]">
                <img
                  src="/images/webert-patrick.jpeg"
                  alt="Webert Patrick - Técnico BertzTech Digital"
                  loading="lazy"
                  className="w-full h-full rounded-full object-cover object-[center_20%]"
                />
              </div>
              {/* Floating badge */}
              <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap ${isDark ? 'bg-gray-800 text-[#00FFFF] border border-[#00FFFF]/30' : 'bg-white text-gray-900 border border-gray-200'}`}>
                Técnico Especialista
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center lg:text-left fade-in-up" style={{ animationDelay: '200ms' }}>
            {/* Name */}
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Webert <span className="text-[#00FFFF]">Patrick</span>
            </h2>
            <p className="text-[#00FFFF] font-semibold text-lg mb-8">Fundador — BertzTech Digital</p>

            {/* Quote icon */}
            <Quote className={`w-8 h-8 mb-4 ${isDark ? 'text-[#00FFFF]/30' : 'text-[#00FFFF]/40'} hidden lg:block`} />

            {/* Description */}
            <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>
                Como técnico especializado em smartphones, cuido de cada detalhe: da aplicação precisa de películas e manutenções complexas à curadoria de acessórios premium. Meu foco é ouvir o que você precisa e entregar o melhor para o seu aparelho.
              </p>
              <p>
                E você não precisa sair de casa — com o sistema <strong className="text-[#00FFFF]">Leva e Traz Gratuito</strong>, busco seu celular, cuido dele com todo o zelo e devolvo pronto para uso.
              </p>
            </div>

            {/* Signature quote */}
            <div className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`italic text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                "Sua confiança é o que move meu trabalho."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
