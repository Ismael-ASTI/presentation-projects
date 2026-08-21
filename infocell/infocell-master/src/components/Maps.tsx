"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Navigation } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function Maps() {
  return (
    <section id="localizacao" className="section-padding relative overflow-hidden bg-[#0d0d14] w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />

      <div className="site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3 block">
            Onde estamos
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Nossa{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #00d4ff, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Localização
            </span>
          </h2>
          <p className="text-[#8a94a8] text-lg max-w-xl mx-auto">
            Venha nos visitar! Estamos prontos para atender você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            <div className="glass-card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a8b5c7] to-[#7a8899] flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Endereço</p>
                <p className="text-[#8a94a8] text-sm leading-relaxed">
                  {siteConfig.location.addressLine}
                </p>
              </div>
            </div>

            <div className="glass-card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#0d9488] flex items-center justify-center shrink-0">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold mb-2">Horário de Atendimento</p>
                <div className="text-[#8a94a8] text-sm space-y-1">
                  <p>Seg – Sex: <span className="text-white">08h às 18h</span></p>
                  <p>Sábado: <span className="text-white">08h às 16h</span></p>
                  <p>Domingo: <span className="text-[#ef4444]">Fechado</span></p>
                </div>
              </div>
            </div>

            <a
              href={siteConfig.location.mapsShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-5 flex items-center gap-4 hover:border-[rgba(0,212,255,0.3)] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center shrink-0">
                <Navigation size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold group-hover:text-[#00d4ff] transition-colors">
                  Abrir no Google Maps
                </p>
                <p className="text-[#8a94a8] text-sm">Traçar rota até a loja</p>
              </div>
            </a>
          </motion.div>

          {/* Map embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-2 glass-card overflow-hidden min-h-[380px]"
          >
            <iframe
              src={siteConfig.location.mapsEmbedUrl}
              width="100%"
              height="380"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização InfoCell no Google Maps"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
