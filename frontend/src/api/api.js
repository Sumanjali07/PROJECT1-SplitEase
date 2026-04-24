const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
console.log("API BASE URL:", BASE_URL);

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Groups
  getGroups: () => request("/api/groups"),
  createGroup: (payload) =>
    request("/api/groups", { method: "POST", body: JSON.stringify(payload) }),
  getGroup: (groupId) => request(`/api/groups/${groupId}`),

  // Expenses
  getExpenses: (groupId) => request(`/api/groups/${groupId}/expenses`),
  createExpense: (groupId, payload) =>
    request(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  // Settlements
  settleGroup: (groupId) =>
    request(`/api/groups/${groupId}/settle`, { method: "POST" }),
  deleteExpense: (groupId, expenseId) =>
    request(`/api/groups/${groupId}/expenses/${expenseId}`, {
      method: "DELETE"
    }),
  getSettlements: (groupId) => request(`/api/groups/${groupId}/settlements`),
  getSettlementsByCategory: (groupId) =>
  request(`/api/groups/${groupId}/settlements-by-category`),
  deleteGroup: (groupId) =>
    request(`/api/groups/${groupId}`, { method: "DELETE" })
};
