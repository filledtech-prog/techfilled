/* affiliate-apply.js
   TechFilled affiliate link injector (Hub + PWAs)

   Works with:
   - data-affiliate-link="key" (preferred)
   - legacy id-based links (tfHighYieldLink, tfGumroadLink, etc.)

   Safety:
   - Never overwrites a non-placeholder href unless a valid config URL exists.
   - If config is missing, hardcoded hrefs keep working (important for Gumroad).
*/

(function () {
  "use strict";

  var DEBUG = false;

  function log() {
    if (!DEBUG) return;
    try { console.log.apply(console, ["[affiliate-apply]"].concat([].slice.call(arguments))); } catch (e) {}
  }

  function getCfg() {
    // Preferred config
    if (window.TECHFILLED_AFFILIATE_CONFIG && window.TECHFILLED_AFFILIATE_CONFIG.links) {
      return window.TECHFILLED_AFFILIATE_CONFIG;
    }
    // Back-compat config
    if (window.TF_AFFILIATES) {
      return window.TF_AFFILIATES;
    }
    return null;
  }

  function normalizeUrl(url) {
    if (!url || typeof url !== "string") return null;
    var u = url.trim();
    if (!u) return null;
    if (u === "#") return null;
    if (!/^https?:\/\//i.test(u)) return null;
    return u;
  }

  // Preferred: data-affiliate-link
  function applyDataAffiliateLinks(cfg) {
    var links = (cfg && cfg.links) ? cfg.links : null;
    var nodes = document.querySelectorAll("[data-affiliate-link]");
    if (!nodes || !nodes.length) return;

    nodes.forEach(function (el) {
      var key = (el.getAttribute("data-affiliate-link") || "").trim();
      if (!key) return;

      var cfgUrl = links ? normalizeUrl(links[key]) : null;

      if (!cfgUrl) {
        // No config URL; do NOT overwrite existing good href.
        log("no config url for key:", key);
        return;
      }

      el.setAttribute("href", cfgUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
      log("applied data key:", key, "=>", cfgUrl);
    });
  }

  // Legacy: id-based links used in some PWAs
  function safeSetLink(id, url, fallbackText) {
    var el = document.getElementById(id);
    if (!el) return;

    var cfgUrl = normalizeUrl(url);

    // Only set to '#' if the element is currently placeholder.
    // Otherwise, leave existing href alone (prevents breaking hardcoded Gumroad links).
    var currentHref = el.getAttribute("href") || "";
    var isPlaceholder = !currentHref || currentHref === "#";

    if (!cfgUrl) {
      if (isPlaceholder) {
        el.setAttribute("href", "#");
        el.style.pointerEvents = "none";
        el.style.opacity = "0.6";
        if (fallbackText) el.textContent = fallbackText;
      }
      return;
    }

    el.setAttribute("href", cfgUrl);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  }

  function applyLegacyLinks(cfg) {
    // If cfg is in the new schema, map legacy ids to new keys
    var links = (cfg && cfg.links) ? cfg.links : null;

    // If cfg is old schema
    var old = window.TF_AFFILIATES || null;

    safeSetLink("tfHighYieldLink",
      (links && links.high_yield_savings) || (old && old.savings && old.savings.highYield),
      "High-yield savings options (coming soon)"
    );

    safeSetLink("tfBudgetingLink",
      (links && links.budgeting_apps) || (old && old.savings && old.savings.budgetingTool),
      "Budgeting & expense tracking apps (coming soon)"
    );

    safeSetLink("tfCreditMonitoringLink",
      (links && links.credit_monitoring) || (old && old.credit && old.credit.creditMonitoring),
      "Credit monitoring options (coming soon)"
    );

    safeSetLink("tfCreditBuilderLink",
      (links && links.credit_builder) || (old && old.credit && old.credit.creditBuilder),
      "Credit builder tools (coming soon)"
    );

    safeSetLink("tfGumroadLink",
      (links && links.gumroad_savings_blueprint) || (old && old.gumroad && old.gumroad.savingsBlueprint)
    );
  }

  function applyAll() {
    var cfg = getCfg() || {};
    applyDataAffiliateLinks(cfg);
    applyLegacyLinks(cfg);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  // Some pages may load config late; retry briefly.
  function runWithRetries() {
    var attempts = 0;
    var maxAttempts = 10;
    var timer = setInterval(function () {
      attempts += 1;
      var cfg = getCfg();
      if (cfg) {
        clearInterval(timer);
        applyAll();
        return;
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        applyAll();
      }
    }, 100);
  }

  ready(runWithRetries);
})();
