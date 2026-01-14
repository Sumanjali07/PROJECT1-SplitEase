import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import Card from "../components/Card.jsx";
import Loader from "../components/Loader.jsx";
import Toast from "../components/Toast.jsx";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const totalGroups = useMemo(() => groups.length, [groups]);

  async function load() {
    try {
      setLoading(true);
      const data = await api.getGroups();
      setGroups(data);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
  load();
  const onFocus = () => load();
  window.addEventListener("focus", onFocus);
  return () => window.removeEventListener("focus", onFocus);
}, []);

  return (
    <div className="stack">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      <Card
        title="Your Groups"
        subtitle={`Total groups: ${totalGroups}`}
        right={
          <Link to="/create-group" className="btn primary">
            + Create Group
          </Link>
        }
      >
        {loading ? (
          <Loader />
        ) : groups.length === 0 ? (
          <div className="empty">
            <p>No groups yet.</p>
            <Link to="/create-group" className="btn">
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="grid">
            {groups.map((g) => (
              <Link key={g._id} to={`/group/${g._id}`} className="group-tile">
                <div className="group-tile-top">
                  <div className="group-avatar">{(g.name || "?").slice(0, 1).toUpperCase()}</div>
                  <div>
                    <div className="group-name">{g.name}</div>
                    <div className="muted">{(g.members || []).length} members</div>
                  </div>
                </div>
                <div className="group-tile-bottom">
                  <div className="pill">Total: ₹{Number(g.totalAmount || 0).toFixed(2)}</div>
                  <div className="muted">Tap to view details →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
