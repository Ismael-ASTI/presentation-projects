import { Wrench, Shield, ShoppingBag } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Services Section - BertzTech Digital
 * Design: Minimalismo Corporativo
 * - Cards com ícones geométricos
 * - Layout assimétrico com imagens
 * - Descrições claras e objetivas
 */

const services = [
  {
    id: 1,
    title: 'Assistência Técnica',
    description: 'Reparo profissional de celulares: troca de tela, bateria, conector de carregamento e muito mais. Diagnóstico gratuito e atendimento rápido.',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1576613109753-27804de2cba8?w=600&q=80',
    color: 'from-[#00BFFF] to-[#0066FF]',
    whatsappMsg: 'Olá BertzTech! Gostaria de solicitar um serviço de Assistência Técnica para meu celular.',
  },
  {
    id: 2,
    title: 'Troca de Película',
    description: 'Aplicação profissional de películas de proteção com precisão. Proteção instantânea contra arranhões e impactos com acabamento perfeito.',
    icon: Shield,
    image: 'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=600&q=80',
    color: 'from-[#00FFAA] to-[#00CC66]',
    whatsappMsg: 'Olá BertzTech! Gostaria de solicitar uma Troca de Película para meu celular.',
  },
  {
    id: 3,
    title: 'Venda de Acessórios',
    description: 'Carregadores, cabos, fones, capas e proteções de primeira linha. Produtos de qualidade com garantia, entregues na sua casa.',
    icon: ShoppingBag,
    image: '/images/loja-acessorios.jpg',
    color: 'from-[#FF6B6B] to-[#EE5A24]',
    whatsappMsg: 'Olá BertzTech! Gostaria de ver os Acessórios disponíveis para compra.',
  },
];

export default function Services() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section id="services" className={`py-20 md:py-32 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Nossos <span className="text-[#00FFFF]">Serviços</span>
          </h2>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tudo que você precisa para manter seu celular em perfeito estado, sem precisar sair de casa. Profissionalismo e qualidade em cada atendimento.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={service.id}
                className="group fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Container */}
                <div className={`rounded-xl overflow-hidden card-hover border h-full flex flex-col ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  {/* Image */}
                  <div className={`relative h-40 sm:h-48 overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-sm leading-relaxed flex-grow ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {service.description}
                    </p>

                    {/* CTA Link */}
                    <a
                      href={`https://wa.me/5562981692621?text=${encodeURIComponent(service.whatsappMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center text-[#00FFFF] font-semibold hover:text-[#00E5E5] transition-colors group/link"
                    >
                      Solicitar
                      <span className="ml-2 group-hover/link:translate-x-1 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
