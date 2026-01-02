(function () {
  function safeSetLink(id, url, fallbackText) {
    const el = document.getElementById(id);
    if (!el) return;

    // If url is missing or still placeholder, keep it as '#'
    if (!url || url === "#" || typeof url !== "string") {
      el.setAttribute("href", "#");
      el.style.pointerEvents = "none";
      el.style.opacity = "0.6";
      if (fallbackText) el.textContent = fallbackText;
      return;
    }

    el.setAttribute("href", url);
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
  }

  function applyAffiliateLinks() {
    const cfg = window.TF_AFFILIATES || {};

    // Savings links
    safeSetLink("tfHighYieldLink", cfg?.savings?.highYield, "High-yield savings options (coming soon)");
    safeSetLink("tfBudgetingLink", cfg?.savings?.budgetingTool, "Budgeting & expense tracking apps (coming soon)");

    // Credit links
    safeSetLink("tfCreditMonitoringLink", cfg?.credit?.creditMonitoring, "Credit monitoring options (coming soon)");
    safeSetLink("tfCreditBuilderLink", cfg?.credit?.creditBuilder, "Credit builder tools (coming soon)");

    // Gumroad (THIS is the one we need live now)
    safeSetLink("tfGumroadLink", cfg?.gumroad?.savingsBlueprint);
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAffiliateLinks);
  } else {
    applyAffiliateLinks();
  }
})();
