function money(n) {
  if (!isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function clampNonNegative(num) {
  return Math.max(0, num);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calcForm");
  const errorEl = document.getElementById("error");
  const resultsEl = document.getElementById("results");

  const billAmountEl = document.getElementById("billAmount");
  const tipPercentEl = document.getElementById("tipPercent");
  const taxPercentEl = document.getElementById("taxPercent");
  const peopleCountEl = document.getElementById("peopleCount");
  const tipOnTaxEl = document.getElementById("tipOnTax");
  const roundUpEl = document.getElementById("roundUp");

  const billOut = document.getElementById("billOut");
  const taxOut = document.getElementById("taxOut");
  const tipOut = document.getElementById("tipOut");
  const totalOut = document.getElementById("totalOut");
  const perPersonOut = document.getElementById("perPersonOut");

  // Quick tip buttons
  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = parseFloat(btn.getAttribute("data-tip"));
      if (isFinite(v)) tipPercentEl.value = String(v);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    resultsEl.hidden = true;

    const bill = parseFloat(billAmountEl.value);
    const tipPct = parseFloat(tipPercentEl.value);
    const taxPctRaw = taxPercentEl.value.trim() === "" ? 0 : parseFloat(taxPercentEl.value);
    const people = parseInt(peopleCountEl.value, 10);

    if (!isFinite(bill) || bill < 0) {
      errorEl.textContent = "Please enter a valid bill amount.";
      return;
    }
    if (!isFinite(tipPct) || tipPct < 0) {
      errorEl.textContent = "Please enter a valid tip percent.";
      return;
    }
    if (!isFinite(taxPctRaw) || taxPctRaw < 0) {
      errorEl.textContent = "Please enter a valid tax percent (or leave blank).";
      return;
    }
    if (!isFinite(people) || people < 1) {
      errorEl.textContent = "People must be at least 1.";
      return;
    }

    const tax = clampNonNegative(bill * (taxPctRaw / 100));

    const tipBase = tipOnTaxEl.checked ? (bill + tax) : bill;
    const tip = clampNonNegative(tipBase * (tipPct / 100));

    const total = bill + tax + tip;
    let perPerson = total / people;

    if (roundUpEl.checked) {
      perPerson = Math.ceil(perPerson); // round up to nearest $1
    }

    billOut.textContent = money(bill);
    taxOut.textContent = money(tax);
    tipOut.textContent = money(tip);
    totalOut.textContent = money(total);
    perPersonOut.textContent = money(perPerson);

    resultsEl.hidden = false;
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

