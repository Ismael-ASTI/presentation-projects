/**
 * Hero Section - BertzTech Digital
 * Design: Minimalismo Corporativo com Logo como Background
 * - Logo como elemento SVG de background com opacidade
 * - Imagem de fundo com gradiente de opacidade
 * - Título e subtítulo com tipografia hierárquica
 * - CTA button destacado
 */
export default function Hero() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] md:h-[600px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663458564922/UEoH7uSmMyKeTqaNTqTyys/hero-technician-RXkM5hFjZSJHfnbgyuGPVx.webp)',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
      </div>

      {/* Logo Background Element */}
      <div className="absolute inset-0 flex items-center justify-end opacity-5">
        <img
          src="/images/logo.jpeg"
          alt=""
          className="h-full w-auto"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container max-w-2xl">
          <div className="space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#00FFFF]/30">
              <span className="w-2 h-2 bg-[#00FFFF] rounded-full animate-pulse"></span>
              <span className="text-[#00FFFF] text-sm font-semibold">Assistência Técnica em Domicílio</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Sua tecnologia pronta, sem você sair de casa.
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed">
              Venda de acessórios, troca de películas e assistência técnica com sistema Leva e Traz gratuito.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="https://wa.me/5562981692621?text=Olá%20BertzTech!%20Gostaria%20de%20solicitar%20um%20atendimento."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta bg-[#00FFFF] hover:bg-[#00E5E5] text-gray-900 text-center"
              >
                Pedir Coleta Agora pelo WhatsApp
              </a>
              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 sm:px-8 py-3 border-2 border-white text-white font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 text-center"
              >
                Saiba Como Funciona
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
