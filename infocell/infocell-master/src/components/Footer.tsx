"use client";

import { MessageCircle, AtSign, ExternalLink, ArrowUp } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-[#050508] border-t border-[rgba(0,212,255,0.1)] w-full overflow-hidden">
      {/* Top line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />

      <div className="site-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/infocell-logo.svg"
                alt="Logo InfoCell"
                width={64}
                height={64}
                className="w-14 h-14 rounded-full border border-[rgba(168,181,199,0.35)] shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
              />
              <div>
                <span className="text-xs text-[#a8b5c7] font-medium uppercase tracking-widest block">
                  Assistencia Tecnica
                </span>
                <span className="text-xl font-black text-white">
                  INFO<span className="text-[#a8b5c7]">CELL</span>
                </span>
              </div>
            </div>
            <p className="text-[#8a94a8] text-sm leading-relaxed">
              Especialistas em assistência técnica para celulares e venda de
              acessórios de qualidade. Seu celular merece o melhor cuidado.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white font-semibold mb-4">Navegação</p>
            <div className="flex flex-col gap-2">
              {[
                { href: "#servicos", label: "Serviços" },
                { href: "#produtos", label: "Produtos" },
                { href: "#parceiros", label: "Parceiros" },
                { href: "#localizacao", label: "Localização" },
                { href: "#contato", label: "Contato" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[#a8b5c7] hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <p className="text-white font-semibold mb-4">Contato & Redes</p>
            <div className="flex flex-col gap-3">
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#8a94a8] hover:text-[#25d366] text-sm transition-colors"
              >
                <MessageCircle size={16} />
                {siteConfig.contact.whatsappDisplay}
              </a>
              <a
                href={siteConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[#8a94a8] hover:text-[#f58529] text-sm transition-colors"
              >
                <AtSign size={16} />
                {siteConfig.contact.instagramHandle}
              </a>
              <div className="mt-2 pt-4 border-t border-[rgba(0,212,255,0.1)]">
                <p className="text-[#8a94a8] text-xs mb-2">Parceiro oficial:</p>
                <a
                  href="https://itscomports.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#a78bfa] hover:text-[#c4b5fd] text-sm transition-colors"
                >
                  <ExternalLink size={14} />
                  itscomports.com.br
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(0,212,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#8a94a8] text-xs text-center sm:text-left">
            © {new Date().getFullYear()} InfoCell — Assistência Técnica. Todos os direitos reservados.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[#a8b5c7] hover:text-white text-xs transition-colors"
          >
            <ArrowUp size={14} />
            Voltar ao topo
          </button>
        </div>
      </div>
    </footer>
  );
}
