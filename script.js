/* =========================================================
   DAYTONA AUTO CENTER — script.js (Vanilla ES6)
   Nav condense · reveals · counters · carrossel · FAQ
   · máscara de telefone · validação + envio WhatsApp
   ========================================================= */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- nav condensa ao rolar ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- scrollspy: seção ativa na navbar ---------- */
  (() => {
    const navLinks = Array.from(document.querySelectorAll('.nav__link'));
    if (!navLinks.length || !('IntersectionObserver' in window)) return;
    const linkFor = (id) => navLinks.find((l) => l.getAttribute('href') === '#' + id);
    const sections = navLinks
      .map((l) => document.getElementById((l.getAttribute('href') || '').slice(1)))
      .filter(Boolean);
    if (!sections.length) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const link = linkFor(e.target.id);
        if (!link) return;
        navLinks.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  })();

  /* ---------- drawer mobile ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const drawer = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer__link, .drawer .brand');

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.classList.add('is-visible');
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.classList.remove('is-visible');
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  };

  if (menuToggle) menuToggle.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach((link) => link.addEventListener('click', closeDrawer));

  /* ---------- scroll reveals (IntersectionObserver) ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        if (el.dataset.delay) {
          const d = parseFloat(el.dataset.delay);
          el.style.transitionDelay = (d > 10 ? d + 'ms' : d + 's');
        }
        el.classList.add('in');
        revealIO.unobserve(el);
      }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- contadores animados ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dec = el.dataset.dec === '1';
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = target * ease;
      el.textContent = (dec ? v.toFixed(1) : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (dec ? target.toFixed(1) : Math.round(target)) + suffix;
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- carrossel de depoimentos (fade) ---------- */
  (() => {
    const slides = Array.from(document.querySelectorAll('[data-slide]'));
    if (!slides.length) return;
    const dots = Array.from(document.querySelectorAll('[data-dot]'));
    const idxEl = document.querySelector('[data-rv-index]');
    const fillEl = document.querySelector('[data-rv-fill]');
    let i = 0;
    let timer;
    slides[0].classList.add('is-active');
    const update = () => {
      if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
      if (fillEl) fillEl.style.width = ((i + 1) / slides.length * 100) + '%';
    };
    const go = (n) => {
      slides[i].classList.remove('is-active');
      if (dots[i]) dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      if (dots[i]) dots[i].classList.add('is-active');
      update();
    };
    update();
    const reset = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 5500); };
    dots.forEach((d, idx) => d.addEventListener('click', () => { go(idx); reset(); }));
    const prev = document.querySelector('[data-prev]');
    const next = document.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', () => { go(i - 1); reset(); });
    if (next) next.addEventListener('click', () => { go(i + 1); reset(); });
    timer = setInterval(() => go(i + 1), 5500);
  })();

  /* ---------- FAQ acordeão ---------- */
  const faqItems = Array.from(document.querySelectorAll('.faq__item'));
  document.querySelectorAll('.faq__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const ans = item.querySelector('.faq__a');
      const willOpen = !item.classList.contains('open');
      // fecha todos os outros abertos
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherAns = other.querySelector('.faq__a');
          otherAns.style.maxHeight = '0px';
          otherAns.style.opacity = '0';
        }
      });
      item.classList.toggle('open', willOpen);
      ans.style.maxHeight = willOpen ? ans.scrollHeight + 'px' : '0px';
      ans.style.opacity = willOpen ? '1' : '0';
    });
  });

  /* ---------- máscara de telefone BR ---------- */
  const tel = document.getElementById('f-tel');
  if (tel) tel.addEventListener('input', () => {
    let v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    else if (v.length > 0) v = v.replace(/(\d{0,2})/, '($1');
    tel.value = v;
  });

  /* ---------- formulário: validação + envio WhatsApp ---------- */
  const form = document.getElementById('lead-form');
  if (form) form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = form.querySelector('#f-nome');
    const email = form.querySelector('#f-email');
    const phone = form.querySelector('#f-tel');
    const servico = form.querySelector('#f-servico');
    const msg = form.querySelector('#f-msg');
    const fb = document.getElementById('form-feedback');
    let ok = true;

    const setErr = (el, bad) => el.classList.toggle('error', bad);

    if (!name.value.trim()) { setErr(name, true); ok = false; } else setErr(name, false);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { setErr(email, true); ok = false; } else setErr(email, false);

    const phoneClean = phone.value.replace(/\D/g, '');
    const phoneOk = /^\d{10,11}$/.test(phoneClean);
    if (!phoneOk) { setErr(phone, true); ok = false; } else setErr(phone, false);

    if (!servico.value) { setErr(servico, true); ok = false; } else setErr(servico, false);

    if (!ok) {
      fb.classList.add('error');
      fb.textContent = 'Confira os campos destacados.';
      return;
    }
    fb.classList.remove('error');
    fb.textContent = 'Abrindo o WhatsApp...';

    let waMsg = 'Olá, me chamo ' + name.value.trim() + ', vim através do site e gostaria de uma informação.\n\n';
    waMsg += '- E-mail: ' + email.value.trim() + '\n';
    waMsg += '- Telefone: ' + phone.value.trim() + '\n';
    waMsg += '- Serviço: ' + servico.value;
    if (msg.value.trim()) waMsg += '\n- Mensagem: ' + msg.value.trim();

    window.open('https://wa.me/5521974559710?text=' + encodeURIComponent(waMsg), '_blank');
  });

  /* ---------- whatsapp premium: balão + digitação ---------- */
  const waBubble = document.getElementById('wa-message-bubble');
  if (waBubble) {
    const waTyping = document.getElementById('wa-typing');
    const waReal = document.getElementById('wa-real-message');
    const waBadge = document.getElementById('wa-notification');
    const waClose = document.getElementById('wa-close-btn');
    const waMain = document.getElementById('wa-main-btn');

    // mostra o balão após 6s, com 2,5s de "digitando"
    setTimeout(() => {
      waBubble.classList.add('show');
      setTimeout(() => {
        if (waTyping) waTyping.style.display = 'none';
        if (waReal) waReal.style.display = 'block';
      }, 2500);
    }, 6000);

    if (waClose) waClose.addEventListener('click', (e) => {
      e.preventDefault();
      waBubble.classList.remove('show');
      setTimeout(() => { if (waBadge) waBadge.classList.add('show'); }, 2000);
    });

    if (waMain) waMain.addEventListener('click', () => {
      waBubble.classList.remove('show');
      if (waBadge) waBadge.classList.remove('show');
    });
  }

  /* ---------- galpão: som + expandir (lightbox) ---------- */
  const galpaoItems = document.querySelectorAll('.galpao__item');
  const lb = document.getElementById('galpao-lb');
  const lbVideo = document.getElementById('galpao-lb-video');
  const lbLabel = document.getElementById('galpao-lb-label');

  const muteAllGalpao = () => {
    galpaoItems.forEach((it) => {
      const v = it.querySelector('video');
      const b = it.querySelector('.galpao__sound');
      if (v) v.muted = true;
      if (b) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Ativar som'); }
    });
  };

  galpaoItems.forEach((item) => {
    const video = item.querySelector('video');
    const playBtn = item.querySelector('.galpao__play');
    const playBig = item.querySelector('.galpao__playbig');
    const soundBtn = item.querySelector('.galpao__sound');
    const expandBtn = item.querySelector('.galpao__expand');

    if (video) {
      const togglePlay = () => {
        if (video.paused) {
          muteAllGalpao();
          video.muted = false;
          if (soundBtn) {
            soundBtn.classList.add('is-on');
            soundBtn.setAttribute('aria-pressed', 'true');
            soundBtn.setAttribute('aria-label', 'Desativar som');
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      };
      const syncPlay = () => {
        const paused = video.paused;
        item.classList.toggle('is-paused', paused);
        if (playBig) playBig.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
        if (playBtn) {
          playBtn.classList.toggle('is-paused', paused);
          playBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
          playBtn.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
        }
      };
      if (playBtn) playBtn.addEventListener('click', togglePlay);
      if (playBig) playBig.addEventListener('click', togglePlay);
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', syncPlay);
      video.addEventListener('pause', syncPlay);
      syncPlay();
    }

    if (soundBtn && video) soundBtn.addEventListener('click', () => {
      const willUnmute = video.muted;
      muteAllGalpao();
      if (willUnmute) {
        video.muted = false;
        video.play().catch(() => {});
        soundBtn.classList.add('is-on');
        soundBtn.setAttribute('aria-pressed', 'true');
        soundBtn.setAttribute('aria-label', 'Desativar som');
      }
    });

    if (expandBtn && video) expandBtn.addEventListener('click', () => {
      const source = video.querySelector('source');
      const src = source ? source.src : video.currentSrc;
      const labelEl = item.querySelector('.galpao__label');
      openGalpaoLb(src, labelEl ? labelEl.textContent : 'Daytona');
    });
  });

  function openGalpaoLb(src, label) {
    if (!lb || !lbVideo) return;
    muteAllGalpao();
    if (src) lbVideo.src = src;
    if (lbLabel) lbLabel.textContent = label || 'Daytona';
    lbVideo.muted = false;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    lbVideo.play().catch(() => {});
  }

  function closeGalpaoLb() {
    if (!lb || !lbVideo) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    lbVideo.pause();
  }

  if (lb) {
    const lbClose = lb.querySelector('.galpao-lb__close');
    const lbBackdrop = lb.querySelector('.galpao-lb__backdrop');
    if (lbClose) lbClose.addEventListener('click', closeGalpaoLb);
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeGalpaoLb);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) closeGalpaoLb();
    });
  }

});
