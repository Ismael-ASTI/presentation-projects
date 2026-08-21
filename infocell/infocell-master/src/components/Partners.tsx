"use client";

import { motion } from "framer-motion";
import { Monitor, ExternalLink, CheckCircle } from "lucide-react";

const features = [
  "Reparos em PC desktop e notebook",
  "Limpeza",
  "Formatação",
  "Instalação de pacote Office",
  "Backup",
  "Infraestrutura de rede",
  "Consultoria",
  "Upgrade",
];

export default function Partners() {
  return (
    <section id="parceiros" className="section-padding relative overflow-hidden w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[rgba(168,181,199,0.35)] to-transparent" />
      <div className="absolute -left-24 top-1/2 w-[440px] h-[440px] bg-[rgba(168,181,199,0.08)] rounded-full blur-[120px] pointer-events-none" />

      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#a8b5c7] text-sm font-semibold uppercase tracking-widest mb-3 block">
            Em parceria com
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Reparo em{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #a8b5c7, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Computadores
            </span>
          </h2>
          <p className="text-[#8a94a8] text-lg max-w-2xl mx-auto">
            Através da nossa parceria com a <strong className="text-white">ITS Comports</strong>,
            oferecemos também serviços especializados em computadores e notebooks.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Card da parceira */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 border-[rgba(168,181,199,0.2)] shadow-[0_0_28px_rgba(168,181,199,0.08)]"
          >
            {/* Logo ITS */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a8b5c7] to-[#7a8899] flex items-center justify-center shadow-lg">
                <Monitor size={30} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">ITS Comports</h3>
                <p className="text-[#8a94a8] text-sm">Parceira Oficial</p>
              </div>
            </div>

            <p className="text-[#8a94a8] leading-relaxed mb-6">
              A <strong className="text-white">ITS Comports</strong> é especializada em
              manutenção e suporte para computadores, notebooks e periféricos.
              Com profissionais certificados, garantem a melhor solução técnica
              para o seu equipamento.
            </p>

            <a
              href="https://itscomports.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7a8899] to-[#5d6877] hover:from-[#8b98aa] hover:to-[#6d7988] text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(168,181,199,0.3)] hover:-translate-y-1"
            >
              <ExternalLink size={16} />
              Visitar itscomports.com.br
            </a>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-white font-bold text-xl mb-6">
              O que a parceria oferece:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-3 bg-[rgba(168,181,199,0.06)] border border-[rgba(168,181,199,0.14)] rounded-xl px-4 py-3"
                >
                  <CheckCircle size={16} className="text-[#a8b5c7] shrink-0" />
                  <span className="text-[#dbe1eb] text-sm">{feat}</span>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-8 flex items-center gap-4 p-4 bg-[rgba(168,181,199,0.08)] border border-[rgba(168,181,199,0.2)] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[rgba(168,181,199,0.25)] flex items-center justify-center">
                <Monitor size={18} className="text-[#a8b5c7]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Atendimento integrado
                </p>
                <p className="text-[#8a94a8] text-xs">
                  Celular e computador, tudo em um so lugar via InfoCell.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
