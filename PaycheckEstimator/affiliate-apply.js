// TechFilled Monetization Link Wiring
(function () {
  function setHref(id, url) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!url || typeof url !== "string") return;
    el.setAttribute("href", url);
  }

  function safeGet(obj, path) {
    try {
      var parts = path.split(".");
      var cur = obj;
      for (var i = 0; i < parts.length; i++) {
        if (!cur || typeof cur !== "object") return "";
        cur = cur[parts[i]];
      }
      return typeof cur === "string" ? cur : "";
    } catch (e) {
      return "";
    }
  }

  function applyLinks() {
    var A = window.TF_AFFILIATES || {};
    setHref("highYieldLink", safeGet(A, "savings.highYield"));
    setHref("budgetingLink", safeGet(A, "savings.budgetingTool"));

    setHref("tfHighYieldLink", safeGet(A, "savings.highYield"));
    setHref("tfBudgetingLink", safeGet(A, "savings.budgetingTool"));
    setHref("tfCreditMonitoringLink", safeGet(A, "credit.creditMonitoring"));
    setHref("tfCreditBuilderLink", safeGet(A, "credit.creditBuilder"));

    setHref("tfGumroadLink", window.TF_GUMROAD_LINK || "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLinks);
  } else {
    applyLinks();
  }
})();

