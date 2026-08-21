import { useEffect, useState, useRef, useCallback } from 'react'
import './App.css'

type Kit = {
  name: string
  profile: string
  image: string
  cta: string
  badge?: string
}

type Step = {
  title: string
  description: string
}

const WHATSAPP_NUMBER = '556293516809'
const SALES_AGENT_NAME = 'Hellen Sarah'
const CONTACT_MESSAGE = 'Olá! Tenho interesse em comprar a vitamina.'

const kits: Kit[] = [
  {
    name: 'Kit Intensivo',
    profile: 'Para quem deseja uma estratégia mais forte de continuidade.',
    image: '/assets/hero/capa.png',
    cta: 'Ola! Quero comprar a vitamina para tratamento de 3 meses com o Kit Intensivo.',
    badge: 'Mais pedido',
  },
  {
    name: 'Kit Avançado',
    profile: 'Para quem busca um plano prolongado com acompanhamento personalizado.',
    image: '/assets/benefits/garantia.png',
    cta: 'Ola! Tenho interesse no Kit Avancado e quero orientacao para comprar.',
  },
]

const protocolSteps: Step[] = [
  {
    title: 'Fase 1: Diagnóstico de objetivo',
    description:
      'Você informa seu momento capilar e recebe orientação inicial no WhatsApp para escolher o melhor kit.',
  },
  {
    title: 'Fase 2: Início da rotina',
    description:
      'Com o kit definido, você segue o modo de uso recomendado e inicia a rotina com constância diária.',
  },
  {
    title: 'Fase 3: Acompanhamento',
    description:
      'O atendimento acompanha sua evolução para manter aderência ao protocolo e ajustar a estratégia.',
  },
  {
    title: 'Fase 4: Continuidade inteligente',
    description:
      'No momento certo, você recebe recomendação de continuidade para sustentar os resultados obtidos.',
  },
]

const testimonials = [
  {
    title: 'Qual o segredo da nossa Fórmula:',
    description:
      'Desenvolvida e recomendada por grandes especialistas brasileiros, Harmony Hair traz o que tem de melhor em um único tratamento, com resultados logo no primeiro mês de uso. É um tratamento 100% natural e seguro. Com fórmula 10x mais de Eficácia do que qualquer suplemento do mercado hoje!',
  },
]

const faqs = [
  {
    question: 'O site exibe valores?',
    answer:
      'Não. A página foi projetada sem preços para manter negociação consultiva e contextual no atendimento.',
  },
  {
    question: 'Como funciona a compra?',
    answer:
      'Toda compra é concluída no WhatsApp com atendimento direto da equipe comercial, de forma personalizada.',
  },
  {
    question: 'Em quanto tempo aparecem percepções de melhora?',
    answer:
      'Isso varia de pessoa para pessoa. A recomendação é manter uso contínuo e acompanhar com o atendimento.',
  },
  {
    question: 'Tem suporte após a compra?',
    answer:
      'Sim. O atendimento continua ativo para orientar continuidade e apoiar a jornada de cada cliente.',
  },
]

const socialProofImages = [
  { src: '/assets/proof/social-1.png', alt: 'Prova social cliente 1' },
  { src: '/assets/proof/social-2.png', alt: 'Prova social cliente 2' },
  { src: '/assets/proof/social-3.png', alt: 'Prova social cliente 3' },
  { src: '/assets/proof/social-4.png', alt: 'Prova social cliente 4' },
  { src: '/assets/proof/social-5.jpg', alt: 'Depoimento Ruth' },
  { src: '/assets/proof/social-6.jpg', alt: 'Ruth com frasco' },
  { src: '/assets/proof/social-7.jpg', alt: 'Depoimento cliente' },
  { src: '/assets/proof/social-8.jpg', alt: 'Depoimento cliente 2' },
]

function useCarousel(length: number, autoPlayMs = 3500) {
  const [current, setCurrent] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback((idx: number) => {
    setCurrent(((idx % length) + length) % length)
  }, [length])

  const next = useCallback(() => go(current + 1), [current, go])
  const prev = useCallback(() => go(current - 1), [current, go])

  useEffect(() => {
    timer.current = setInterval(next, autoPlayMs)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [next, autoPlayMs])

  const reset = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(next, autoPlayMs)
  }, [next, autoPlayMs])

  return { current, go: (i: number) => { go(i); reset() }, next: () => { next(); reset() }, prev: () => { prev(); reset() } }
}

function SocialCarousel() {
  const { current, go, next, prev } = useCarousel(socialProofImages.length)

  return (
    <div className="carousel" aria-label="Depoimentos de clientes">
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {socialProofImages.map((img, i) => (
          <div className="carousel-slide" key={i}>
            <img src={img.src} alt={img.alt} loading="lazy" />
          </div>
        ))}
      </div>
      <button className="carousel-btn carousel-btn--prev" onClick={prev} aria-label="Anterior">
        &#8249;
      </button>
      <button className="carousel-btn carousel-btn--next" onClick={next} aria-label="Próximo">
        &#8250;
      </button>
      <div className="carousel-dots">
        {socialProofImages.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? ' active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Ir para imagem ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function WhatsAppIcon() {
  return (
    <svg className="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.02 3.2c-7.05 0-12.77 5.72-12.77 12.77a12.7 12.7 0 0 0 1.73 6.36l-1.84 6.47 6.64-1.74a12.77 12.77 0 1 0 6.24-23.86zm0 23.44c-2.06 0-4.08-.56-5.84-1.62l-.42-.25-3.94 1.03 1.05-3.84-.28-.44a10.2 10.2 0 1 1 9.43 5.12zm5.6-7.66c-.3-.15-1.8-.88-2.08-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.46a8.9 8.9 0 0 1-1.65-2.05c-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.63-.93-2.24-.24-.58-.48-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.03-1.06 2.5s1.08 2.9 1.23 3.1c.15.2 2.1 3.2 5.08 4.48.7.3 1.25.48 1.67.62.7.22 1.33.2 1.84.12.56-.08 1.8-.74 2.06-1.46.25-.72.25-1.33.18-1.46-.08-.13-.28-.2-.58-.35z"
      />
    </svg>
  )
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const maxScrollable = scrollHeight - clientHeight

      if (maxScrollable <= 0) {
        setScrollProgress(0)
        return
      }

      setScrollProgress((scrollTop / maxScrollable) * 100)
    }

    updateScrollProgress()
    window.addEventListener('scroll', updateScrollProgress, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
    }
  }, [])

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    if (elements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      },
    )

    elements.forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <main>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ width: `${scrollProgress}%` }}></span>
      </div>

      <header className="hero" id="topo">
        <div className="noise" aria-hidden="true"></div>
        <nav className="topbar container">
          <a href="#topo" className="brand" aria-label="HS HAIR">
            <span className="brand-flower" aria-hidden="true">
              ✶
            </span>
            <span>
              HS HAIR
            </span>
          </a>

          <div className="top-links">
            <a href="#provas">Provas</a>
            <a href="#kits">Kits</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="top-actions">
            <a href="https://instagram.com/hshairvitamin" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a className="btn btn-soft" href={whatsappLink(CONTACT_MESSAGE)}>
              <WhatsAppIcon />
              Quero comprar
            </a>
          </div>
        </nav>

        <section className="container hero-grid">
          <article>
            <p className="eyebrow">Harmony Hair</p>
            <h1>Fórmula eficaz com tecnologia que reduz a queda em 98,3%, restaura as falhas e estimula o crescimento de novos fios</h1>
            <div className="cta-row">
              <a className="btn btn-primary" href="#kits">
                Ver kits de tratamento
              </a>
              <a className="btn btn-outline" href={whatsappLink(CONTACT_MESSAGE)}>
                <WhatsAppIcon />
                Quero comprar
              </a>
            </div>
            <ul className="hero-points">
              <li><span role="img" aria-label="flor" style={{marginRight: 8}}>🌸</span>Elimina a queda em até 98,3%</li>
              <li><span role="img" aria-label="flor" style={{marginRight: 8}}>🌸</span>Ajuda preencher as falhas no couro cabeludo</li>
              <li><span role="img" aria-label="flor" style={{marginRight: 8}}>🌸</span>Único com ativo de crescimento de fios</li>
              <li><span role="img" aria-label="flor" style={{marginRight: 8}}>🌸</span>Folículos capilares mais forte e resistente</li>
              <li><span role="img" aria-label="flor" style={{marginRight: 8}}>🌸</span>100% Natural sem contra indicações</li>
            </ul>

            <div className="stat-grid">
              <article>
                <strong>Atendimento humano</strong>
                <span>Atendimento humano</span>
              </article>
            </div>
          </article>

          <figure className="hero-visual">
            <img src="/assets/hero/capa.png" alt="Composição visual da marca Harmony Hair" />
            <img src="/assets/hero/pote.png" alt="Frasco do suplemento Harmony Hair" />
          </figure>
        </section>
      </header>

      <section className="strip container reveal">
        <img src="/assets/benefits/pagamentos.png" alt="Formas de pagamento aceitas" loading="lazy" />
      </section>

      {/* Seção de autoridade removida conforme solicitado */}

      <section className="container section reveal" id="beneficios">
        <div className="section-head">
          <p className="eyebrow">Formula e rotina</p>
          <h2>Confira o poder do Harmony Hair no seu Cabelo:</h2>
        </div>

        <div className="benefit-grid">
          <article className="benefit-card">
            <img src="/assets/benefits/acido-pantotenico.png" alt="Ácido pantotênico" loading="lazy" />
            <h3>Ácido Pantotênico</h3>
            <p>Apontado por especialistas varias vezes como o principal ativo para acabar com a queda do cabelo e manter ele forte e saudável.</p>
          </article>
          <article className="benefit-card">
            <img src="/assets/benefits/biotina.png" alt="Biotina" loading="lazy" />
            <h3>Biotina</h3>
            <p>É essencial para a síntese de queratina, principal ativo para promover o crescimento capilar saudável, evitar quedas, preenche falhas e fortalecer os fios.</p>
          </article>
          <article className="benefit-card">
            <img src="/assets/benefits/niacina.png" alt="Niacina" loading="lazy" />
            <h3>Niacina</h3>
            <p>Ajuda melhorar a circulação sanguínea do couro cabeludo, promovendo o crescimento de novos fios.</p>
          </article>
          <article className="benefit-card">
            <img src="/assets/benefits/selenio.png" alt="Selênio" loading="lazy" />
            <h3>Selênio</h3>
            <p>É um antioxidante que ajuda neutralizar e prevenir o envelhecimento precoce e a deterioração dos tecidos.</p>
          </article>
        </div>
      </section>

      <section className="container section protocol reveal">
        <div className="section-head">
          <p className="eyebrow">Metodo de atendimento</p>
          <h2>Protocolo em 4 fases para obter um tratamento eficaz</h2>
        </div>

        <div className="protocol-grid">
          {protocolSteps.map((step, index) => (
            <article key={step.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section media-section reveal" id="provas">
        <div className="section-head">
          <p className="eyebrow">Provas sociais e bastidores</p>
          <h2>Quem usa, recomenda! Pessoas que experimentaram o Harmony Hair, com mais 98% de satisfação</h2>
        </div>

        <div className="media-grid">
          <video src="/assets/proof/fabrica-custom.mp4?v=20260110" controls muted preload="metadata"></video>
          <img src="/assets/proof/cliente-1.jpg" alt="Cliente com produto Harmony Hair" loading="lazy" />
          <img src="/assets/proof/cliente-2.jpg" alt="Resultado visual de cliente Harmony Hair" loading="lazy" />
          <img src="/assets/proof/cliente-3.jpg" alt="Depoimento visual de cliente" loading="lazy" />
          <video src="/assets/proof/prova-social.mp4" controls muted preload="metadata"></video>
          <img src="/assets/proof/antes-depois-1.png" alt="Antes e depois de cliente" loading="lazy" />
        </div>

        <SocialCarousel />

        <div className="testimonial-grid">
          {testimonials.map((item, index) => (
            <article key={item.title} className="reveal" style={{ transitionDelay: `${index * 90}ms` }}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section kits reveal" id="kits">
        <div className="section-head">
          <p className="eyebrow">Kits recomendados</p>
          <h2>Escolha o perfil ideal e receba orientacao personalizada</h2>
        </div>

        <div className="plans-grid">
          {kits.map((kit, index) => (
            <article
              key={kit.name}
              className="plan-card reveal"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {kit.badge ? <span className="badge">{kit.badge}</span> : null}
              <img src={kit.image} alt={`Kit ${kit.name} Harmony Hair`} loading="lazy" />
              <h3>{kit.name}</h3>
              <p>{kit.profile}</p>
              <div className="card-cta">
                <a className="btn btn-primary" href={whatsappLink(kit.cta)}>
                  <WhatsAppIcon />
                  Conversar com especialista
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section compare reveal">
        <div className="section-head">
          <p className="eyebrow">Diferenciais comerciais</p>

        </div>

        <div className="compare-grid">
          <article>
            <h3>ENTREGA TOTALMENTE SEGURA E 100% GARANTIDA!</h3>
            <ul>
              <li>O Harmony Hair é uma vitamina capilar que concede tratamento completo. Este é um Site 100% Seguro!</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="container section guarantee reveal">
        <img src="/assets/benefits/garantia.png" alt="Selo de garantia da marca Harmony Hair" loading="lazy" />
        <div>
          <p className="eyebrow">Compra segura e suporte</p>
          <h2>Atendimento consultivo com acompanhamento durante toda a jornada</h2>
          <p>
            A recomendacao de kit e feita no WhatsApp por {SALES_AGENT_NAME}, com foco em clareza,
            confianca e continuidade do tratamento.
          </p>
          <a className="btn btn-outline-dark" href={whatsappLink(CONTACT_MESSAGE)}>
            <WhatsAppIcon />
            Quero comprar
          </a>
        </div>
      </section>

      <section className="container section faq reveal" id="faq">
        <div className="section-head">
          <p className="eyebrow">FAQ</p>
          <h2>Perguntas frequentes. Caso tenha alguma outra em específica, basta chamar no Whatsapp!</h2>
        </div>

        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container section final-cta reveal">
        <h2>Pronta para iniciar seu protocolo com acompanhamento humano?</h2>
        <p>
          Clique abaixo, fale com {SALES_AGENT_NAME} e receba a indicacao do kit ideal para sua meta.
        </p>
        <a className="btn btn-primary" href={whatsappLink(CONTACT_MESSAGE)}>
          <WhatsAppIcon />
          Quero comprar
        </a>
      </section>

      <footer className="container footer reveal">
        <a href="#topo" className="brand small" aria-label="HS HAIR">
          <span className="brand-flower" aria-hidden="true">
            ✶
          </span>
          <span>
            HS HAIR
          </span>
        </a>
        <p>
          Site oficial e 100% seguro! Criado por <a href="https://itscomports.com.br" target="_blank" rel="noreferrer">itscomports.com.br</a>
        </p>
      </footer>

      <a
        href={whatsappLink(CONTACT_MESSAGE)}
        className="float-whatsapp"
        aria-label="Comprar pelo WhatsApp"
      >
        <WhatsAppIcon />
        Quero comprar
      </a>
    </main>
  )
}

export default App
