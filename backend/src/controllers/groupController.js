const simplifyDebts = require("../utils/settle");

exports.getBalances = (req, res) => {
  const expenses = req.body.expenses;

  let balances = {};

  expenses.forEach((exp) => {
    const share = exp.amount / exp.participants.length;

    exp.participants.forEach((p) => {
      if (!balances[p]) balances[p] = 0;

      if (p === exp.paidBy) balances[p] += exp.amount - share;
      else balances[p] -= share;
    });
  });

  const settlements = simplifyDebts(balances);

  res.json({ balances, settlements });
};