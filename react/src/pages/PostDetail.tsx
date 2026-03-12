import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Post, Comment } from "../types";

const fmt = (d: string) => new Date(d).toLocaleString();

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/posts/${id}/`)
      .then((r) => setPost(r.data))
      .catch(() => { setError("Post not found."); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/comments/?post=${id}&page=${commentPage}`)
      .then((r) => {
        setComments(r.data.results);
        setCommentTotal(r.data.count);
        setCommentTotalPages(r.data.total_pages);
      });
  }, [id, commentPage]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${id}/comments/`, { text: newComment });
      setNewComment("");
      const r = await api.get(`/comments/?post=${id}&page=${commentPage}`);
      setComments(r.data.results);
      setCommentTotal(r.data.count);
      setCommentTotalPages(r.data.total_pages);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div style={{ color: "#d32f2f" }}>{error}</div>;
  if (!post) return <div>Loading...</div>;

  const pageSize = 10;
  const pageStart = (commentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(commentPage * pageSize, commentTotal);

  return (
    <div>
      <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }} style={{ display: "inline-block", marginBottom: 16, color: "#1a73e8" }}>&lt; Back</a>

      <div style={{ background: "#fff", borderRadius: 8, padding: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>{post.title}</h1>
          {post.author.team_name && (
            <span style={{ background: "#e8f0fe", padding: "2px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>{post.author.team_name}</span>
          )}
          <span style={{ fontSize: 14, color: "#666" }}>{post.author.username.split("@")[0]}</span>
          <span style={{ fontSize: 13, color: "#888" }}>{fmt(post.created_at)}</span>
        </div>

        <div style={{ lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#333" }}>{post.content}</div>

        <div style={{ marginTop: 20, fontSize: 15, color: "#666", textAlign: "center" }}>{post.likes_count} Likes</div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Comments</h2>

      {comments.map((c) => (
        <div key={c.id} style={{ background: "#fff", borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
            <strong>{c.user.username.split("@")[0]}</strong>
            <span style={{ color: "#888" }}>{fmt(c.created_at)}</span>
          </div>
          <p style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
        </div>
      ))}

      {commentTotal > pageSize && (
        <div style={{ textAlign: "right", marginBottom: 16, fontSize: 13, color: "#666" }}>
          {commentPage > 1 && <button onClick={() => setCommentPage(p => p - 1)}>&lt;</button>}
          {" "}{pageStart}-{pageEnd} of {commentTotal}{" "}
          {commentPage < commentTotalPages && <button onClick={() => setCommentPage(p => p + 1)}>&gt;</button>}
        </div>
      )}

      {user && (
        <div style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Add New Comment:</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="New Comment"
            rows={4}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              style={{ padding: "8px 20px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button onClick={() => setNewComment("")} style={{ padding: "8px 20px", background: "#eee", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
