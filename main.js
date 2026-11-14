
(() => {
  "use strict";

  /* =========================================================
     CONFIGURAÇÃO E UTILITÁRIOS
     ========================================================= */

  const CFG = window.SITE_CONFIG || {};

  const $ = (selector, context = document) =>
    context.querySelector(selector);

  const $$ = (selector, context = document) =>
    [...context.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const whatsappNumber = String(CFG.whatsapp || "").replace(/\D/g, "");

  const waLink = (message = "") => {
    if (!whatsappNumber) return "#";

    const baseUrl = `https://wa.me/${whatsappNumber}`;

    return message
      ? `${baseUrl}?text=${encodeURIComponent(message)}`
      : baseUrl;
  };

  /* =========================================================
     1. LINKS DE CONTATO
     ========================================================= */

  function setupContactLinks() {
    // Links de WhatsApp
    $$("[data-wa]").forEach((element) => {
      const message = element.dataset.wa || "";

      element.href = waLink(message);
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    });

    // Links telefônicos
    $$("[data-phone-link]").forEach((element) => {
      if (!CFG.telefoneExibido || !whatsappNumber) {
        element.hidden = true;
        return;
      }

      element.href = `tel:+${whatsappNumber}`;
      element.textContent = CFG.telefoneExibido;
    });

    // Redes sociais
    $$("[data-social]").forEach((element) => {
      const network = element.dataset.social;
      const url = CFG[network];

      if (!url || !String(url).trim()) {
        element.remove();
        return;
      }

      element.href = url;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    });

    // Remove containers de redes sociais vazios
    $$(".social").forEach((container) => {
      if (!container.querySelector("a")) {
        container.remove();
      }
    });

    // Ano automático no rodapé
    const yearElement = $("#ano");

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  /* =========================================================
     2. MENU RESPONSIVO
     ========================================================= */

  function setupMenu() {
    const burger = $(".burger");
    const menu = $("#menu");

    if (!burger || !menu) return;

    const navLinks = $$('a[href^="#"]', menu);

    const isMobile = () =>
      window.matchMedia("(max-width: 900px)").matches;

    function openMenu() {
      menu.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Fechar menu");
    }

    function closeMenu() {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Abrir menu");
    }

    burger.addEventListener("click", () => {
      const isOpen = menu.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fecha o menu ao selecionar uma seção
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Fecha com Escape
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Fecha ao clicar fora do menu
    document.addEventListener("click", (event) => {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !burger.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // Garante que o menu não permaneça aberto ao voltar ao desktop
    window.addEventListener("resize", () => {
      if (!isMobile()) {
        closeMenu();
      }
    });
  }

  /* =========================================================
     3. ESTADO DO CABEÇALHO E MENU ATIVO
     ========================================================= */

  function setupScrollState() {
    const header = $("header");
    const menuLinks = $$('nav a[href^="#"]');

    if (!header) return;

    function updateHeader() {
      header.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );
    }

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );

    const sections = $$("main section[id]");

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionId = entry.target.id;

          menuLinks.forEach((link) => {
            const targetId = link.getAttribute("href");

            const isActive = targetId === `#${sectionId}`;

            link.classList.toggle("active", isActive);
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /* =========================================================
     4. ANIMAÇÕES DE ENTRADA
     ========================================================= */

  function setupReveal() {
    const elements = $$(
      [
        ".card",
        ".step",
        ".facts > div",
        ".faq-list details",
        ".alert",
        ".portrait",
        ".info",
        ".contact form",
        ".timeline-item"
      ].join(",")
    );

    if (!elements.length) return;

    if (
      reduceMotion ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    elements.forEach((element) => {
      element.classList.add("reveal");
    });

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in");

          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  /* =========================================================
     5. FAQ
     ========================================================= */

  function setupFaq() {
    const questions = $$("details");

    if (!questions.length) return;

    questions.forEach((currentQuestion) => {
      currentQuestion.addEventListener("toggle", () => {
        if (!currentQuestion.open) return;

        questions.forEach((otherQuestion) => {
          if (otherQuestion !== currentQuestion) {
            otherQuestion.open = false;
          }
        });
      });
    });
  }

  /* =========================================================
     6. FORMULÁRIO DE AGENDAMENTO
     ========================================================= */

  function setupForm() {
    const form = $("#form");

    if (!form) return;

    const nameInput = $("#nome", form);
    const reasonInput = $("#motivo", form);
    const periodInput = $("#periodo", form);
    const messageInput = $("#msg", form);
    const submitButton = $("#whatsapp-submit", form);

    if (
      !nameInput ||
      !reasonInput ||
      !periodInput ||
      !submitButton
    ) {
      return;
    }

    // Remove estado de erro quando o usuário corrige o campo
    [nameInput, reasonInput, periodInput].forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
      });

      input.addEventListener("change", () => {
        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      // Verifica se o número do WhatsApp está configurado
      if (!whatsappNumber) {
        alert(
          "O WhatsApp ainda não está configurado. Entre em contato diretamente pelo telefone informado no site."
        );

        return;
      }

      // Validação nativa do formulário
      if (!form.reportValidity()) {
        return;
      }

      const name = nameInput.value.trim();
      const reason = reasonInput.value;
      const period = periodInput.value;
      const message = messageInput
        ? messageInput.value.trim()
        : "";

      if (name.length < 2) {
        nameInput.classList.add("invalid");
        nameInput.setAttribute("aria-invalid", "true");
        nameInput.focus();

        return;
      }

      // Montagem da mensagem
      let text = "Olá! Gostaria de solicitar um agendamento.\n\n";

      text += `Nome: ${name}\n`;
      text += `Motivo do contato: ${reason}\n`;
      text += `Melhor período para contato: ${period}`;

      if (message) {
        text += `\nMensagem: ${message}`;
      }


      const url = waLink(text);

      // Abre o WhatsApp em uma nova aba
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }


  /* =========================================================
     7. INICIALIZAÇÃO
     ========================================================= */

  function init() {
    setupContactLinks();
    setupMenu();
    setupScrollState();
    setupReveal();
    setupFaq();
    setupForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
