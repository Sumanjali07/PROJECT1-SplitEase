import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api.js";
import Card from "../components/Card.jsx";
import Toast from "../components/Toast.jsx";

export default function NewGroup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState([]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const canCreate = useMemo(() => name.trim() && members.length >= 2, [name, members]);

  function addMember() {
    const m = memberName.trim();
    if (!m) {
      setToast({ message: "Enter a member name.", type: "error" });
      return;
    }
    if (members.some((x) => x.toLowerCase() === m.toLowerCase())) {
      setToast({ message: "Member already added.", type: "error" });
      return;
    }
    setMembers((prev) => [...prev, m]);
    setMemberName("");
  }

  function removeMember(m) {
    setMembers((prev) => prev.filter((x) => x !== m));
  }

  async function onCreate(e) {
    e.preventDefault();

    if (!name.trim()) {
      setToast({ message: "Group name is required.", type: "error" });
      return;
    }
    if (members.length < 2) {
      setToast({ message: "Add at least 2 members.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      const group = await api.createGroup({ name: name.trim(), members });
      navigate(`/group/${group._id}`);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      <Card title="Create New Group" subtitle="Add members one by one">
        <form className="form" onSubmit={onCreate}>
          <label className="label">
            Group Name
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goa Trip"
            />
          </label>

          <div className="label">
            Add Member
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="input"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g. Sumanjali"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMember();
                  }
                }}
              />
              <button type="button" className="btn primary" onClick={addMember}>
                Add
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="label">
              Members ({members.length})
              <div className="chips">
                {members.map((m) => (
                  <button key={m} type="button" className="chip active" onClick={() => removeMember(m)}>
                    {m} ✕
                  </button>
                ))}
              </div>
              <div className="hint">Tip: click a member to remove.</div>
            </div>
          )}

          <button className="btn primary" type="submit" disabled={!canCreate || saving}>
            {saving ? "Creating..." : "Create Group"}
          </button>
        </form>
      </Card>
    </div>
  );
}
