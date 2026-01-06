/* shared/affiliate-config.js
   Single source of truth for all TechFilled affiliate/monetization links.
   Update links here once CJ/AWIN/Impact partners are approved.

   v20260106-utm1 adds:
   - Offer registry (hot-swap ready for CJ/AWIN/Impact)
   - Global UTM defaults (applied by shared/affiliate-apply.js)
*/
window.TECHFILLED_AFFILIATE_CONFIG = {
  version: "20260106-utm1",

  // Global UTM defaults applied to outbound monetization links.
  // Note: do NOT hardcode UTMs into URLs below; keep URLs clean and let affiliate-apply.js append tracking.
  utm: {
    utm_source: "techfilled",
    utm_medium: "pwa",
    // If an offer doesn't specify a campaign, this is used.
    utm_campaign_default: "gumroad"
  },

  // Offer registry: add/replace destinations here without touching any app HTML.
  offers: {
    gumroad: {
      savings_blueprint: {
        url: "https://filledtech.gumroad.com/l/upacz",
        utm_campaign: "simple_savings_blueprint"
      }
    },

    // Hot-swap placeholders (fill these in as approvals land)
    cj: {
      // Example:
      // ally: { url: "https://<cj-tracking-link>", utm_campaign: "cj_ally" }
    },
    awin: {
      // Example:
      // credit_karma: { url: "https://<awin-tracking-link>", utm_campaign: "awin_credit_karma" }
    },
    impact: {
      // Example:
      // chime: { url: "https://<impact-tracking-link>", utm_campaign: "impact_chime" }
    }
  },

  // Back-compat map for existing PWAs using data-affiliate-link keys + legacy IDs
  links: {
    // TechFilled internal placeholders (until affiliate networks are ready)
    high_yield_savings: "https://filledtech-prog.github.io/techfilled/TechFilledHub/",
    budgeting_apps: "https://filledtech-prog.github.io/techfilled/TechFilledHub/",
    credit_monitoring: "https://filledtech-prog.github.io/techfilled/TechFilledHub/",
    credit_builder: "https://filledtech-prog.github.io/techfilled/TechFilledHub/",

    // Gumroad product
    gumroad_savings_blueprint: "https://filledtech.gumroad.com/l/upacz"
  }
};

// Back-compat for older apps that referenced window.TF_AFFILIATES
window.TF_AFFILIATES = window.TF_AFFILIATES || {};
window.TF_AFFILIATES.savings = window.TF_AFFILIATES.savings || {};
window.TF_AFFILIATES.credit = window.TF_AFFILIATES.credit || {};
window.TF_AFFILIATES.gumroad = window.TF_AFFILIATES.gumroad || {};

window.TF_AFFILIATES.savings.highYield = window.TECHFILLED_AFFILIATE_CONFIG.links.high_yield_savings;
window.TF_AFFILIATES.savings.budgetingTool = window.TECHFILLED_AFFILIATE_CONFIG.links.budgeting_apps;
window.TF_AFFILIATES.credit.creditMonitoring = window.TECHFILLED_AFFILIATE_CONFIG.links.credit_monitoring;
window.TF_AFFILIATES.credit.creditBuilder = window.TECHFILLED_AFFILIATE_CONFIG.links.credit_builder;
window.TF_AFFILIATES.gumroad.savingsBlueprint = window.TECHFILLED_AFFILIATE_CONFIG.links.gumroad_savings_blueprint;
