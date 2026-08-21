import { MessageCircle, Calendar, Wrench, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * How It Works Section - BertzTech Digital
 * Design: Minimalismo Corporativo
 * - Timeline visual com 4 passos
 * - Ícones geométricos
 * - Descrições claras
 */

const steps = [
  {
    number: 1,
    title: 'Solicite',
    description: 'Você nos chama pelo site ou WhatsApp para iniciar o atendimento.',
    icon: MessageCircle,
    color: 'from-[#00BFFF] to-[#0066FF]',
  },
  {
    number: 2,
    title: 'Coletamos',
    description: 'Buscamos seu aparelho ou levamos seu produto no trabalho ou em casa.',
    icon: Calendar,
    color: 'from-[#FFAA00] to-[#FF6600]',
  },
  {
    number: 3,
    title: 'Resolvemos',
    description: 'Fazemos o serviço ou a entrega com agilidade.',
    icon: Wrench,
    color: 'from-[#00FFAA] to-[#00CC66]',
  },
  {
    number: 4,
    title: 'Entregamos',
    description: 'Você recebe tudo pronto, com garantia e frete grátis.',
    icon: CheckCircle,
    color: 'from-[#A855F7] to-[#7C3AED]',
  },
];

export default function HowItWorks() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="how-it-works" className={`py-20 md:py-32 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Como <span className="text-[#00FFFF]">Funciona</span>
          </h2>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Processo simples e direto. Apenas 4 passos para resolver seu problema sem complicações.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="grid md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="relative fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Connector Line */}
                {!isLast && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#00FFFF] to-transparent transform translate-x-1/2"></div>
                )}

                {/* Step Card */}
                <div className={`relative z-10 rounded-xl p-6 border card-hover h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#00FFFF] text-gray-900 rounded-full flex items-center justify-center font-bold shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="https://wa.me/5562981692621?text=Olá%20BertzTech!%20Gostaria%20de%20solicitar%20um%20atendimento."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta inline-block"
          >
            Começar Agora
          </a>
        </div>
      </div>
    </section>
  );
}
