import { useState, FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 400, margin: "60px auto", background: "#fff", padding: 32, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 24, textAlign: "center" },
  label: { display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, marginBottom: 16 },
  btn: { width: "100%", padding: "10px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer", marginBottom: 12 },
  error: { color: "#d32f2f", fontSize: 13, marginBottom: 12 },
  success: { color: "#388e3c", fontSize: 13, marginBottom: 12 },
  link: { textAlign: "center" as const, fontSize: 14 },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const successMsg = (location.state as any)?.message;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch {
      setError("Authentication Error: Wrong username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Login</h2>
      {successMsg && <div style={styles.success}>{successMsg}</div>}
      <form onSubmit={submit}>
        {error && <div style={styles.error}>{error}</div>}
        <label style={styles.label}>Email *</label>
        <input style={styles.input} type="text" value={form.username} onChange={set("username")} required placeholder="email*" />
        <label style={styles.label}>Password *</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            style={{ ...styles.input, marginBottom: 0, paddingRight: 80 }}
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            required
            placeholder="password*"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#666" }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <button style={{ ...styles.btn, background: "#999" }} type="button" onClick={() => navigate("/")}>Cancel</button>
      </form>
      <div style={styles.link}>Don't have an account? <Link to="/register">Register</Link></div>
    </div>
  );
}
