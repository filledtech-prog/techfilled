function formatCurrency(value) {
    if (!isFinite(value)) return "$0.00";
    return `$${value.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("budgetForm");
    const errorMessage = document.getElementById("errorMessage");
    const resultsSection = document.getElementById("results");

    const dailyEl = document.getElementById("dailyBudget");
    const weeklyEl = document.getElementById("weeklyBudget");
    const monthlyLeftoverEl = document.getElementById("monthlyLeftover");
    const shortfallRow = document.getElementById("shortfallRow");
    const shortfallAmountEl = document.getElementById("shortfallAmount");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        errorMessage.textContent = "";
        resultsSection.hidden = true;
        shortfallRow.hidden = true;

        const income = parseFloat(document.getElementById("monthlyIncome").value);
        const bills = parseFloat(document.getElementById("monthlyBills").value);
        const savings = parseFloat(document.getElementById("savingsGoal").value);

        if (
            isNaN(income) ||
            isNaN(bills) ||
            isNaN(savings) ||
            income < 0 ||
            bills < 0 ||
            savings < 0
        ) {
            errorMessage.textContent = "Please enter valid non-negative amounts in all fields.";
            return;
        }

        const monthlyLeftover = income - bills - savings;

        // Simple estimate: assume 30 days per month for budgeting purposes.
        const DAYS_IN_MONTH = 30;

        if (monthlyLeftover <= 0) {
            shortfallRow.hidden = false;
            shortfallAmountEl.textContent = formatCurrency(Math.abs(monthlyLeftover));
            dailyEl.textContent = "$0.00";
            weeklyEl.textContent = "$0.00";
            monthlyLeftoverEl.textContent = formatCurrency(0);
        } else {
            const dailyBudget = monthlyLeftover / DAYS_IN_MONTH;
            const weeklyBudget = dailyBudget * 7;

            dailyEl.textContent = formatCurrency(dailyBudget);
            weeklyEl.textContent = formatCurrency(weeklyBudget);
            monthlyLeftoverEl.textContent = formatCurrency(monthlyLeftover);
        }

        resultsSection.hidden = false;
    });
});


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

