import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Post, PaginatedResponse, Like } from "../types";

const fmt = (d: string) => new Date(d).toLocaleString();

const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 8, padding: 24, marginBottom: 16,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

function LikesPopup({ postId, onClose }: { postId: number; onClose: () => void }) {
  const [likes, setLikes] = useState<Like[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get(`/likes/?post=${postId}&page=${page}`).then((r) => {
      setLikes(r.data.results);
      setTotal(r.data.count);
    });
  }, [postId, page]);

  const pageSize = 15;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 24, minWidth: 260, maxHeight: 400, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 12 }}>Likes</h3>
        {likes.length === 0 ? <p>No likes yet.</p> : likes.map((l) => <div key={l.id} style={{ padding: "4px 0" }}>{l.user.username}</div>)}
        <div style={{ marginTop: 12, fontSize: 13, color: "#666" }}>
          {total > 0 && `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total}`}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {page > 1 && <button onClick={() => setPage(p => p - 1)}>&lt;</button>}
          {page < totalPages && <button onClick={() => setPage(p => p + 1)}>&gt;</button>}
          <button onClick={onClose} style={{ marginLeft: "auto" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likesPopup, setLikesPopup] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const fetchPosts = useCallback(() => {
    api.get(`/posts/?page=${page}`)
      .then((r) => {
        setPosts(r.data.results);
        setTotal(r.data.count);
        setTotalPages(r.data.total_pages);
      })
      .catch(() => setError("Failed to load posts."));
  }, [page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (user && posts.length > 0) {
      api.get(`/likes/?user=${user.id}`).then((r) => {
        const liked = new Set<number>(r.data.results.map((l: any) => l.post));
        setLikedPosts(liked);
      });
    }
  }, [user, posts]);

  const toggleLike = async (post: Post) => {
    await api.post(`/posts/${post.id}/likes/`);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(post.id)) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
    fetchPosts();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/posts/${deleteTarget.id}/`);
    setDeleteTarget(null);
    fetchPosts();
  };

  const pageStart = (page - 1) * 10 + 1;
  const pageEnd = Math.min(page * 10, total);

  return (
    <div>
      {error && <div style={{ color: "#d32f2f", marginBottom: 16 }}>{error}</div>}
      {posts.length === 0 && !error && <p style={{ color: "#888" }}>No posts available.</p>}

      {posts.map((post) => (
        <div key={post.id} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{post.title}</h2>
            {post.author.team_name && (
              <span style={{ background: "#e8f0fe", padding: "2px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                {post.author.team_name}
              </span>
            )}
            <span style={{ fontSize: 13, color: "#666" }}>{post.author.username.split("@")[0]}</span>
            <span style={{ fontSize: 13, color: "#888" }}>{fmt(post.created_at)}</span>
            {post.can_edit && (
              <>
                <button onClick={() => navigate(`/posts/${post.id}/edit`)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✏️</button>
                <button onClick={() => setDeleteTarget(post)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>🗑️</button>
              </>
            )}
          </div>

          <p style={{ color: "#555", lineHeight: 1.6, marginBottom: 12 }}>
            {post.excerpt}
            {post.content.length > 200 && (
              <> <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/posts/${post.id}`); }} style={{ color: "#1a73e8" }}>Show More</a></>
            )}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 14, color: "#666" }}>
            <span style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setLikesPopup(post.id)}>
              {post.likes_count} Likes
            </span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate(`/posts/${post.id}`)}>
              {post.comments_count} Comments
            </span>
            {user && (
              <>
                <button
                  onClick={() => toggleLike(post)}
                  title={likedPosts.has(post.id) ? "Unlike" : "Like"}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: likedPosts.has(post.id) ? "#e53935" : "#ccc" }}
                >
                  ♥
                </button>
                <button onClick={() => navigate(`/posts/${post.id}`)} title="Comment" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>💬</button>
              </>
            )}
          </div>
        </div>
      ))}

      {total > 10 && (
        <div style={{ textAlign: "right", marginBottom: 24, color: "#666", fontSize: 14 }}>
          {page > 1 && <button onClick={() => setPage(p => p - 1)} style={{ marginRight: 8 }}>&lt;</button>}
          {pageStart}-{pageEnd} of {total}
          {page < totalPages && <button onClick={() => setPage(p => p + 1)} style={{ marginLeft: 8 }}>&gt;</button>}
        </div>
      )}

      {user && (
        <button
          onClick={() => navigate("/posts/new")}
          style={{
            position: "fixed", bottom: 32, right: 32,
            width: 56, height: 56, borderRadius: "50%",
            background: "#1a73e8", color: "#fff", fontSize: 28,
            border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title="Create New Post"
        >
          +
        </button>
      )}

      {likesPopup !== null && <LikesPopup postId={likesPopup} onClose={() => setLikesPopup(null)} />}

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 32, maxWidth: 360, width: "90%" }}>
            <h3 style={{ marginBottom: 16 }}>Alert</h3>
            <p style={{ marginBottom: 24 }}>Are you sure you want to delete "{deleteTarget.title}"?</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={confirmDelete} style={{ padding: "8px 24px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Delete</button>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "8px 24px", background: "#eee", border: "none", borderRadius: 4, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
