/* =========================================================
   Comportamento do site · Dra. Julielly Andrade Brandão
   Depende de js/config.js (window.SITE_CONFIG)
   ========================================================= */
(() => {
  "use strict";
  const CFG = window.SITE_CONFIG;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waLink = texto => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(texto)}`;

  /* ---------- 1. Links de contato ---------- */
  function setupContactLinks() {
    // Botões do topo da página, FAQ e flutuante abrem o WhatsApp direto
    $$("[data-wa]").forEach(el => {
      const direto = el.classList.contains("fab") || el.closest(".hero") || "direct" in el.dataset;
      if (!direto) return; // os demais levam ao formulário (#contato)
      el.href = waLink(el.dataset.wa);
      el.target = "_blank";
      el.rel = "noopener";
    });
    $$("[data-phone-link]").forEach(a => {
      a.textContent = CFG.telefoneExibido;
      a.href = "tel:+" + CFG.whatsapp;
    });
    $$("[data-social]").forEach(a => CFG[a.dataset.social] ? (a.href = CFG[a.dataset.social]) : a.remove());
    $$(".social").forEach(box => { if (!$("a", box)) box.remove(); });
    const ano = $("#ano"); if (ano) ano.textContent = new Date().getFullYear();
  }

  /* ---------- 2. Menu mobile ---------- */
  function setupMenu() {
    const burger = $(".burger"), menu = $("#menu"), icon = $("path", burger);
    const ABRIR = "M4 7h16M4 12h16M4 17h16", FECHAR = "M6 6l12 12M18 6L6 18";
    const toggle = abrir => {
      menu.classList.toggle("open", abrir);
      burger.setAttribute("aria-expanded", abrir);
      burger.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
      icon.setAttribute("d", abrir ? FECHAR : ABRIR);
    };
    burger.addEventListener("click", () => toggle(!menu.classList.contains("open")));
    menu.addEventListener("click", e => { if (e.target.closest("a")) toggle(false); });
    document.addEventListener("click", e => { if (!e.target.closest("header")) toggle(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { toggle(false); burger.focus(); } });
    matchMedia("(min-width: 901px)").addEventListener("change", () => toggle(false));
  }

  /* ---------- 3. Cabeçalho e item de menu ativo ---------- */
  function setupScrollState() {
    const header = $("header");
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 10);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });

    const links = $$('nav a[href^="#"]:not(.btn)');
    const mapa = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const secoes = [...mapa.keys()].map(id => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.remove("active"));
        mapa.get(en.target.id)?.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secoes.forEach(sec => io.observe(sec));
  }

  /* ---------- 4. Animação de entrada ao rolar ---------- */
  function setupReveal() {
    const alvos = $$(".card, .step, .facts > div, .faq-list details, .alert, .portrait, .info > *, #form, .cv");
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    alvos.forEach(el => {
      el.classList.add("reveal");
      const irmaos = [...el.parentElement.children].filter(c => c.classList.contains("reveal") || alvos.includes(c));
      el.style.transitionDelay = Math.min(irmaos.indexOf(el), 5) * 70 + "ms";
    });
    const io = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    alvos.forEach(el => io.observe(el));
  }

  /* ---------- 5. FAQ: abre uma pergunta por vez ---------- */
  function setupFaq() {
    const itens = $$(".faq-list details");
    itens.forEach(d => d.addEventListener("toggle", () => {
      if (d.open) itens.forEach(o => { if (o !== d) o.open = false; });
    }));
  }

  /* ---------- 6. Formulário -> WhatsApp ---------- */
  function setupForm() {
    const form = $("#form"); if (!form) return;
    const nome = $("#nome");
    let erro = null;
    const mostrarErro = msg => {
      nome.classList.add("invalid");
      if (!erro) { erro = document.createElement("p"); erro.className = "err"; erro.setAttribute("role", "alert"); nome.after(erro); }
      erro.textContent = msg; nome.focus();
    };
    nome.addEventListener("input", () => { nome.classList.remove("invalid"); erro?.remove(); erro = null; });
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (nome.value.trim().length < 2) return mostrarErro("Informe seu nome para continuarmos.");
      const extra = $("#msg").value.trim();
      const texto = `Olá! Meu nome é ${nome.value.trim()}. Gostaria de agendar: ${$("#motivo").value}. ` +
        `Prefiro o período da ${$("#periodo").value.toLowerCase()}.` + (extra ? ` ${extra}` : "");
      window.open(waLink(texto), "_blank", "noopener");
    });
  }

  /* ---------- Início ---------- */
  setupContactLinks(); setupMenu(); setupScrollState(); setupReveal(); setupFaq(); setupForm();
})();
