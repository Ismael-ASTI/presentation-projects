"use client";

import { motion } from "framer-motion";
import { Wrench, Shield, ChevronDown, MessageCircle, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import { siteConfig } from "@/lib/siteConfig";

const ParticlesBackground = dynamic(() => import("./ParticlesBackground"), {
  ssr: false,
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
      {/* Animated background */}
      <ParticlesBackground />

      {/* Background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00d4ff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/2 translate-x-1/2 w-[400px] h-[400px] bg-[#0066cc]/8 rounded-full blur-[100px]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-[rgba(168,181,199,0.1)] border border-[rgba(168,181,199,0.25)] text-[#a8b5c7] text-sm font-medium px-4 py-2 rounded-full mb-8"
        >
          <div className="w-2 h-2 bg-[#a8b5c7] rounded-full animate-pulse" />
          Especialistas em Assistência Técnica
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-4 leading-none tracking-tight">
            <span className="text-white">INFO</span>
            <span
              className="gradient-text"
              style={{
                background:
                  "linear-gradient(135deg, #a8b5c7 0%, #ffffff 40%, #a8b5c7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CELL
            </span>
          </h1>
          <p className="text-[#a8b5c7] text-base sm:text-xl font-light tracking-[0.22em] sm:tracking-[0.4em] uppercase mb-6">
            Assistência Técnica
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-[#8a94a8] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Seu celular em boas mãos. Reparos rápidos, acessórios de qualidade e
          muito mais para manter você sempre conectado.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mb-10"
        >
          {[
            { value: "1000+", label: "Reparos Realizados" },
            { value: "98%", label: "Satisfação" },
            { value: "24h", label: "Atendimento Rápido" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-[#a8b5c7]">
                {stat.value}
              </div>
              <div className="text-xs text-[#8a94a8] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25d366] hover:bg-[#1db954] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] hover:-translate-y-1"
          >
            <MessageCircle size={20} />
            Solicitar Orçamento
          </a>
          <a
            href="#servicos"
            className="flex items-center gap-2 border border-[rgba(0,212,255,0.3)] hover:border-[#00d4ff] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.07)] px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-1"
          >
            <Wrench size={20} />
            Ver Serviços
          </a>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-12"
        >
          {[
            { icon: Shield, text: "Garantia no Serviço" },
            { icon: Wrench, text: "Técnicos Especializados" },
            { icon: Phone, text: "Todas as Marcas" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 bg-[rgba(168,181,199,0.05)] border border-[rgba(168,181,199,0.1)] px-4 py-2 rounded-full text-sm text-[#a8b5c7]"
            >
              <Icon size={14} className="text-[#a8b5c7]" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#servicos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#8a94a8] hover:text-[#00d4ff] transition-colors"
      >
        <span className="text-xs uppercase tracking-widest">Explore</span>
        <ChevronDown size={18} className="animate-bounce" />
      </motion.a>
    </section>
  );
}
