import { Home, Clock, Zap, Award, Smartphone, Headphones } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Benefits Section - BertzTech Digital
 * Design: Minimalismo Corporativo
 * - Grid assimétrico com 6 diferenciais
 * - Ícones e badges
 * - Foco na conveniência
 */

const benefits = [
  {
    icon: Home,
    title: 'Atendimento em Domicílio',
    description: 'Nós vamos até você. Sem necessidade de sair de casa ou do trabalho.',
    color: 'from-[#00BFFF] to-[#0066FF]',
  },
  {
    icon: Clock,
    title: 'Agilidade Garantida',
    description: 'Atendimento rápido para quem não tem tempo a perder. Agendamento flexível.',
    color: 'from-[#FFAA00] to-[#FF6600]',
  },
  {
    icon: Zap,
    title: 'Serviço Profissional',
    description: 'Técnicos experientes com ferramentas modernas e peças de qualidade.',
    color: 'from-[#FFD700] to-[#FFA500]',
  },
  {
    icon: Award,
    title: 'Confiança e Transparência',
    description: 'Trabalho realizado na sua frente. Sem surpresas ou cobranças ocultas.',
    color: 'from-[#00FFAA] to-[#00CC66]',
  },
  {
    icon: Smartphone,
    title: 'Produtos Premium',
    description: 'Acessórios de primeira linha com garantia. Qualidade que dura.',
    color: 'from-[#A855F7] to-[#7C3AED]',
  },
  {
    icon: Headphones,
    title: 'Suporte Completo',
    description: 'Atendimento via WhatsApp. Dúvidas? Estamos sempre disponíveis.',
    color: 'from-[#FF6B6B] to-[#EE5A24]',
  },
];

export default function Benefits() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="benefits" className={`py-20 md:py-32 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="container">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Por que Escolher a <span className="text-[#00FFFF]">BertzTech Digital</span>
          </h2>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Somos diferentes porque entendemos que seu tempo é precioso. Aqui estão os diferenciais que nos tornam a melhor escolha para assistência técnica em domicílio.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Benefit Card */}
                <div className={`relative rounded-xl p-8 border card-hover h-full ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}`}>
                  {/* Background Accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${benefit.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>

                  {/* Icon */}
                  <div className={`relative w-14 h-14 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed relative ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {benefit.description}
                  </p>

                  {/* Hover Accent Line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#00FFFF] to-transparent w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 md:mt-32 grid md:grid-cols-3 gap-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12">
          {[
            { number: '500+', label: 'Clientes Atendidos' },
            { number: '24h', label: 'Atendimento Disponível' },
            { number: '98%', label: 'Satisfação Garantida' },
          ].map((stat, index) => (
            <div key={index} className="text-center fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="text-4xl md:text-5xl font-bold text-[#00FFFF] mb-2">
                {stat.number}
              </div>
              <p className="text-gray-300 text-sm md:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
