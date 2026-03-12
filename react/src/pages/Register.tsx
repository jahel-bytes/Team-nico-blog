import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 400, margin: "60px auto", background: "#fff", padding: 32, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 24, textAlign: "center" },
  label: { display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, marginBottom: 16 },
  btn: { width: "100%", padding: "10px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer", marginBottom: 12 },
  error: { color: "#d32f2f", fontSize: 13, marginBottom: 12 },
  link: { textAlign: "center" as const, fontSize: 14 },
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", confirm_password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post("/auth/register/", form);
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object") setErrors(data);
        else setErrors({ non_field_errors: String(data) });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>User Registration</h2>
      <form onSubmit={submit}>
        {errors.non_field_errors && <div style={styles.error}>{errors.non_field_errors}</div>}
        <label style={styles.label}>Email *</label>
        <input style={styles.input} type="email" value={form.username} onChange={set("username")} required placeholder="email" />
        {errors.username && <div style={styles.error}>{errors.username}</div>}
        <label style={styles.label}>Password *</label>
        <input style={styles.input} type="password" value={form.password} onChange={set("password")} required placeholder="password" />
        {errors.password && <div style={styles.error}>{errors.password}</div>}
        <label style={styles.label}>Confirm Password *</label>
        <input style={styles.input} type="password" value={form.confirm_password} onChange={set("confirm_password")} required placeholder="confirm password" />
        {errors.confirm_password && <div style={styles.error}>{errors.confirm_password}</div>}
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? "Registering..." : "Submit"}
        </button>
        <button style={{ ...styles.btn, background: "#999" }} type="button" onClick={() => navigate("/")}>Cancel</button>
      </form>
      <div style={styles.link}>Have an account? <Link to="/login">Log in</Link></div>
    </div>
  );
}
