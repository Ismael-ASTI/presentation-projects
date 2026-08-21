"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    text: "Levei meu iPhone com tela quebrada e em menos de 2 horas estava novinho! Serviço rápido e preço justo.",
    stars: 5,
    model: "iPhone 13",
  },
  {
    name: "João Pereira",
    text: "Comprei uma caixa Boombox incrível pra festa. Qualidade top e entregaram super rápido. Recomendo!",
    stars: 5,
    model: "Cliente de Produtos",
  },
  {
    name: "Ana Souza",
    text: "Melhor assistência da região! Consertaram minha bateria e ainda aplicaram película gratuitamente.",
    stars: 5,
    model: "Samsung Galaxy S22",
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="section-padding relative overflow-hidden bg-[#0d0d14] w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent" />

      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#a8b5c7] text-sm font-semibold uppercase tracking-widest mb-3 block">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            O que nossos{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #a8b5c7, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              clientes dizem
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col gap-4"
            >
              <Quote size={24} className="text-[#00d4ff]/40" />
              <p className="text-[#c0c8d8] text-sm leading-relaxed flex-1">
                {t.text}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-[#8a94a8] text-xs">{t.model}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star
                      key={s}
                      size={14}
                      className="text-[#f59e0b] fill-[#f59e0b]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
