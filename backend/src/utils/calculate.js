export function recomputeBalances(group, expenses) {
  const balances = {};
  const members = group.members;

  for (const m of members) balances[m] = 0;

  let total = 0;

  for (const ex of expenses) {
    const amount = Number(ex.amount || 0);
    total += amount;

    const splitPeople = ex.splitBetween || [];
    if (splitPeople.length === 0) continue;

    const share = amount / splitPeople.length;

    // payer gets +amount (others owe him)
    balances[ex.paidBy] = (balances[ex.paidBy] || 0) + amount;

    // each split person pays share (including payer if included)
    for (const p of splitPeople) {
      balances[p] = (balances[p] || 0) - share;
    }
  }

  // round to 2 decimals
  for (const k of Object.keys(balances)) {
    balances[k] = Math.round(balances[k] * 100) / 100;
  }

  return { balances, totalAmount: Math.round(total * 100) / 100 };
}
