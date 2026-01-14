export function getSettlements(balancesMap) {
  const balances =
    balancesMap instanceof Map ? Object.fromEntries(balancesMap.entries()) : balancesMap;

  const debtors = [];
  const creditors = [];

  for (const [name, bal] of Object.entries(balances || {})) {
    const v = Math.round(Number(bal || 0) * 100) / 100;
    if (v < 0) debtors.push({ name, amt: Math.round(-v * 100) / 100 });
    else if (v > 0) creditors.push({ name, amt: v });
  }

  if (!debtors.length || !creditors.length) return [];

  // distribute each debtor across ALL creditors proportionally (equal credits => equal split)
  const settlements = [];
  const creditTotal0 = creditors.reduce((s, c) => s + c.amt, 0);

  for (const d of debtors) {
    let remaining = d.amt;
    const creditTotal = creditors.reduce((s, c) => s + c.amt, 0) || creditTotal0;

    // first pass: proportional shares
    const provisional = creditors.map((c) => {
      const share = (d.amt * c.amt) / creditTotal;
      return { to: c.name, amount: Math.floor(share * 100) / 100 }; // floor to 2 decimals
    });

    let used = provisional.reduce((s, x) => s + x.amount, 0);
    used = Math.round(used * 100) / 100;
    remaining = Math.round((d.amt - used) * 100) / 100;

    // distribute remaining cents to creditors with largest fractional parts
    const frac = creditors
      .map((c) => {
        const exact = (d.amt * c.amt) / creditTotal;
        const floored = Math.floor(exact * 100) / 100;
        return { name: c.name, frac: exact - floored };
      })
      .sort((a, b) => b.frac - a.frac);

    let idx = 0;
    while (remaining > 0.0001 && idx < frac.length) {
      const name = frac[idx].name;
      const p = provisional.find((x) => x.to === name);
      if (p) p.amount = Math.round((p.amount + 0.01) * 100) / 100;
      remaining = Math.round((remaining - 0.01) * 100) / 100;
      idx++;
      if (idx >= frac.length) idx = 0;
    }

    // push settlements + reduce creditor remaining
    for (const p of provisional) {
      if (p.amount <= 0) continue;
      settlements.push({ from: d.name, to: p.to, amount: p.amount });

      const c = creditors.find((x) => x.name === p.to);
      if (c) c.amt = Math.round((c.amt - p.amount) * 100) / 100;
    }
  }

  // merge duplicates
  const merged = new Map();
  for (const s of settlements) {
    const key = `${s.from}__${s.to}`;
    merged.set(key, Math.round(((merged.get(key) || 0) + s.amount) * 100) / 100);
  }

  return Array.from(merged.entries()).map(([key, amount]) => {
    const [from, to] = key.split("__");
    return { from, to, amount };
  }).filter((x) => x.amount > 0);
}
