function money(n) {
  if (!isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function monthsToYearsMonths(months) {
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs <= 0) return `${mos} month${mos === 1 ? "" : "s"}`;
  if (mos === 0) return `${yrs} year${yrs === 1 ? "" : "s"}`;
  return `${yrs} year${yrs === 1 ? "" : "s"}, ${mos} month${mos === 1 ? "" : "s"}`;
}

/**
 * Simple amortization estimate:
 * - monthly interest = balance * (APR/100/12)
 * - payment applied: interest first, then principal
 * - repeats until balance <= 0 or until guard limit reached
 */
function simulatePayoff({ balance, aprPercent, monthlyPayment }) {
  const monthlyRate = (aprPercent / 100) / 12;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  // Guard to prevent infinite loops (e.g., payment too low to cover interest)
  const MAX_MONTHS = 1200; // 100 years

  const preview = [];

  while (balance > 0 && months < MAX_MONTHS) {
    const startBalance = balance;
    const interest = startBalance * monthlyRate;

    // If payment doesn't cover interest, debt will never go down.
    if (monthlyPayment <= interest && monthlyRate > 0) {
      return {
        ok: false,
        reason: "payment_too_low",
        months,
        totalInterest,
        totalPaid,
        preview
      };
    }

    let payment = monthlyPayment;
    if (payment > startBalance + interest) {
      payment = startBalance + interest; // final payment
    }

    const principal = Math.max(0, payment - interest);
    balance = Math.max(0, startBalance + interest - payment);

    totalInterest += interest;
    totalPaid += payment;
    months += 1;

    if (preview.length < 12) {
      preview.push({
        month: months,
        startBalance,
        interest,
        principal,
        endBalance: balance
      });
    }
  }

  if (months >= MAX_MONTHS) {
    return {
      ok: false,
      reason: "max_months",
      months,
      totalInterest,
      totalPaid,
      preview
    };
  }

  return {
    ok: true,
    months,
    totalInterest,
    totalPaid,
    preview
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("plannerForm");
  const errorEl = document.getElementById("error");
  const resultsEl = document.getElementById("results");

  const debtAmountEl = document.getElementById("debtAmount");
  const aprEl = document.getElementById("apr");
  const monthlyPaymentEl = document.getElementById("monthlyPayment");
  const extraPaymentEl = document.getElementById("extraPayment");
  const showAmortizationEl = document.getElementById("showAmortization");

  const payoffTimeEl = document.getElementById("payoffTime");
  const totalInterestEl = document.getElementById("totalInterest");
  const totalPaidEl = document.getElementById("totalPaid");
  const paymentUsedEl = document.getElementById("paymentUsed");
  const insightBoxEl = document.getElementById("insightBox");

  const tableWrapEl = document.getElementById("tableWrap");
  const tableBodyEl = document.getElementById("previewTableBody");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    resultsEl.hidden = true;
    tableWrapEl.hidden = true;
    tableBodyEl.innerHTML = "";

    const debt = parseFloat(debtAmountEl.value);
    const apr = parseFloat(aprEl.value);
    const payment = parseFloat(monthlyPaymentEl.value);
    const extraRaw = extraPaymentEl.value.trim() === "" ? 0 : parseFloat(extraPaymentEl.value);

    if (!isFinite(debt) || debt <= 0) {
      errorEl.textContent = "Please enter a valid debt balance greater than $0.";
      return;
    }
    if (!isFinite(apr) || apr < 0) {
      errorEl.textContent = "Please enter a valid APR (0 or higher).";
      return;
    }
    if (!isFinite(payment) || payment <= 0) {
      errorEl.textContent = "Please enter a valid monthly payment greater than $0.";
      return;
    }
    if (!isFinite(extraRaw) || extraRaw < 0) {
      errorEl.textContent = "Extra payment must be 0 or higher.";
      return;
    }

    const monthlyPayment = payment + extraRaw;

    const sim = simulatePayoff({
      balance: debt,
      aprPercent: apr,
      monthlyPayment
    });

    if (!sim.ok) {
      if (sim.reason === "payment_too_low") {
        errorEl.textContent = "Your monthly payment is too low to cover interest. Increase your payment to pay this off.";
      } else {
        errorEl.textContent = "Unable to calculate payoff (input may be unrealistic). Try adjusting values.";
      }
      return;
    }

    payoffTimeEl.textContent = monthsToYearsMonths(sim.months);
    totalInterestEl.textContent = money(sim.totalInterest);
    totalPaidEl.textContent = money(sim.totalPaid);
    paymentUsedEl.textContent = money(monthlyPayment);

    // Insight text
    const baseSim = simulatePayoff({
      balance: debt,
      aprPercent: apr,
      monthlyPayment: payment
    });

    if (extraRaw > 0 && baseSim.ok) {
      const monthsSaved = baseSim.months - sim.months;
      const interestSaved = baseSim.totalInterest - sim.totalInterest;
      insightBoxEl.textContent =
        `Adding ${money(extraRaw)} extra per month could save you about ${monthsSaved} month${monthsSaved === 1 ? "" : "s"} ` +
        `and roughly ${money(interestSaved)} in interest (estimate).`;
    } else {
      insightBoxEl.textContent =
        "Tip: Small extra payments each month can reduce your payoff time and total interest dramatically.";
    }

    // Preview table
    if (showAmortizationEl.checked) {
      sim.preview.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.month}</td>
          <td>${money(row.startBalance)}</td>
          <td>${money(row.interest)}</td>
          <td>${money(row.principal)}</td>
          <td>${money(row.endBalance)}</td>
        `;
        tableBodyEl.appendChild(tr);
      });
      tableWrapEl.hidden = false;
    }

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

