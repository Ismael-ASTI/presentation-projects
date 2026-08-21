"use client";

import { motion } from "framer-motion";
import { MessageCircle, AtSign, Mail } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const contactChannels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: siteConfig.contact.whatsappDisplay,
    hint: "Atendimento rápido",
    href: siteConfig.contact.whatsappUrl,
    gradient: "from-[#25d366] to-[#128c7e]",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]",
  },
  {
    icon: AtSign,
    label: "Instagram",
    value: siteConfig.contact.instagramHandle,
    hint: "Siga nossas novidades",
    href: siteConfig.contact.instagramUrl,
    gradient: "from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(221,42,123,0.4)]",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: siteConfig.contact.email,
    hint: "Para orçamentos detalhados",
    href: `mailto:${siteConfig.contact.email}`,
    gradient: "from-[#f59e0b] to-[#ef4444]",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]",
  },
];

export default function Contact() {
  return (
    <section id="contato" className="section-padding relative overflow-hidden w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00d4ff]/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3 block">
            Fale com a gente
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Entre em{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00d4ff, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Contato
            </span>
          </h2>
          <p className="text-[#8a94a8] text-lg max-w-xl mx-auto">
            Tire dúvidas, solicite orçamentos ou agende uma visita. Respondemos
            rapidinho!
          </p>
        </motion.div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {contactChannels.map((ch, i) => (
            <motion.a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className={`glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-[rgba(0,212,255,0.3)] transition-all duration-300 ${ch.hoverGlow}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ch.gradient} flex items-center justify-center shadow-lg`}
              >
                <ch.icon size={26} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base">{ch.label}</p>
                <p className="text-[#a8b5c7] text-sm font-medium mt-1">
                  {ch.value}
                </p>
                <p className="text-[#8a94a8] text-xs mt-1">{ch.hint}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Big CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[rgba(0,212,255,0.2)] p-10 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(13,13,20,0.8) 50%, rgba(0,102,204,0.06) 100%)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#00d4ff]/5 blur-3xl rounded-full" />
          </div>
          <div className="relative z-10">
            <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3">
              Seu celular com problema?
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Solicite seu orçamento agora
            </h3>
            <p className="text-[#8a94a8] mb-8 max-w-lg mx-auto">
              Resposta em minutos. Orçamento sem compromisso e garantia em todos
              os serviços.
            </p>
            <a
              href={siteConfig.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25d366] hover:bg-[#1db954] text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-[0_0_40px_rgba(37,211,102,0.6)] hover:-translate-y-1"
            >
              <MessageCircle size={22} />
              Chamar no WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
