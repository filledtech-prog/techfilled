/* affiliate-apply.js — PWA-safe external affiliate handler */

(function () {
  "use strict";

  function isExternal(url) {
    try {
      return new URL(url).origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  function applyLinks() {
    document.querySelectorAll("[data-affiliate-link]").forEach(el => {
      const key = el.dataset.affiliateLink;
      const cfg = window.TECHFILLED_AFFILIATE_CONFIG;
      if (!cfg || !cfg.links || !cfg.links[key]) return;

      const url = cfg.links[key];

      el.setAttribute("href", url);
      el.setAttribute("rel", "noopener noreferrer");
      el.setAttribute("target", "_blank");

      // 🔥 Force PWA-safe external navigation
      el.addEventListener("click", e => {
        if (isExternal(url)) {
          e.preventDefault();
          window.open(url, "_blank", "noopener");
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLinks);
  } else {
    applyLinks();
  }
})();
