export interface Team {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "blogger";
  team: number | null;
  team_name: string | null;
}

export type AccessLevel = "none" | "read" | "read_write";

export interface Post {
  id: number;
  author: User;
  title: string;
  content: string;
  excerpt: string;
  created_at: string;
  updated_at: string;
  public_access: AccessLevel;
  authenticated_access: AccessLevel;
  team_access: AccessLevel;
  owner_access: AccessLevel;
  likes_count: number;
  comments_count: number;
  can_edit: boolean;
}

export interface Like {
  id: number;
  user: User;
  post: number;
  created_at: string;
}

export interface Comment {
  id: number;
  user: User;
  post: number;
  text: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
