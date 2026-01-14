import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api/api.js";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Toast from "../components/Toast.jsx";

export default function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);

  const [toast, setToast] = useState({ message: "", type: "info" });

  async function load() {
    try {
      setLoading(true);
      const g = await api.getGroup(groupId);
      setGroup(g);
      setPaidBy(g.members?.[0] || "");
      setSplitBetween(g.members || []);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [groupId]);

  const members = useMemo(() => group?.members || [], [group]);

  function toggleMember(name) {
    setSplitBetween((prev) => {
      if (prev.includes(name)) return prev.filter((x) => x !== name);
      return [...prev, name];
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const amt = Number(amount);
    if (!title.trim()) return setToast({ message: "Title is required.", type: "error" });
    if (!amt || amt <= 0) return setToast({ message: "Enter a valid amount.", type: "error" });
    if (!paidBy) return setToast({ message: "Select who paid.", type: "error" });
    if (!splitBetween.length) return setToast({ message: "Select at least 1 person to split with.", type: "error" });

    try {
      setSaving(true);
      await api.createExpense(groupId, {
        title: title.trim(),
        amount: amt,
        paidBy,
        splitBetween
      });
      navigate(`/group/${groupId}`);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading..." />;

  if (!group) {
    return (
      <div className="empty">
        <p>Group not found.</p>
        <Link to="/" className="btn">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="stack">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      <Card title="Add Expense" subtitle={`Group: ${group.name}`}>
        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Expense Title
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dinner" />
          </label>

          <label className="label">
            Amount (₹)
            <input
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1200"
              inputMode="decimal"
            />
          </label>

          <label className="label">
            Paid By
            <select className="input" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <div className="label">
            Split Between
            <div className="chips">
              {members.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={splitBetween.includes(m) ? "chip active" : "chip"}
                  onClick={() => toggleMember(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Expense"}
          </button>

          <Link to={`/group/${groupId}`} className="btn">
            Cancel
          </Link>
        </form>
      </Card>
    </div>
  );
}
