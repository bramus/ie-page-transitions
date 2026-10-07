/**
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { supportsViewTransitionsWithTypes } from '/dist/ie-page-transitions.shared.js';

class IEPageTransitionsDemoApp {
  constructor() {
    this.apiBanner = document.getElementById('api-banner');
    this.init();
  }

  init() {
    this._checkBrowserSupport();
    this._setupMicroLighterCopyButtons();
    this._setupScrollspy();
    this._setupBrowserShell({
      iframeId: 'spa-iframe',
      urlId: 'spa-nav-url',
      backId: 'spa-nav-back',
      forwardId: 'spa-nav-forward',
      reloadId: 'spa-nav-reload',
      openId: 'spa-nav-open',
      defaultPath: '/spa',
    });
    this._setupBrowserShell({
      iframeId: 'mpa-iframe',
      urlId: 'mpa-nav-url',
      backId: 'mpa-nav-back',
      forwardId: 'mpa-nav-forward',
      reloadId: 'mpa-nav-reload',
      openId: 'mpa-nav-open',
      defaultPath: '/mpa',
    });
  }

  _checkBrowserSupport() {
    if (!this.apiBanner) return;

    const hasTypes = supportsViewTransitionsWithTypes();
    const hasPageReveal = window.PageRevealEvent !== undefined;

    this.apiBanner.replaceChildren();

    const badge = document.createElement('span');
    badge.className = 'api-banner-badge';

    const text = document.createElement('span');

    if (hasTypes && hasPageReveal) {
      this.apiBanner.className = 'api-banner supported';
      badge.textContent = 'Active';

      const strong = document.createElement('strong');
      strong.textContent = 'View Transition API + Active Types: ';
      text.append(
        strong,
        document.createTextNode(
          'Supported in this browser. Both Same-Document (SPA) and Cross-Document (MPA) IE Page Transitions are fully operational.'
        )
      );
    } else if (hasTypes) {
      this.apiBanner.className = 'api-banner fallback';
      badge.textContent = 'Partial';

      const strong = document.createElement('strong');
      strong.textContent = 'Same-Document View Transitions only: ';
      text.append(
        strong,
        document.createTextNode(
          'This browser supports SPA transitions with Active Types, but Cross-Document (MPA) transitions require PageRevealEvent support.'
        )
      );
    } else {
      this.apiBanner.className = 'api-banner unsupported';
      badge.textContent = 'Notice';

      const strong = document.createElement('strong');
      strong.textContent = 'View Transition API with Active Types not available: ';
      text.append(
        strong,
        document.createTextNode(
          'Open this page in Chrome 126+ or Safari 18.2+ (or Internet Explorer 5.5–8.0 for the MPA demo!) to see the transition effects in action.'
        )
      );
    }

    this.apiBanner.append(badge, text);
  }

  _setupBrowserShell({ iframeId, urlId, backId, forwardId, reloadId, openId, defaultPath }) {
    const iframe = document.getElementById(iframeId);
    const navUrl = document.getElementById(urlId);
    const btnBack = document.getElementById(backId);
    const btnForward = document.getElementById(forwardId);
    const btnReload = document.getElementById(reloadId);
    const btnOpen = document.getElementById(openId);

    if (!iframe || !navUrl || !btnBack || !btnForward || !btnReload) return;

    let historyStack = [defaultPath];
    let currentIndex = 0;
    let isUserNav = true;
    let initialNavEntryIndex = null;

    btnBack.disabled = true;
    btnForward.disabled = true;

    const normalizePath = (rawPath, rawSearch = '') => {
      if (!rawPath) return defaultPath;
      let clean = rawPath.replace(/\/index\.html$/i, '').replace(/\.html$/i, '');
      if (clean.length > 1 && clean.endsWith('/')) {
        clean = clean.slice(0, -1);
      }
      return (clean || defaultPath) + rawSearch;
    };

    const syncShellState = () => {
      try {
        const win = iframe.contentWindow;
        if (!win) return;

        const displayPath = normalizePath(win.location.pathname, win.location.search);
        navUrl.textContent = displayPath;
        if (btnOpen) {
          btnOpen.setAttribute('href', displayPath);
        }

        // Prefer the standard Navigation API if available in the iframe's window
        if (win.navigation && win.navigation.currentEntry) {
          const entries = win.navigation.entries();
          const entryIdx = win.navigation.currentEntry.index;
          if (initialNavEntryIndex === null) {
            initialNavEntryIndex = entryIdx;
          }
          btnBack.disabled = entryIdx <= initialNavEntryIndex;
          btnForward.disabled = entryIdx >= entries.length - 1;
          return;
        }

        // Fallback manual history stack tracking
        if (isUserNav) {
          if (currentIndex < historyStack.length - 1) {
            historyStack = historyStack.slice(0, currentIndex + 1);
          }
          if (historyStack[currentIndex] !== displayPath) {
            historyStack.push(displayPath);
            currentIndex++;
          }
        } else {
          isUserNav = true;
        }

        btnBack.disabled = currentIndex <= 0;
        btnForward.disabled = currentIndex >= historyStack.length - 1;
      } catch {
        // Ignore cross-origin errors if any
      }
    };

    btnBack.addEventListener('click', () => {
      try {
        const win = iframe.contentWindow;
        if (!win) return;

        if (win.navigation && win.navigation.currentEntry) {
          if (win.navigation.currentEntry.index > (initialNavEntryIndex ?? 0)) {
            win.navigation.back();
          }
          return;
        }

        if (currentIndex > 0) {
          isUserNav = false;
          currentIndex--;
          win.history.back();
        }
      } catch {}
    });

    btnForward.addEventListener('click', () => {
      try {
        const win = iframe.contentWindow;
        if (!win) return;

        if (win.navigation && win.navigation.currentEntry) {
          if (win.navigation.canGoForward) {
            win.navigation.forward();
          }
          return;
        }

        if (currentIndex < historyStack.length - 1) {
          isUserNav = false;
          currentIndex++;
          win.history.forward();
        }
      } catch {}
    });

    btnReload.addEventListener('click', () => {
      try {
        isUserNav = false;
        iframe.contentWindow?.location.reload();
      } catch {}
    });

    iframe.addEventListener('load', () => {
      syncShellState();
      try {
        iframe.contentWindow?.addEventListener('pageshow', syncShellState);
      } catch {}
    });
  }

  _createCopyIconSvg(isCopied = false) {
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '15');
    svg.setAttribute('height', '15');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.display = 'block';
    svg.style.margin = 'auto';

    if (isCopied) {
      svg.style.color = '#16a34a';
      const polyline = document.createElementNS(svgNs, 'polyline');
      polyline.setAttribute('points', '20 6 9 17 4 12');
      svg.appendChild(polyline);
    } else {
      const rect = document.createElementNS(svgNs, 'rect');
      rect.setAttribute('x', '9');
      rect.setAttribute('y', '9');
      rect.setAttribute('width', '13');
      rect.setAttribute('height', '13');
      rect.setAttribute('rx', '2');
      rect.setAttribute('ry', '2');
      const path = document.createElementNS(svgNs, 'path');
      path.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');
      svg.append(rect, path);
    }

    return svg;
  }

  _setupMicroLighterCopyButtons() {
    if (typeof customElements === 'undefined') return;

    const enhanceAll = () => {
      document.querySelectorAll('micro-lighter').forEach((lighter) => {
        const button = lighter.shadowRoot?.querySelector('button[part="copy-button"]');
        if (!button || button.dataset.iconEnhanced === 'true') return;
        button.dataset.iconEnhanced = 'true';

        let currentLabel = 'Copy code';
        const renderIcon = (label) => {
          currentLabel = String(label || 'Copy');
          const isCopied = currentLabel.toLowerCase().includes('copied');
          button.setAttribute('aria-label', isCopied ? 'Copied' : 'Copy code');
          button.setAttribute('title', isCopied ? 'Copied' : 'Copy code');
          button.replaceChildren(this._createCopyIconSvg(isCopied));
        };

        Object.defineProperty(button, 'textContent', {
          configurable: true,
          get() {
            return currentLabel;
          },
          set(value) {
            renderIcon(value);
          },
        });

        renderIcon('Copy');
      });
    };

    if (customElements.get('micro-lighter')) {
      enhanceAll();
    } else {
      customElements.whenDefined('micro-lighter').then(enhanceAll);
    }
  }

  _setupScrollspy() {
    const navLinks = document.querySelectorAll('.sidenav-list a');
    const sections = Array.from(navLinks)
      .map((link) => {
        const id = link.getAttribute('href').replace('#', '');
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('is-active');
              } else {
                link.classList.remove('is-active');
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new IEPageTransitionsDemoApp());
  } else {
    new IEPageTransitionsDemoApp();
  }
}
