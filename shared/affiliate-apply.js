/* shared/affiliate-apply.js
   Robust affiliate link injector for TechFilled monorepo PWAs + Hub.

   Supports:
   - data-affiliate-link="key" attributes (preferred)
   - legacy element IDs:
       tfHighYieldLink, tfBudgetingLink, tfCreditMonitoringLink, tfCreditBuilderLink, tfGumroadLink
*/

(function () {
  "use strict";

  const DEBUG = false;

  function log(...args) {
    if (DEBUG) console.log("[affiliate-apply]", ...args);
  }

  function getCfg() {
    const cfg = window.TECHFILLED_AFFILIATE_CONFIG;
    if (cfg && cfg.links && typeof cfg.links === "object") return cfg;
    return null;
  }

  function normalizeUrl(url) {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (!/^https?:\/\//i.test(trimmed)) return null;
    return trimmed;
  }

  const LEGACY_ID_MAP = {
    tfHighYieldLink: "high_yield_savings",
    tfBudgetingLink: "budgeting_apps",
    tfCreditMonitoringLink: "credit_monitoring",
    tfCreditBuilderLink: "credit_builder",
    tfGumroadLink: "gumroad_savings_blueprint"
  };

  function applyToElement(el, url) {
    const safe = normalizeUrl(url);
    if (!safe) return;

    // Do not overwrite a real URL with '#'
    const existing = (el.getAttribute("href") || "").trim();
    if (existing && existing !== "#" && existing !== "javascript:void(0)" && existing !== "javascript:void(0);") {
      // If config differs, we still prefer config. But never set to invalid.
    }

    el.setAttribute("href", safe);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");

    // PWA-safe external open
    el.addEventListener("click", (e) => {
      try {
        const dest = new URL(safe, window.location.href);
        const isExternal = dest.origin !== window.location.origin;
        if (isExternal) {
          e.preventDefault();
          window.open(dest.href, "_blank", "noopener");
        }
      } catch (_) {}
    });
  }

  function applyAffiliateLinks() {
    const cfg = getCfg();

    // Preferred: data-affiliate-link
    document.querySelectorAll("[data-affiliate-link]").forEach((el) => {
      const key = (el.getAttribute("data-affiliate-link") || "").trim();
      if (!key) return;

      const url = cfg ? cfg.links[key] : null;
      const safe = normalizeUrl(url);
      if (!safe) {
        log("no url for key", key);
        return;
      }
      applyToElement(el, safe);
    });

    // Legacy IDs
    Object.keys(LEGACY_ID_MAP).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const key = LEGACY_ID_MAP[id];
      const url = cfg ? cfg.links[key] : null;
      const safe = normalizeUrl(url);
      if (!safe) return;

      applyToElement(el, safe);
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  // Short retry window for config load order
  function runWithRetries() {
    let attempts = 0;
    const maxAttempts = 10;
    const intervalMs = 100;

    const timer = setInterval(() => {
      attempts += 1;
      if (getCfg()) {
        clearInterval(timer);
        applyAffiliateLinks();
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        applyAffiliateLinks();
      }
    }, intervalMs);
  }

  ready(runWithRetries);
})();
