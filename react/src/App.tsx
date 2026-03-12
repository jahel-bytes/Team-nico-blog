import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetail from "./pages/PostDetail";
import PostCreate from "./pages/PostCreate";
import PostEdit from "./pages/PostEdit";

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: "#fff",
    borderBottom: "1px solid #ddd",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontWeight: 700, fontSize: 18, color: "#333" },
  navLinks: { display: "flex", gap: 16, alignItems: "center" },
  main: { maxWidth: 800, margin: "0 auto", padding: "24px 16px" },
};

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Avanzatech Blog</Link>
      <div style={styles.navLinks}>
        {user ? (
          <>
            <span>Welcome, {user.username.split("@")[0]}</span>
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to log out?")) await logout();
              }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#1a73e8" }}
            >
              ↩ Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/new" element={<PostCreate />} />
          <Route path="/posts/:id/edit" element={<PostEdit />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
