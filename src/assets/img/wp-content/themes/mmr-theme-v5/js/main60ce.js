(function() {
  'use strict';

  /* Single source of truth for the drawer breakpoint.
     Matches @media(max-width:1024px) in critical.css / style.css -
     tablets get the drawer too, since hover dropdowns are unusable on touch. */
  var navMQ = window.matchMedia('(max-width: 1024px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function debounce(fn, wait) {
    var t;
    return function() {
      clearTimeout(t);
      t = setTimeout(fn, wait || 150);
    };
  }

  /* Progress bar */
  var bar = document.createElement('div');
  bar.id = 'progress-bar';
  document.body.prepend(bar);

  var header = document.getElementById('site-header');
  var sections = [];
  var ticking = false;

  /* ─── Scroll handler ─── */
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var h = document.documentElement;
        var pos = h.scrollTop;
        var max = h.scrollHeight - h.clientHeight;

        // Progress bar
        bar.style.transform = 'scaleX(' + (max > 0 ? pos / max : 0) + ')';

        // Sticky header
        if (header) header.classList.toggle('scrolled', pos > 10);

        // TOC highlight
        if (sections.length) {
          var current = null;
          var threshold = pos + 130;
          for (var i = 0; i < sections.length; i++) {
            if (sections[i].el.offsetTop <= threshold) current = sections[i];
          }
          for (var j = 0; j < sections.length; j++) {
            sections[j].link.classList.toggle('active', sections[j] === current);
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── Animated canvas helper ───
     Draws only while the canvas is in the viewport AND the tab is visible.
     Previously these loops ran requestAnimationFrame forever, repainting
     hero grids nobody could see and burning battery on mobile. */
  function animatedGridCanvas(cvs, baseAlpha, waveAlpha, speed) {
    var ctx = cvs.getContext('2d');
    if (!ctx) return;
    var t = 0, rafId = null, inView = false;

    function resize() {
      cvs.width = cvs.parentElement.offsetWidth;
      cvs.height = cvs.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', debounce(resize, 120));

    function frame() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      t += reducedMotion ? 0 : speed;
      var sz = 52;
      for (var x = 0; x <= cvs.width + sz; x += sz) {
        ctx.strokeStyle = 'rgba(0,191,165,' + (baseAlpha + waveAlpha * Math.sin(x / 120 + t)) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cvs.height); ctx.stroke();
      }
      for (var y = 0; y <= cvs.height + sz; y += sz) {
        ctx.strokeStyle = 'rgba(0,191,165,' + (baseAlpha + waveAlpha * Math.sin(y / 120 + t + 2)) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cvs.width, y); ctx.stroke();
      }
      // With reduced motion the grid is static: draw once, stop looping.
      if (reducedMotion) { rafId = null; return; }
      rafId = requestAnimationFrame(frame);
    }

    function start() { if (rafId === null) rafId = requestAnimationFrame(frame); }
    function stop()  { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    var io = new IntersectionObserver(function(entries) {
      inView = entries[0].isIntersecting;
      (inView && !document.hidden) ? start() : stop();
    }, { rootMargin: '80px' });
    io.observe(cvs);

    document.addEventListener('visibilitychange', function() {
      (document.hidden || !inView) ? stop() : start();
    });
  }

  /* ─── DOMContentLoaded ─── */
  document.addEventListener('DOMContentLoaded', function() {

    /* Mobile / tablet nav - right drawer */
    var toggle   = document.getElementById('mobile-toggle');
    var nav      = document.getElementById('primary-nav');
    var backdrop = document.getElementById('mmr-nav-backdrop');
    var closeBtn = document.getElementById('mmr-nav-close-btn');

    function openNav() {
      nav.classList.add('open');
      if (backdrop) backdrop.classList.add('show');
      document.documentElement.classList.add('mmr-nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      if (closeBtn) closeBtn.focus();
    }

    function closeNav(returnFocus) {
      document.documentElement.classList.remove('mmr-nav-open');
      document.body.style.overflow = ''; // clear any legacy inline lock
      if (!nav.classList.contains('open')) return;
      nav.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        if (returnFocus) toggle.focus();
      }
      nav.querySelectorAll('.nav-item.active').forEach(function(i) {
        i.classList.remove('active');
      });
    }

    if (toggle && nav) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'primary-nav');

      // Hamburger toggle
      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        nav.classList.contains('open') ? closeNav() : openNav();
      });

      // Close button inside panel
      if (closeBtn) closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeNav(true);
      });

      // Backdrop tap closes panel
      if (backdrop) backdrop.addEventListener('click', function(e) {
        e.stopPropagation();
        closeNav();
      });

      // ESC key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeNav(true);
      });

      // Accordion toggles inside the drawer - only for items with submenus
      nav.querySelectorAll('.nav-item').forEach(function(item) {
        var link = item.querySelector(':scope > .nav-link');
        var submenu = item.querySelector(':scope > .dropdown, :scope > .mega-menu');
        if (!link || !submenu) return;

        link.addEventListener('click', function(e) {
          if (!navMQ.matches) return; // desktop: hover/focus handles it
          e.preventDefault();
          e.stopPropagation();
          var isActive = item.classList.contains('active');
          nav.querySelectorAll('.nav-item.active').forEach(function(i) { i.classList.remove('active'); });
          if (!isActive) item.classList.add('active');
        });

        // Keyboard: Enter/Space toggles the accordion in the drawer
        link.addEventListener('keydown', function(e) {
          if (!navMQ.matches) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            link.click();
          }
        });
      });

      // Submenu links - close panel, let navigation proceed naturally
      nav.querySelectorAll('.dropdown a, .mega-menu a').forEach(function(a) {
        a.addEventListener('click', function(e) {
          e.stopPropagation();
          if (navMQ.matches) closeNav();
        });
      });

      // Direct nav links (no submenu) - navigate and close
      nav.querySelectorAll('.nav-item').forEach(function(item) {
        var link = item.querySelector(':scope > a.nav-link');
        if (!link) return;
        link.addEventListener('click', function(e) {
          e.stopPropagation();
          if (navMQ.matches) closeNav();
        });
      });

      // Auto-close when crossing back to desktop layout
      var onNavMQChange = function(e) { if (!e.matches) closeNav(); };
      if (navMQ.addEventListener) navMQ.addEventListener('change', onNavMQChange);
      else navMQ.addListener(onNavMQChange); // older Safari

      // Any tap outside the open panel closes it - works even if the
      // backdrop element is missing from stale cached markup.
      document.addEventListener('click', function(e) {
        if (!nav.classList.contains('open')) return;
        if (nav.contains(e.target) || (toggle && toggle.contains(e.target))) return;
        closeNav();
      });

      // Back/forward cache restore: never resurrect a locked, opened state.
      window.addEventListener('pageshow', function(e) {
        if (e.persisted) closeNav();
      });
    }

    /* TOC setup */
    var tocAnchors = document.querySelectorAll('.sidebar-toc a[data-num]');
    if (tocAnchors.length) {
      tocAnchors.forEach(function(a) {
        var href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
          var el = document.querySelector(href);
          if (el) sections.push({ el: el, link: a });
        }
      });
    }

    /* Lazy iframes */
    document.querySelectorAll('iframe[data-src]').forEach(function(el) {
      var obs = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) { el.src = el.dataset.src; observer.disconnect(); }
        });
      }, { rootMargin: '200px' });
      obs.observe(el);
    });

    /* ─── Scroll-reveal ─── */
    var revealEls = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function(el){ el.classList.add('revealed'); });
      revealEls = [];
    }
    if (revealEls.length) {
      var revealObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -48px 0px', threshold: 0.08 });
      revealEls.forEach(function(el) { revealObs.observe(el); });
    }

    /* ─── Count-up on .metric-num-cnt and .ht-num ─── */
    var countEls = document.querySelectorAll('.metric-num-cnt[data-count], .ht-num[data-count]');
    if (countEls.length) {
      var countObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          countObs.unobserve(el);
          animateCount(el);
        });
      }, { threshold: 0.5 });
      countEls.forEach(function(el) { countObs.observe(el); });
    }

    function animateCount(el) {
      var raw    = el.getAttribute('data-count');
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var target = parseFloat(raw.replace(/[^0-9.]/g, ''));
      var isInt  = raw.indexOf('.') === -1;
      if (reducedMotion) {
        el.textContent = prefix + (isInt ? Math.round(target).toLocaleString('en-IN') : target.toFixed(1)) + suffix;
        return;
      }
      var dur    = 1400;
      var start  = performance.now();

      function step(now) {
        var progress = Math.min((now - start) / dur, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var val   = eased * target;
        el.textContent = prefix + (isInt ? Math.round(val).toLocaleString('en-IN') : val.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    /* ─── Staggered card entrance ─── */
    var staggerParents = document.querySelectorAll(
      '[data-stagger], .solutions-bento, .process-grid, .pillars-grid, .sp-leaf-list, .related-list, .kb-nextaction-list'
    );
    staggerParents.forEach(function(parent) {
      var children = parent.children;
      var staggerObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          staggerObs.unobserve(entry.target);
          var idx = Array.from(children).indexOf(entry.target);
          entry.target.style.transitionDelay = (idx * 55) + 'ms';
          entry.target.classList.add('revealed');
        });
      }, { rootMargin: '0px 0px -32px 0px', threshold: 0.05 });

      Array.from(children).forEach(function(child) {
        if (!child.hasAttribute('data-reveal')) {
          child.setAttribute('data-reveal', '');
          staggerObs.observe(child);
        }
      });
    });

    /* ─── Auto-reveal: formula boxes and CTA boxes ─── */
    var autoReveal = document.querySelectorAll(
      '.kb-formula, .cta-box, .lg-cta, .sidebar-cta, .sidebar-cta-compact, .kb-block, .sp-table'
    );
    if (autoReveal.length) {
      var autoObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('revealed');
          autoObs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.06 });
      autoReveal.forEach(function(el) {
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', 'scale');
        }
        autoObs.observe(el);
      });
    }

    /* ─── Mesh grid canvas (home hero background) ─── */
    var mesh = document.getElementById('mmr-meshgrid');
    if (mesh && mesh.getContext) {
      animatedGridCanvas(mesh, 0.10, 0.06, 0.004);
    }

    /* ─── Hero metric cards: staggered fade-in + count-up ─── */
    var heroMetrics = [
      { id: 'mc1', valEl: 'mc-revpar-val', chgEl: 'mc-revpar-chg', from: 2800, to: 4250, fmt: rupee, chg: '+34%' },
      { id: 'mc2', valEl: 'mc-adr-val',    chgEl: 'mc-adr-chg',    from: 3500, to: 5200, fmt: rupee, chg: '+18%' },
      { id: 'mc3', valEl: 'mc-occ-val',    chgEl: 'mc-occ-chg',    from: 52,   to: 87,   fmt: function(v){ return v + '%'; }, chg: '+12 pts' },
      { id: 'mc4', valEl: 'mc-profit-val', chgEl: 'mc-profit-chg', from: 180000, to: 342000, fmt: function(v){ return rupeeK(v); }, chg: '+28%' },
      { id: 'mc5' }
    ];
    function rupee(v) { return '\u20b9' + Math.round(v).toLocaleString('en-IN'); }
    function rupeeK(v) { return '\u20b9' + Math.round(v / 1000) + 'K'; }

    if (document.getElementById('mc1')) {
      setTimeout(function() {
        heroMetrics.forEach(function(m) {
          var card = document.getElementById(m.id);
          if (!card) return;
          var delay = parseInt(card.getAttribute('data-mc-delay'), 10) || 0;
          setTimeout(function() {
            card.classList.add('show');
            card.style.opacity = '1';
            if (m.valEl) {
              var valEl = document.getElementById(m.valEl);
              var chgEl = document.getElementById(m.chgEl);
              if (valEl) animateNum(valEl, m.from, m.to, 1200, m.fmt);
              if (chgEl) setTimeout(function() { chgEl.textContent = m.chg; }, 800);
            }
          }, reducedMotion ? 0 : delay);
        });
      }, 200);
    }

    function animateNum(el, from, to, dur, fmt) {
      if (reducedMotion) { el.textContent = fmt(to); return; }
      var t0 = performance.now();
      function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * eased);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(to);
      }
      requestAnimationFrame(tick);
    }

    /* ─── Smooth anchor scrolling with offset ─── */
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var id = a.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          var offset = (header ? header.offsetHeight : 0) + 16;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

    /* ─── Shared faint teal grid canvas background ───
       Used by hero sections on About, Audit, Solutions, and Case Studies.
       Same paused-when-offscreen loop as the homepage mesh. */
    document.querySelectorAll('canvas.js-grid-canvas').forEach(function(cvs) {
      animatedGridCanvas(cvs, 0.08, 0.05, 0.003);
    });

    /* ─── Solution Single: timeline step scroll reveal ─── */
    var steps = document.querySelectorAll('.sol-timeline-step');
    if (steps.length) {
      var stepIO = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            var idx = Array.prototype.indexOf.call(steps, e.target);
            setTimeout(function() { e.target.classList.add('visible'); }, reducedMotion ? 0 : idx * 100);
            stepIO.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      steps.forEach(function(s) { stepIO.observe(s); });
    }

  });

})();

/* ─────────────────────────────────────────────────────────────────────
   LEAD ATTRIBUTION - source/medium/campaign/click-ID tracking.
   Runs on every page (this file is enqueued site-wide) so attribution
   persists across navigation until a lead form submits it. Two cookies:
   First Touch (written once, on the very first recorded visit, never
   overwritten after) and Latest Touch (overwritten only when the current
   pageview actually carries new marketing signal - a utm_ or click-id
   param, or a referrer from outside this site - so clicking around the
   site internally never erases the last real touch). This module only
   reads the URL/referrer and writes cookies; it never talks to the
   server - window.MMR_ATTR.get() is read by a form's own submit handler
   when the visitor actually converts.
   ───────────────────────────────────────────────────────────────────── */
(function() {
  'use strict';

  var FT_COOKIE = 'mmr_ft';
  var LT_COOKIE = 'mmr_lt';
  var COOKIE_DAYS = 90;

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function readJSON(str) {
    try { return JSON.parse(str) || null; } catch (e) { return null; }
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  /* Classifies the current visit into one of the fixed channel buckets.
     UTM parameters are the primary signal (what ad platforms actually tag
     links with); referrer domain + click IDs are the fallback for
     untagged traffic. */
  function classify(p) {
    var src = (p.utm_source || '').toLowerCase();
    var med = (p.utm_medium || '').toLowerCase();
    var ref = (p.referrer || '').toLowerCase();
    var isPaidMedium = /^(cpc|ppc|paid|ad|ads|cpm|display)$/.test(med);

    function refHas(domain) { return ref.indexOf(domain) !== -1; }

    // Click IDs are the strongest possible signal for paid traffic - a
    // platform only ever appends its own click ID on a paid click.
    if (p.gclid || p.wbraid || p.gbraid) return 'Google Ads';
    if ((src === 'google' || src === 'adwords') && isPaidMedium) return 'Google Ads';

    if (src === 'whatsapp' || med === 'whatsapp' || refHas('wa.html') || refHas('whatsapp.com')) return 'WhatsApp';

    if (src === 'facebook' || src === 'fb') return isPaidMedium ? 'Facebook Ads' : 'Facebook Organic';
    if (src === 'instagram' || src === 'ig') return isPaidMedium ? 'Instagram Ads' : 'Instagram Organic';
    if (src === 'linkedin') return isPaidMedium ? 'LinkedIn Ads' : 'LinkedIn Organic';
    if (src === 'youtube') return isPaidMedium ? 'YouTube Ads' : 'YouTube Organic';
    if (src === 'x' || src === 'twitter') return isPaidMedium ? 'X Ads' : 'X Organic';
    if (src === 'tiktok') return isPaidMedium ? 'TikTok Ads' : 'TikTok Organic';
    if (src === 'google') return 'Google Organic';

    // No utm_source tagged on the link - fall back to referrer domain,
    // using a platform click ID (when present) as the paid/organic split.
    if (refHas('facebook.com')) return p.fbclid ? 'Facebook Ads' : 'Facebook Organic';
    if (refHas('instagram.com')) return p.fbclid ? 'Instagram Ads' : 'Instagram Organic';
    if (refHas('linkedin.com')) return 'LinkedIn Organic';
    if (refHas('youtube.com') || refHas('youtu.be')) return 'YouTube Organic';
    if (refHas('twitter.com') || refHas('x.com')) return 'X Organic';
    if (refHas('tiktok.com')) return 'TikTok Organic';
    if (refHas('google.')) return 'Google Organic';

    if (!p.referrer) return 'Direct Website';

    try {
      var host = new URL(p.referrer).hostname.replace(/^www\./, '');
      if (host === window.location.hostname.replace(/^www\./, '')) return 'Direct Website';
    } catch (e) {}

    // A referrer exists, isn't this site, and matched nothing above - a
    // genuine third-party link (a blog, a directory, a forum, etc).
    return 'Other Referral';
  }

  function buildTouch() {
    var p = {
      utm_source:   qs('utm_source'),
      utm_medium:   qs('utm_medium'),
      utm_campaign: qs('utm_campaign'),
      // Ad Set / Ad-Creative have no single universal UTM slot across
      // platforms - accept an explicit ?adset=/?creative= param first,
      // and fall back to the conventional utm_term/utm_content slots.
      utm_term:     qs('adset') || qs('utm_term'),
      utm_content:  qs('creative') || qs('utm_content'),
      gclid:        qs('gclid'),
      wbraid:       qs('wbraid'),
      gbraid:       qs('gbraid'),
      fbclid:       qs('fbclid'),
      referrer:     document.referrer || '',
    };
    var utmParts = [];
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function(k) {
      if (p[k]) utmParts.push(k + '=' + p[k]);
    });
    return {
      source:     classify(p),
      medium:     p.utm_medium || '',
      campaign:   p.utm_campaign || '',
      adset:      p.utm_term || '',
      creative:   p.utm_content || '',
      utm_string: utmParts.join('&'),
      referrer:   p.referrer,
      landing:    window.location.origin + window.location.pathname,
      gclid:      p.gclid,
      wbraid:     p.wbraid,
      gbraid:     p.gbraid,
      date:       new Date().toISOString().slice(0, 10),
    };
  }

  /* Does this pageview carry any signal worth recording as a fresh touch?
     Plain internal navigation (no params, no external referrer) shouldn't
     overwrite - or manufacture - an attribution event. */
  function hasSignal(t) {
    if (t.utm_string || t.gclid || t.wbraid || t.gbraid) return true;
    if (!t.referrer) return false;
    try {
      var refHost = new URL(t.referrer).hostname.replace(/^www\./, '');
      return refHost !== window.location.hostname.replace(/^www\./, '');
    } catch (e) {
      return false;
    }
  }

  var touch = buildTouch();

  if (!getCookie(FT_COOKIE)) {
    // The very first recorded visit is always the first touch, tagged
    // or not - an untagged direct visit is still a real first touch.
    setCookie(FT_COOKIE, JSON.stringify(touch), COOKIE_DAYS);
  }
  if (hasSignal(touch) || !getCookie(LT_COOKIE)) {
    setCookie(LT_COOKIE, JSON.stringify(touch), COOKIE_DAYS);
  }

  window.MMR_ATTR = {
    get: function() {
      var ft = readJSON(getCookie(FT_COOKIE)) || touch;
      var lt = readJSON(getCookie(LT_COOKIE)) || touch;
      return {
        source:     lt.source || 'Unknown',
        medium:     lt.medium || '',
        campaign:   lt.campaign || '',
        adset:      lt.adset || '',
        creative:   lt.creative || '',
        utm_string: lt.utm_string || '',
        referrer:   lt.referrer || '',
        landing:    lt.landing || '',
        gclid:      lt.gclid || '',
        wbraid:     lt.wbraid || '',
        gbraid:     lt.gbraid || '',
        ft_source:  ft.source || 'Unknown',
        ft_date:    ft.date || '',
        lt_source:  lt.source || 'Unknown',
        lt_date:    lt.date || '',
      };
    }
  };
})();
