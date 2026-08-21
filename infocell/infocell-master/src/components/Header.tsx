"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#produtos", label: "Produtos" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#sobre", label: "Sobre" },
  { href: "#localizacao", label: "Localização" },
  { href: "#contato", label: "Contato" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050508]/90 backdrop-blur-xl border-b border-[rgba(0,212,255,0.15)] shadow-[0_4px_30px_rgba(0,212,255,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="site-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <Image
              src="/infocell-logo.svg"
              alt="Logo InfoCell"
              width={56}
              height={56}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-[rgba(168,181,199,0.35)] shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
              priority
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs text-[#a8b5c7] font-medium uppercase tracking-widest">
                Assistencia Tecnica
              </span>
              <span className="text-xl font-black text-white group-hover:text-glow transition-all">
                INFO<span className="text-[#a8b5c7]">CELL</span>
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-[#a8b5c7] hover:text-white rounded-lg hover:bg-[rgba(168,181,199,0.07)] transition-all duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 bg-[#25d366] hover:bg-[#1db954] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-[#8a94a8] hover:text-white p-2 rounded-lg"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0d0d14]/95 backdrop-blur-xl border-t border-[rgba(0,212,255,0.1)]"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-[#a8b5c7] hover:text-white hover:bg-[rgba(168,181,199,0.07)] rounded-lg transition-all font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 bg-[#25d366] text-white px-4 py-3 rounded-xl font-semibold"
              >
                <MessageCircle size={16} />
                Chamar no WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
