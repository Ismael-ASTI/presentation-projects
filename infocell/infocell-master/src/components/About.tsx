"use client";

import { motion } from "framer-motion";
import { Award, Users, Clock, ThumbsUp } from "lucide-react";

const stats = [
  { icon: Award, value: "1000+", label: "Reparos Realizados" },
  { icon: Users, value: "500+", label: "Clientes Satisfeitos" },
  { icon: Clock, value: "Rápido", label: "Prazo de Entrega" },
  { icon: ThumbsUp, value: "98%", label: "Aprovação" },
];

export default function About() {
  return (
    <section id="sobre" className="section-padding relative overflow-hidden w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3 block">
              Quem somos
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Sobre a{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                InfoCell
              </span>
            </h2>
            <div className="space-y-4 text-[#8a94a8] leading-relaxed">
              <p>
                A <strong className="text-white">InfoCell</strong> nasceu da paixão
                por tecnologia e do compromisso em oferecer um atendimento de
                qualidade a quem depende do celular no dia a dia.
              </p>
              <p>
                Somos especializados em <strong className="text-[#00d4ff]">assistência técnica
                em celulares</strong> de todas as marcas, além de vender uma linha completa de
                acessórios — capinhas, películas, caixas de som Boombox, tripés e muito mais.
              </p>
              <p>
                Em parceria com a <strong className="text-white">ITS Comports</strong>,
                também oferecemos soluções para computadores e notebooks, sendo
                o ponto único para todos os seus reparos tecnológicos.
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-2 gap-5"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass-card p-6 text-center hover:border-[rgba(0,212,255,0.3)] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a8b5c7] to-[#7a8899] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon size={22} className="text-white" />
                </div>
                <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-[#8a94a8] text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
