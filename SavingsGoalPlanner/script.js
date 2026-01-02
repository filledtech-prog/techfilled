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

function addMonthsToDate(date, months) {
  const d = new Date(date.getTime());
  const originalDay = d.getDate();

  d.setMonth(d.getMonth() + months);

  // Handle month rollover edge cases (e.g. adding months to Jan 31)
  if (d.getDate() < originalDay) {
    d.setDate(0);
  }
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Savings simulation:
 * - Each month: add contribution, apply interest
 * - interest uses APY approximated as monthlyRate = (1+apy)^(1/12)-1
 * - stops when balance >= goal or guard months reached
 */
function simulateSavings({ goal, start, monthlyContribution, apyPercent }) {
  let balance = start;
  let months = 0;
  let contributed = 0;
  let interestEarned = 0;

  const MAX_MONTHS = 1200; // 100 years guard

  const apy = apyPercent / 100;
  const monthlyRate = apyPercent > 0 ? (Math.pow(1 + apy, 1 / 12) - 1) : 0;

  const preview = [];

  // If already at goal:
  if (balance >= goal) {
    return { ok: true, months: 0, balance, contributed: 0, interestEarned: 0, preview };
  }

  while (balance < goal && months < MAX_MONTHS) {
    const startBalance = balance;

    // Contribution at start of month
    balance += monthlyContribution;
    contributed += monthlyContribution;

    // Interest applied after contribution (simple estimate)
    const interest = balance * monthlyRate;
    balance += interest;
    interestEarned += interest;

    months += 1;

    if (preview.length < 12) {
      preview.push({
        month: months,
        startBalance,
        contribution: monthlyContribution,
        interest,
        endBalance: balance
      });
    }

    // If monthlyContribution is 0 and no interest, we can never reach goal
    if (monthlyContribution <= 0 && monthlyRate <= 0) {
      return { ok: false, reason: "no_growth", months, balance, contributed, interestEarned, preview };
    }

    // If contribution is 0 but interest exists, could still grow; loop continues
  }

  if (months >= MAX_MONTHS) {
    return { ok: false, reason: "max_months", months, balance, contributed, interestEarned, preview };
  }

  return { ok: true, months, balance, contributed, interestEarned, preview };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("plannerForm");
  const errorEl = document.getElementById("error");
  const resultsEl = document.getElementById("results");

  const goalEl = document.getElementById("goalAmount");
  const startEl = document.getElementById("startingAmount");
  const monthlyEl = document.getElementById("monthlyContribution");
  const apyEl = document.getElementById("apy");
  const showPreviewEl = document.getElementById("showPreview");

  const timeToGoalEl = document.getElementById("timeToGoal");
  const targetDateEl = document.getElementById("targetDate");
  const totalContributedEl = document.getElementById("totalContributed");
  const interestEarnedEl = document.getElementById("interestEarned");
  const insightBoxEl = document.getElementById("insightBox");

  const tableWrapEl = document.getElementById("tableWrap");
  const tableBodyEl = document.getElementById("previewTableBody");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    resultsEl.hidden = true;
    tableWrapEl.hidden = true;
    tableBodyEl.innerHTML = "";

    const goal = parseFloat(goalEl.value);
    const start = parseFloat(startEl.value);
    const monthly = parseFloat(monthlyEl.value);
    const apyRaw = apyEl.value.trim() === "" ? 0 : parseFloat(apyEl.value);

    if (!isFinite(goal) || goal <= 0) {
      errorEl.textContent = "Please enter a valid goal amount greater than $0.";
      return;
    }
    if (!isFinite(start) || start < 0) {
      errorEl.textContent = "Starting amount must be $0 or higher.";
      return;
    }
    if (!isFinite(monthly) || monthly < 0) {
      errorEl.textContent = "Monthly contribution must be $0 or higher.";
      return;
    }
    if (!isFinite(apyRaw) || apyRaw < 0) {
      errorEl.textContent = "APY must be 0 or higher (or leave blank).";
      return;
    }
    if (start >= goal) {
      // Already at goal
      timeToGoalEl.textContent = "0 months";
      targetDateEl.textContent = "Today";
      totalContributedEl.textContent = money(0);
      interestEarnedEl.textContent = money(0);
      insightBoxEl.textContent = "You’re already at or above your goal. Nice work.";
      resultsEl.hidden = false;
      return;
    }

    const sim = simulateSavings({
      goal,
      start,
      monthlyContribution: monthly,
      apyPercent: apyRaw
    });

    if (!sim.ok) {
      if (sim.reason === "no_growth") {
        errorEl.textContent = "With $0 monthly contribution and 0% APY, you won’t reach your goal. Add a monthly contribution or APY.";
      } else {
        errorEl.textContent = "Unable to calculate (inputs may be unrealistic). Try adjusting values.";
      }
      return;
    }

    timeToGoalEl.textContent = monthsToYearsMonths(sim.months);

    const target = addMonthsToDate(new Date(), sim.months);
    targetDateEl.textContent = formatDate(target);

    totalContributedEl.textContent = money(sim.contributed);
    interestEarnedEl.textContent = money(sim.interestEarned);

    const gap = goal - start;
    if (monthly > 0) {
      const noInterestMonths = Math.ceil(gap / monthly);
      const delta = noInterestMonths - sim.months;

      if (apyRaw > 0 && delta > 0) {
        insightBoxEl.textContent =
          `With ${apyRaw.toFixed(2)}% APY, you may reach your goal about ${delta} month${delta === 1 ? "" : "s"} sooner (estimate).`;
      } else if (apyRaw > 0 && delta === 0) {
        insightBoxEl.textContent =
          `Your monthly contribution is doing most of the work; APY helps a bit over time (estimate).`;
      } else {
        insightBoxEl.textContent =
          `Tip: Increasing your monthly contribution by even $25–$50 can noticeably reduce your time to goal.`;
      }
    } else {
      // monthly == 0 but APY > 0 case
      insightBoxEl.textContent =
        `You’re relying on interest growth only. Consider adding a monthly contribution to reach your goal faster.`;
    }

    if (showPreviewEl.checked) {
      sim.preview.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.month}</td>
          <td>${money(row.startBalance)}</td>
          <td>${money(row.contribution)}</td>
          <td>${money(row.interest)}</td>
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

