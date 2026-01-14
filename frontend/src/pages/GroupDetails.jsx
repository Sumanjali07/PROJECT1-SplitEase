import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Toast from "../components/Toast.jsx";

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState("expenses"); // expenses | settle
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [settling, setSettling] = useState(false);
  const [catData, setCatData] = useState({});

  async function load() {
  try {
    setLoading(true);

    const g = await api.getGroup(groupId);
    const ex = await api.getExpenses(groupId);

    setGroup(g);
    setExpenses(ex);

    // settlements (optional)
    try {
      const s = await api.getSettlements(groupId);
      setSettlements(s);
    } catch {
      setSettlements([]);
    }

    // category settlements (optional)
    try {
      const cat = await api.getSettlementsByCategory(groupId);
      setCatData(cat);
    } catch {
      setCatData({});
    }
  } catch (e) {
    setToast({ message: e.message, type: "error" });
    setGroup(null);
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    load();
  }, [groupId]);

  const total = useMemo(() => {
    if (!expenses?.length) return 0;
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  async function onDeleteExpense(expenseId) {
    try {
      await api.deleteExpense(groupId, expenseId);
      await load();
      setToast({ message: "Expense deleted.", type: "success" });
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    }
  }

  async function onSettle() {
    try {
      setSettling(true);
      await api.settleGroup(groupId);
      await load();
      setToast({ message: "Group settled (balances reset).", type: "success" });
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setSettling(false);
    }
  }

  async function onDeleteGroup() {
  const ok = window.confirm("Delete this group? This will remove all expenses too.");
  if (!ok) return;

  try {
    await api.deleteGroup(groupId);

    // show toast
    setToast({ message: "Group deleted.", type: "success" });

    // go home after a short delay
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 300);
  } catch (e) {
    setToast({ message: e.message, type: "error" });
  }
}


  if (loading) return <Loader text="Loading group..." />;

  if (!group) {
    return (
      <div className="empty">
        <p>Group not found.</p>
        <Link to="/" className="btn">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <Card
        title={group.name}
        subtitle={`${group.members.length} members • Total: ₹${total.toFixed(2)}`}
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <Link to={`/group/${groupId}/add-expense`} className="btn primary">
              + Add Expense
            </Link>
            <button className="btn danger" onClick={onDeleteGroup}>
              Delete Group
            </button>
          </div>
        }
      >
        <div className="tabs">
          <button
            className={tab === "expenses" ? "tab active" : "tab"}
            onClick={() => setTab("expenses")}
          >
            View Expenses
          </button>
          <button
            className={tab === "settle" ? "tab active" : "tab"}
            onClick={() => setTab("settle")}
          >
            Settle Up
          </button>
        </div>

        {tab === "expenses" ? (
          <div className="stack">
            {expenses.length === 0 ? (
              <div className="empty">
                <p>No expenses added yet.</p>
                <Link to={`/group/${groupId}/add-expense`} className="btn">
                  Add first expense
                </Link>
              </div>
            ) : (
              <div className="list">
                {expenses.map((e) => (
                  <div key={e._id} className="list-item">
                    <div>
                      <div className="list-title">{e.title}</div>
                      <div className="muted">
                        Paid by <b>{e.paidBy}</b> • Split:{" "}
                        {(e.splitBetween || []).join(", ")}
                      </div>
                    </div>

                    <div className="list-right">
                      <div className="amount">
                        ₹{Number(e.amount).toFixed(2)}
                      </div>
                      <button
                        className="btn danger small"
                        onClick={() => onDeleteExpense(e._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="stack">
            <div className="settle-box">
              <div className="settle-title">Balances</div>
              <div className="muted">
                Positive = should receive • Negative = should pay
              </div>

              <div className="balances">
                {Object.entries(group.balances || {}).map(([name, bal]) => (
                  <div key={name} className="balance-row">
                    <div className="balance-name">{name}</div>
                    <div
                      className={
                        Number(bal) >= 0 ? "balance-val pos" : "balance-val neg"
                      }
                    >
                      ₹{Number(bal).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="settle-title" style={{ marginTop: 12 }}>Who pays whom</div>
              {settlements.length === 0 ? (
                <div className="muted">All settled ✅</div>
              ) : (
                <div className="list" style={{ marginTop: 10 }}>
                  {settlements.map((x, idx) => (
                    <div key={idx} className="list-item">
                      <div className="list-title">
                        {x.from} → pays {x.to}
                      </div>
                      <div className="amount">₹{Number(x.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                )}
                <div className="settle-title" style={{ marginTop: 16 }}>Category wise settle up</div>
                {Object.keys(catData || {}).length === 0 ? (
                  <div className="muted">No category data yet.</div>
                ) : (
                  <div className="stack" style={{ marginTop: 10 }}>
                    {Object.entries(catData).map(([cat, info]) => (
                      <div key={cat} className="settle-box">
                        <div className="settle-title">{cat} • Total ₹{Number(info.total).toFixed(2)}</div>
                
                        {info.settlements?.length === 0 ? (
                          <div className="muted">Already settled ✅</div>
                        ) : (
                          <div className="list" style={{ marginTop: 10 }}>
                            {info.settlements.map((x, idx) => (
                              <div key={idx} className="list-item">
                                <div className="list-title">
                                  {x.from} → pays {x.to}
                                </div>
                                <div className="amount">₹{Number(x.amount).toFixed(2)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              <button
                className="btn primary"
                onClick={onSettle}
                disabled={settling}
              >
                {settling ? "Settling..." : "Settle Group"}
              </button>

              <div className="hint">
                Settle resets balances to 0 (expenses stay for history).
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
