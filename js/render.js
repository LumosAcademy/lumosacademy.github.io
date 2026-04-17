/* =============================================================
   Lumos Academy — UI Renderer
   Takes a content object (loaded from content/<lang>.json) and
   composes the page. All user-facing strings live in content/.
   Layout classes are preserved so main.css continues to work.
   ============================================================= */

(function () {
  'use strict';

  /* ── Tiny HTML helpers ─────────────────────────────────────
     `h` builds an element from a tag + attrs + children array.
     `t` creates a text node. Use `raw(html)` only for strings
     that come from content.*.json fields explicitly marked
     "...Html" (they're trusted content, not user input).
     ──────────────────────────────────────────────────────── */
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style') el.setAttribute('style', v);
        else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v);
      }
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }

  function t(text) { return document.createTextNode(text); }

  /* ── SECTION BUILDERS ──────────────────────────────────── */

  function buildAnnouncement(c) {
    return h('div', { class: 'ann-bar' }, [
      c.text,
      h('a', { href: c.linkHref }, [c.linkText])
    ]);
  }

  function buildNav(c, lang, languageConfig) {
    const linkItems = c.links.map(function (l) {
      return h('li', null, [h('a', { href: l.href }, [l.label])]);
    });

    return h('nav', null, [
      h('div', { class: 'nav-i' }, [
        h('a', { href: '#home', class: 'logo' }, [
          h('img', { src: 'assets/logo.jpeg', alt: c.logoAlt, class: 'nav-logo' })
        ]),
        h('ul', { class: 'nav-links' }, linkItems),
        h('div', { class: 'nav-cta' }, [
          buildLanguageSwitcher(languageConfig, lang),
          h('a', {
            href: '#enroll', class: 'btn btn-outline',
            style: 'padding:9px 18px;font-size:.88rem;'
          }, [c.ctaWaitlist]),
          h('a', {
            href: '#enroll', class: 'btn btn-primary',
            style: 'padding:9px 18px;font-size:.88rem;'
          }, [c.ctaEnroll])
        ]),
        h('div', { class: 'hamburger', id: 'ham', onclick: function () { window.toggleMenu(); } },
          [h('span'), h('span'), h('span')])
      ])
    ]);
  }

  function buildLanguageSwitcher(languageConfig, currentLang) {
    const select = h('select', {
      class: 'lang-switcher',
      'aria-label': languageConfig.switcherLabel,
      onchange: function (e) { window.setLanguage(e.target.value); }
    }, languageConfig.options.map(function (opt) {
      const a = { value: opt.code };
      if (opt.code === currentLang) a.selected = 'selected';
      return h('option', a, [opt.label]);
    }));
    return select;
  }

  function buildMobileMenu(nav) {
    const linkItems = nav.links.map(function (l) {
      return h('li', null, [
        h('a', { href: l.href, onclick: function () { window.closeMenu(); } }, [l.label])
      ]);
    });
    return h('div', { class: 'mob-menu', id: 'mobMenu' }, [
      h('ul', null, linkItems),
      h('a', {
        href: '#enroll', class: 'btn btn-primary',
        style: 'width:100%;',
        onclick: function () { window.closeMenu(); }
      }, [nav.mobileCtaLabel])
    ]);
  }

  function buildHero(c) {
    const stats = c.stats.map(function (s) {
      return h('div', null, [
        h('div', { class: 'hs-num' }, [s.num]),
        h('div', { class: 'hs-lbl' }, [s.label])
      ]);
    });

    const tiles = c.tiles.map(function (tile) {
      return h('div', { class: 'hero-img-box' }, [
        h('div', { class: 'hero-ph' }, [
          h('span', { class: 'ico' }, [tile.icon]),
          tile.caption
        ])
      ]);
    });

    return h('section', { class: 'hero', id: 'home' }, [
      h('div', { class: 'hero-i' }, [
        h('div', null, [
          h('div', { class: 'hero-badge' }, [c.badge]),
          h('h1', null, [c.titleLine1, h('br'), h('span', null, [c.titleLine2])]),
          h('p', null, [c.description]),
          h('div', { class: 'hero-btns' }, [
            h('a', { href: c.primaryCta.href,   class: 'btn btn-primary btn-lg' }, [c.primaryCta.label]),
            h('a', { href: c.secondaryCta.href, class: 'btn btn-ghost btn-lg'   }, [c.secondaryCta.label])
          ]),
          h('div', { class: 'hero-stats' }, stats)
        ]),
        h('div', { class: 'hero-img' }, [h('div', { class: 'hero-img-grid' }, tiles)])
      ])
    ]);
  }

  function buildSectionHead(badge, title, description, options) {
    options = options || {};
    const badgeAttrs = { class: 'badge' };
    if (options.invertedBadge) badgeAttrs.style = 'background:rgba(255,255,255,.14);color:rgba(255,255,255,.88);';
    return h('div', { class: 'sec-head' }, [
      h('div', badgeAttrs, [badge]),
      h('h2', null, [title]),
      h('p', null, [description])
    ]);
  }

  function buildDifferentiators(c) {
    const cards = c.items.map(function (i) {
      return h('div', { class: 'diff-card' }, [
        h('div', { class: 'diff-ic' }, [i.icon]),
        h('h3', null, [i.title]),
        h('p', null, [i.description])
      ]);
    });
    return h('section', { class: 'diff-sec', id: 'about' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'diff-grid' }, cards)
      ])
    ]);
  }

  function buildCourses(c) {
    const cards = c.items.map(function (i) {
      return h('div', { class: 'cc ' + i.color }, [
        h('div', { class: 'cc-emo' }, [i.icon]),
        h('h3', null, [i.title]),
        h('p', null, [i.description]),
        h('span', { class: 'cc-tag' }, [i.tag])
      ]);
    });
    return h('section', { id: 'courses' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'courses-grid' }, cards)
      ])
    ]);
  }

  function buildPricing(c) {
    const cards = c.plans.map(function (p) {
      const features = p.features.map(function (f) { return h('li', null, [f]); });
      const children = [];
      if (p.featured && p.featuredBadge) {
        children.push(h('div', { class: 'pc-badge' }, [p.featuredBadge]));
      }
      children.push(
        h('h3', null, [p.title]),
        h('div', { class: 'pc-price' }, [p.price]),
        h('div', { class: 'pc-per' },   [p.per]),
        h('div', { class: 'pc-desc' },  [p.description]),
        h('ul', { class: 'pc-feats' }, features),
        h('a', {
          href: p.ctaHref,
          class: p.featured ? 'btn btn-lg' : 'btn btn-primary'
        }, [p.ctaLabel])
      );
      return h('div', { class: p.featured ? 'pc feat' : 'pc' }, children);
    });

    return h('section', { class: 'pricing-sec', id: 'programs' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description, { invertedBadge: true }),
        h('div', { class: 'pricing-grid' }, cards),
        h('p', { class: 'pricing-note' }, [
          c.noteText,
          h('a', { href: c.noteLink.href }, [c.noteLink.label])
        ])
      ])
    ]);
  }

  function buildHowItWorks(c) {
    const steps = c.steps.map(function (s) {
      return h('div', { class: 'step' }, [
        h('div', { class: 'step-n' }, [s.n]),
        h('h3', null, [s.title]),
        h('p', null, [s.description])
      ]);
    });
    return h('section', { class: 'hiw-sec', id: 'how-it-works' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'steps-grid' }, steps)
      ])
    ]);
  }

  function buildTeam(c) {
    const cards = c.members.map(function (m) {
      return h('div', { class: 'tc' }, [
        h('div', { class: 'tc-photo' }, [m.photo]),
        h('div', { class: 'tc-info' }, [
          h('h3', null, [m.name]),
          h('div', { class: 'tc-role' }, [m.role]),
          h('p', null, [m.bio])
        ])
      ]);
    });
    return h('section', { class: 'team-sec', id: 'team' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'team-grid' }, cards),
        h('p', {
          style: 'text-align:center;color:var(--gray-600);margin-top:28px;font-size:.88rem;'
        }, [
          c.footerText,
          h('a', { href: c.footerLink.href, style: 'color:var(--blue);font-weight:600;' }, [c.footerLink.label])
        ])
      ])
    ]);
  }

  function buildFaq(c) {
    const items = c.items.map(function (i) {
      return h('div', { class: 'faq-item' }, [
        h('div', {
          class: 'faq-q',
          onclick: function (e) { window.toggleFaq(e.currentTarget); }
        }, [i.q, h('span', { class: 'faq-arr' }, ['▾'])]),
        h('div', { class: 'faq-a' }, [i.a])
      ]);
    });
    return h('section', { id: 'faq' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'faq-list' }, items)
      ])
    ]);
  }

  function buildEnrollCta(c) {
    return h('div', { class: 'enroll-cta' }, [
      h('div', { class: 'container' }, [
        h('h2', null, [c.title]),
        h('p',  null, [c.description]),
        h('div', { class: 'enroll-btns' }, [
          h('a', { href: c.primaryCta.href,   class: 'btn btn-white btn-lg' }, [c.primaryCta.label]),
          h('a', { href: c.secondaryCta.href, class: 'btn btn-ghost btn-lg' }, [c.secondaryCta.label])
        ])
      ])
    ]);
  }

  /* ── Form rendering helpers ──────────────────────────── */

  function fg(label, inputEl) {
    return h('div', { class: 'fg' }, [h('label', null, [label]), inputEl]);
  }

  function fgRow(children) {
    return h('div', { class: 'fg-row' }, children);
  }

  function selectEl(required, prompt, options) {
    const children = [h('option', { value: '' }, [prompt])];
    options.forEach(function (o) { children.push(h('option', null, [o])); });
    return h('select', required ? { required: 'required' } : null, children);
  }

  function ageSelect(prompt) {
    const options = [];
    options.push(h('option', { value: '' }, [prompt]));
    for (let a = 5; a <= 14; a++) options.push(h('option', null, [String(a)]));
    return h('select', { required: 'required' }, options);
  }

  function buildEnrollmentForm(f) {
    const form = h('form', {
      id: 'enrollForm',
      onsubmit: function (e) { window.submitEnrollment(e); }
    }, [
      fgRow([
        fg(f.labels.parentName, h('input', { type: 'text',  placeholder: f.placeholders.parentName, required: 'required' })),
        fg(f.labels.email,      h('input', { type: 'email', placeholder: f.placeholders.email,      required: 'required' }))
      ]),
      fgRow([
        fg(f.labels.phone, h('input', { type: 'tel', placeholder: f.placeholders.phone })),
        fg(f.labels.city,  selectEl(true, f.selects.cityPrompt, f.selects.cities))
      ]),
      fgRow([
        fg(f.labels.childAge, ageSelect(f.selects.agePrompt)),
        fg(f.labels.program,  selectEl(true, f.selects.programPrompt, f.selects.programs))
      ]),
      fg(f.labels.courses, h('input', { type: 'text', placeholder: f.placeholders.courses })),
      fg(f.labels.notes,   h('textarea', { placeholder: f.placeholders.notes })),
      h('button', { type: 'submit', class: 'btn btn-primary btn-lg' }, [f.submit])
    ]);

    const success = h('div', { class: 'form-success', id: 'enrollSuccess' }, [
      h('div', { class: 'ico' }, [f.success.icon]),
      h('h4', null, [f.success.title]),
      h('p', null,  [f.success.message])
    ]);

    return h('div', { class: 'form-card' }, [
      h('h3', null, [f.title]),
      h('p', { class: 'sub' }, [f.subtitle]),
      form,
      success
    ]);
  }

  function buildWaitlistForm(f) {
    const form = h('form', {
      id: 'waitlistForm',
      onsubmit: function (e) { window.submitWaitlist(e); }
    }, [
      fg(f.labels.parentName, h('input', { type: 'text',  placeholder: f.placeholders.parentName, required: 'required' })),
      fg(f.labels.email,      h('input', { type: 'email', placeholder: f.placeholders.email,      required: 'required' })),
      fg(f.labels.phone,      h('input', { type: 'tel',   placeholder: f.placeholders.phone })),
      fgRow([
        fg(f.labels.childAge, ageSelect(f.selects.agePrompt)),
        fg(f.labels.weeks,    selectEl(false, f.selects.weeksPrompt, f.selects.weeksOptions))
      ]),
      fg(f.labels.source,   selectEl(false, f.selects.sourcePrompt, f.selects.sources)),
      fg(f.labels.comments, h('textarea', { placeholder: f.placeholders.comments })),
      h('button', {
        type: 'submit', class: 'btn btn-lg',
        style: 'background:var(--teal);color:#fff;width:100%;'
      }, [f.submit])
    ]);

    const success = h('div', { class: 'form-success', id: 'waitlistSuccess' }, [
      h('div', { class: 'ico' }, [f.success.icon]),
      h('h4', null, [f.success.title]),
      h('p', null,  [f.success.message])
    ]);

    const aid = h('div', { class: 'aid-note' }, [
      f.aidNote.prefix,
      h('strong', null, [f.aidNote.bold]),
      f.aidNote.text,
      h('a', { href: f.aidNote.link.href }, [f.aidNote.link.label]),
      f.aidNote.suffix
    ]);

    return h('div', { class: 'form-card' }, [
      h('h3', null, [f.title]),
      h('p', { class: 'sub' }, [f.subtitle]),
      form,
      success,
      aid
    ]);
  }

  function buildEnroll(c) {
    return h('section', { id: 'enroll' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'forms-grid' }, [
          buildEnrollmentForm(c.enrollForm),
          buildWaitlistForm(c.waitlistForm)
        ])
      ])
    ]);
  }

  function buildContact(c) {
    const info = c.info;
    const infoItems = info.items.map(function (it) {
      return h('div', { class: 'c-item' }, [
        h('div', { class: 'c-ic' }, [it.icon]),
        h('div', null, [
          h('h4', null, [it.title]),
          h('p', { html: it.linesHtml })
        ])
      ]);
    });

    const infoCol = h('div', { class: 'ci' }, [
      h('h3', null, [info.title]),
      h('p', null, [info.intro])
    ].concat(infoItems));

    const f = c.form;
    const form = h('form', {
      id: 'contactForm',
      onsubmit: function (e) { window.submitContact(e); }
    }, [
      fg(f.labels.name,    h('input', { type: 'text',  placeholder: f.placeholders.name,  required: 'required' })),
      fg(f.labels.email,   h('input', { type: 'email', placeholder: f.placeholders.email, required: 'required' })),
      fg(f.labels.subject, h('select', null, f.subjects.map(function (s) { return h('option', null, [s]); }))),
      fg(f.labels.message, h('textarea', { placeholder: f.placeholders.message, required: 'required' })),
      h('button', { type: 'submit', class: 'btn btn-primary', style: 'width:100%;' }, [f.submit])
    ]);

    const success = h('div', { class: 'form-success', id: 'contactSuccess' }, [
      h('div', { class: 'ico' }, [f.success.icon]),
      h('h4', null, [f.success.title]),
      h('p', null,  [f.success.message])
    ]);

    const formCol = h('div', null, [
      h('div', { class: 'form-card' }, [
        h('h3', null, [f.title]),
        h('p', { class: 'sub' }, [f.subtitle]),
        form,
        success
      ])
    ]);

    return h('section', { id: 'contact', style: 'background:var(--gray-100);' }, [
      h('div', { class: 'container' }, [
        buildSectionHead(c.badge, c.title, c.description),
        h('div', { class: 'contact-grid' }, [infoCol, formCol])
      ])
    ]);
  }

  function buildFooter(c) {
    const brand = h('div', { class: 'fb' }, [
      h('a', { href: '#home', class: 'logo footer-logo' }, [
        h('img', { src: 'assets/logo.jpeg', alt: c.logoAlt, class: 'footer-logo-img' })
      ]),
      h('p', null, [c.tagline]),
      h('div', { class: 'social-links' }, [
        h('a', {
          class: 'sl',
          href: c.instagramUrl,
          target: '_blank',
          rel: 'noopener',
          title: 'Instagram'
        }, ['📷'])
      ])
    ]);

    const cols = c.columns.map(function (col) {
      return h('div', { class: 'fc' }, [
        h('h4', null, [col.title]),
        h('ul', null, col.links.map(function (l) {
          return h('li', null, [h('a', { href: l.href }, [l.label])]);
        }))
      ]);
    });

    const legal = c.legalLinks.map(function (l, idx) {
      const parts = [];
      if (idx > 0) parts.push(' · ');
      parts.push(h('a', { href: l.href }, [l.label]));
      return parts;
    }).reduce(function (acc, cur) { return acc.concat(cur); }, []);

    return h('footer', null, [
      h('div', { class: 'footer-i' }, [
        h('div', { class: 'footer-grid' }, [brand].concat(cols)),
        h('div', { class: 'footer-bot' }, [
          h('p', null, [c.copyright]),
          h('p', null, legal)
        ])
      ])
    ]);
  }

  /* ── <head> updates for SEO / social ──────────────────── */
  function updateHead(meta, lang) {
    document.documentElement.setAttribute('lang', lang);
    document.title = meta.title;
    setMeta('name',     'description',            meta.description);
    setMeta('name',     'keywords',               meta.keywords);
    setMeta('property', 'og:title',               meta.ogTitle);
    setMeta('property', 'og:description',         meta.ogDescription);
    setMeta('property', 'og:image:alt',           meta.ogImageAlt);
    setMeta('name',     'twitter:title',          meta.twitterTitle);
    setMeta('name',     'twitter:description',    meta.twitterDescription);
  }

  function setMeta(attr, key, value) {
    let el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  /* ── Top-level render ─────────────────────────────────── */
  function render(content) {
    const root = document.getElementById('app');
    if (!root) throw new Error('[LAC] Missing #app root element');

    updateHead(content.meta, content.lang);

    root.innerHTML = '';
    root.appendChild(buildAnnouncement(content.announcement));
    root.appendChild(buildNav(content.nav, content.lang, content.language));
    root.appendChild(buildMobileMenu(content.nav));
    root.appendChild(buildHero(content.hero));
    root.appendChild(buildDifferentiators(content.differentiators));
    root.appendChild(buildCourses(content.courses));
    root.appendChild(buildPricing(content.pricing));
    root.appendChild(buildHowItWorks(content.howItWorks));
    root.appendChild(buildTeam(content.team));
    root.appendChild(buildFaq(content.faq));
    root.appendChild(buildEnrollCta(content.enrollCta));
    root.appendChild(buildEnroll(content.enroll));
    root.appendChild(buildContact(content.contact));
    root.appendChild(buildFooter(content.footer));
  }

  /* ── Public API ───────────────────────────────────────── */
  window.LAC = window.LAC || {};
  window.LAC.render = render;
})();
