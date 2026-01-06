/* shared/affiliate-apply.js
   Robust affiliate link injector for TechFilled monorepo PWAs + Hub.

   Supports:
   - data-affiliate-link="key" attributes (preferred)
   - legacy element IDs:
       tfHighYieldLink, tfBudgetingLink, tfCreditMonitoringLink, tfCreditBuilderLink, tfGumroadLink

   v20260106-utm1 adds:
   - Universal UTM injection (source/medium/campaign/content/term)
   - Hot-swap readiness via shared config (no HTML changes later)
   - Lightweight conversion sanity checks via localStorage click audit
   - Optional debug mode via ?tf_debug=1
*/

(function () {
  "use strict";

  function isDebugEnabled() {
    try {
      const u = new URL(window.location.href);
      return u.searchParams.get("tf_debug") === "1";
    } catch (_) {
      return false;
    }
  }

  const DEBUG = isDebugEnabled();

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

  function safeAppId() {
    // Prefer explicit marker (optional, no HTML changes required)
    const bodyId = (document.body && document.body.getAttribute("data-app-id")) || "";
    if (bodyId && typeof bodyId === "string" && bodyId.trim()) return bodyId.trim();

    // Derive from GitHub Pages path: /techfilled/<AppFolder>/...
    // Hub path ends with /TechFilledHub/ (or /TechFilledHub/index.html)
    try {
      const path = window.location.pathname || "";
      const parts = path.split("/").filter(Boolean);

      // Find "techfilled" repo segment then pick next folder if present
      const repoIdx = parts.indexOf("techfilled");
      if (repoIdx >= 0 && parts.length > repoIdx + 1) {
        const maybeApp = parts[repoIdx + 1];
        if (maybeApp) return maybeApp;
      }

      // Fallback: last folder-like segment
      if (parts.length) return parts[parts.length - 1];
    } catch (_) {}

    return "unknown_app";
  }

  function buildTrackedUrl(baseUrl, meta) {
    const safe = normalizeUrl(baseUrl);
    if (!safe) return null;

    const cfg = getCfg();
    const appId = safeAppId();

    const utmDefaults = (cfg && cfg.utm) ? cfg.utm : {};
    const campaignDefault = utmDefaults.utm_campaign_default || "gumroad";

    const utm = {
      utm_source: utmDefaults.utm_source || "techfilled",
      utm_medium: utmDefaults.utm_medium || "pwa",
      utm_campaign: (meta && meta.utm_campaign) ? meta.utm_campaign : campaignDefault,
      utm_content: (meta && meta.utm_content) ? meta.utm_content : appId,
      utm_term: (meta && meta.utm_term) ? meta.utm_term : ""
    };

    try {
      const u = new URL(safe, window.location.href);

      // Respect any existing UTM params set on the link itself by not overwriting them
      Object.keys(utm).forEach((k) => {
        if (!utm[k]) return;
        if (!u.searchParams.has(k)) u.searchParams.set(k, utm[k]);
      });

      return u.href;
    } catch (_) {
      return safe;
    }
  }

  function pushClickAudit(entry) {
    try {
      const key = "tf_click_audit";
      const raw = window.localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(arr) ? arr : [];

      next.unshift(entry);

      // Cap log size
      const capped = next.slice(0, 100);
      window.localStorage.setItem(key, JSON.stringify(capped));
    } catch (_) {}
  }

  function showDebugBadge(message) {
    if (!DEBUG) return;
    try {
      let badge = document.getElementById("tfDebugBadge");
      if (!badge) {
        badge = document.createElement("div");
        badge.id = "tfDebugBadge";
        badge.style.position = "fixed";
        badge.style.bottom = "10px";
        badge.style.right = "10px";
        badge.style.zIndex = "99999";
        badge.style.maxWidth = "80vw";
        badge.style.padding = "10px 12px";
        badge.style.borderRadius = "10px";
        badge.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
        badge.style.fontSize = "12px";
        badge.style.lineHeight = "1.3";
        badge.style.background = "rgba(0,0,0,0.85)";
        badge.style.color = "#fff";
        badge.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
        badge.style.cursor = "pointer";
        badge.title = "TechFilled debug (click to hide)";
        badge.addEventListener("click", () => badge.remove());
        document.body.appendChild(badge);
      }
      badge.textContent = message;
    } catch (_) {}
  }

  const LEGACY_ID_MAP = {
    tfHighYieldLink: "high_yield_savings",
    tfBudgetingLink: "budgeting_apps",
    tfCreditMonitoringLink: "credit_monitoring",
    tfCreditBuilderLink: "credit_builder",
    tfGumroadLink: "gumroad_savings_blueprint"
  };

  function applyToElement(el, rawUrl, meta) {
    const tracked = buildTrackedUrl(rawUrl, meta);
    const safe = normalizeUrl(tracked);
    if (!safe) return;

    // Do not overwrite a real URL with '#'
    const existing = (el.getAttribute("href") || "").trim();
    if (existing && existing !== "#" && existing !== "javascript:void(0)" && existing !== "javascript:void(0);") {
      // We still apply the tracked URL, but only if it's valid.
    }

    el.setAttribute("href", safe);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");

    // Avoid stacking multiple listeners if apply runs more than once
    if (el.__tfAffiliateBound) return;
    el.__tfAffiliateBound = true;

    // PWA-safe external open + click audit
    el.addEventListener("click", (e) => {
      const ts = new Date().toISOString();
      const appId = safeAppId();
      const placement = (meta && meta.utm_term) ? meta.utm_term : "";

      pushClickAudit({
        ts,
        app: appId,
        key: meta && meta.key ? meta.key : "",
        placement,
        url: safe
      });

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

      const placement =
        (el.getAttribute("data-affiliate-placement") || "").trim() ||
        (el.id || "").trim() ||
        key;

      // Offer-level UTM campaign overrides (if present in cfg.offers)
      let utmCampaign = "";
      if (cfg && cfg.offers && cfg.offers.gumroad && key === "gumroad_savings_blueprint") {
        utmCampaign = cfg.offers.gumroad.savings_blueprint && cfg.offers.gumroad.savings_blueprint.utm_campaign
          ? cfg.offers.gumroad.savings_blueprint.utm_campaign
          : "";
      }

      applyToElement(el, safe, {
        key,
        utm_campaign: utmCampaign,
        utm_content: safeAppId(),
        utm_term: placement
      });
    });

    // Legacy IDs
    Object.keys(LEGACY_ID_MAP).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const key = LEGACY_ID_MAP[id];
      const url = cfg ? cfg.links[key] : null;
      const safe = normalizeUrl(url);
      if (!safe) return;

      const placement = (id || "").trim() || key;

      let utmCampaign = "";
      if (cfg && cfg.offers && cfg.offers.gumroad && key === "gumroad_savings_blueprint") {
        utmCampaign = cfg.offers.gumroad.savings_blueprint && cfg.offers.gumroad.savings_blueprint.utm_campaign
          ? cfg.offers.gumroad.savings_blueprint.utm_campaign
          : "";
      }

      applyToElement(el, safe, {
        key,
        utm_campaign: utmCampaign,
        utm_content: safeAppId(),
        utm_term: placement
      });
    });

    if (DEBUG) {
      showDebugBadge("TechFilled debug enabled: UTMs + click audit active. Open DevTools Console, or check localStorage key 'tf_click_audit'.");
      log("Applied affiliate links with UTMs for app:", safeAppId());
    }
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
