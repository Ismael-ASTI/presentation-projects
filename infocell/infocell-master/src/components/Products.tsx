"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Tag } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const products = [
  {
    emoji: "📱",
    title: "Capinhas de Celular",
    description:
      "Protetores para todas as marcas e modelos. Silicone, acrílico, couro sintético e muito mais.",
    badge: "Mais Vendido",
    badgeColor: "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30",
  },
  {
    emoji: "🛡️",
    title: "Películas Protetoras",
    description:
      "Vidro temperado, hidrogel HD e película privacidade para máxima proteção da tela.",
    badge: "Promoção",
    badgeColor: "bg-[#25d366]/20 text-[#25d366] border-[#25d366]/30",
  },
  {
    emoji: "🔊",
    title: "Caixas Boombox",
    description:
      "Caixas de som Bluetooth com graves potentes, iluminação RGB e bateria de longa duração.",
    badge: "Destaque",
    badgeColor: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30",
  },
  {
    emoji: "🎶",
    title: "Outras Caixas de Som",
    description:
      "Minispeakers portáteis, caixas para festas e sistemas de áudio para todos os gostos.",
    badge: "Variedade",
    badgeColor: "bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30",
  },
  {
    emoji: "🎬",
    title: "Tripés e Suportes",
    description:
      "Tripés ajustáveis, ring lights e suportes para criar conteúdo profissional com o celular.",
    badge: "Tendência",
    badgeColor: "bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30",
  },
  {
    emoji: "🎧",
    title: "Acessórios Gerais",
    description:
      "Fones de ouvido, carregadores, cabos, power banks e tudo que você precisa.",
    badge: "Completo",
    badgeColor: "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function Products() {
  return (
    <section
      id="produtos"
      className="section-padding relative overflow-hidden bg-[#0d0d14] w-full"
    >
      {/* decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />
      <div className="absolute -right-32 top-1/2 w-[400px] h-[400px] bg-[#00d4ff]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#a8b5c7] text-sm font-semibold uppercase tracking-widest mb-3 block">
            Loja
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Nossos{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #a8b5c7, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Produtos
            </span>
          </h2>
          <p className="text-[#8a94a8] text-lg max-w-2xl mx-auto">
            Tudo que você precisa para proteger, personalizar e aproveitar ao
            máximo o seu celular.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.title}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="glass-card p-6 group hover:border-[rgba(0,212,255,0.3)] transition-all duration-300 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{product.emoji}</span>
                <span
                  className={`text-xs font-semibold border px-3 py-1 rounded-full ${product.badgeColor}`}
                >
                  {product.badge}
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {product.title}
                </h3>
                <p className="text-[#8a94a8] text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center gap-2 text-[#a8b5c7] text-sm font-medium hover:gap-3 transition-all group-hover:underline"
              >
                <Tag size={14} />
                Ver preços no WhatsApp
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 max-w-6xl mx-auto glass-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25d366] to-[#0d9488] flex items-center justify-center">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                Não encontrou o que procura?
              </p>
              <p className="text-[#8a94a8] text-sm">
                Entre em contato que buscamos para você!
              </p>
            </div>
          </div>
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#25d366] hover:bg-[#1db954] text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
          >
            Falar com Atendente
          </a>
        </motion.div>
      </div>
    </section>
  );
}
