import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AccessLevel } from "../types";

const ACCESS_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "read", label: "Read Only" },
  { value: "read_write", label: "Read & Write" },
];

const defaultPermissions = {
  public_access: "read" as AccessLevel,
  authenticated_access: "read" as AccessLevel,
  team_access: "read_write" as AccessLevel,
  owner_access: "read_write" as AccessLevel,
};

const PERM_ROWS = [
  { key: "public_access", label: "Public" },
  { key: "authenticated_access", label: "Authenticated" },
  { key: "team_access", label: "Team" },
  { key: "owner_access", label: "Owner" },
] as const;

export default function PostCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/posts/", { title, content, ...permissions });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} style={{ display: "inline-block", marginBottom: 16, color: "#1a73e8" }}>&lt; Back</a>
      <h2 style={{ marginBottom: 24, fontSize: 22 }}>Create New Post</h2>
      {error && <div style={{ color: "#d32f2f", marginBottom: 16 }}>{error}</div>}
      <form onSubmit={submit}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20, fontSize: 15 }} />

        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Content *</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={10} style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20, fontSize: 14, resize: "vertical" }} />

        <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, padding: 16, marginBottom: 20 }}>
          <legend style={{ fontWeight: 600, padding: "0 8px" }}>Permissions</legend>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Category</th>
                <th style={{ textAlign: "left", padding: 8, fontWeight: 600 }}>Access</th>
              </tr>
            </thead>
            <tbody>
              {PERM_ROWS.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ padding: 8 }}>{label}</td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={permissions[key]}
                      onChange={(e) => setPermissions((p) => ({ ...p, [key]: e.target.value as AccessLevel }))}
                      style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ddd" }}
                    >
                      {ACCESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="submit" disabled={submitting} style={{ padding: "10px 24px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {submitting ? "Publishing..." : "Publish"}
          </button>
          <button type="button" onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: "#eee", border: "none", borderRadius: 4, cursor: "pointer" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
