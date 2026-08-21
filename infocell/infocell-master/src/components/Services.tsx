"use client";

import { motion } from "framer-motion";
import {
  Smartphone,
  Shield,
  Wrench,
  Zap,
  Battery,
  Camera,
  Wifi,
  Volume2,
} from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Troca de Tela",
    description:
      "Substituição de display com peças originais e compatíveis para todas as marcas e modelos.",
    gradient: "from-[#a8b5c7] to-[#7a8899]",
  },
  {
    icon: Battery,
    title: "Troca de Bateria",
    description:
      "Baterias novas com alta capacidade para restaurar a autonomia do seu aparelho.",
    gradient: "from-[#7c3aed] to-[#4f46e5]",
  },
  {
    icon: Camera,
    title: "Câmera e Sensores",
    description:
      "Reparo e substituição de câmeras traseiras, frontais e sensores de proximidade.",
    gradient: "from-[#059669] to-[#0d9488]",
  },
  {
    icon: Zap,
    title: "Conector de Carga",
    description:
      "Troca do conector USB/Lightning para restaurar o carregamento do seu celular.",
    gradient: "from-[#d97706] to-[#dc2626]",
  },
  {
    icon: Wifi,
    title: "Placa-mãe e Software",
    description:
      "Diagnóstico e reparo de placa lógica, formatação e restauração de sistema.",
    gradient: "from-[#0891b2] to-[#2563eb]",
  },
  {
    icon: Volume2,
    title: "Áudio e Alto-falante",
    description:
      "Substituição de alto-falantes, microfone e componentes de áudio para qualidade perfeita.",
    gradient: "from-[#be185d] to-[#9333ea]",
  },
  {
    icon: Shield,
    title: "Aplicação de Película",
    description:
      "Aplicação profissional de películas protetoras — vidro temperado, hidrogel e antirreflexo.",
    gradient: "from-[#16a34a] to-[#0d9488]",
  },
  {
    icon: Wrench,
    title: "Revisão Geral",
    description:
      "Diagnóstico completo do aparelho com limpeza interna e preventiva.",
    gradient: "from-[#00d4ff] to-[#7c3aed]",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Services() {
  return (
    <section id="servicos" className="section-padding relative overflow-hidden w-full">
      {/* BG accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />

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
            O que fazemos
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Nossos <span className="gradient-text" style={{ background: "linear-gradient(135deg, #00d4ff, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Serviços</span>
          </h2>
          <p className="text-[#8a94a8] text-lg max-w-2xl mx-auto">
            Atendemos todas as marcas — Samsung, iPhone, Motorola, Xiaomi,
            LG e muito mais.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card p-6 group cursor-default hover:border-[rgba(0,212,255,0.3)] transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <service.icon size={22} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">
                {service.title}
              </h3>
              <p className="text-[#8a94a8] text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Brands */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-[#8a94a8] text-sm mb-6 uppercase tracking-widest">
            Trabalhamos com todas as marcas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["Samsung", "Apple", "Motorola", "Xiaomi", "LG", "Sony", "Nokia", "Huawei"].map(
              (brand) => (
                <div
                  key={brand}
                  className="bg-[rgba(168,181,199,0.04)] border border-[rgba(168,181,199,0.08)] text-[#8a94a8] text-sm px-5 py-2 rounded-full hover:border-[rgba(168,181,199,0.3)] hover:text-[#a8b5c7] transition-all cursor-default"
                >
                  {brand}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
