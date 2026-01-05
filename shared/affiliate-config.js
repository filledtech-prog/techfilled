/* shared/affiliate-config.js
   Single source of truth for all TechFilled affiliate/monetization links.
   Update links here once CJ/AWIN/Impact partners are approved.
*/
window.TECHFILLED_AFFILIATE_CONFIG = {
  version: "20260106",
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
