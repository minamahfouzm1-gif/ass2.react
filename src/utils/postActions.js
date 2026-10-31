import axios from "axios";

const API_BASE = "https://route-posts.routemisr.com";

/** @typedef {{ id?: string | number, _id?: string | number }} Identifiable */
/** @typedef {Identifiable & { user?: string | Identifiable }} LikeItem */

/**
 * Returns a stable string ID for a post, comment, reply, user, or like.
 * @param {Identifiable | null | undefined} item
 * @returns {string}
 */
export function getId(item) {
  return String(item?._id ?? item?.id ?? "");
}

/**
 * Checks whether the current user liked a post.
 * @param {{ likes?: LikeItem[] }} post
 * @param {Identifiable} user
 * @returns {boolean}
 */
export function isPostLiked(post, user) {
  const currentUserId = getId(user);
  if (!currentUserId) return false;

  return (post.likes || []).some((like) => {
    const likedUserId =
      typeof like.user === "object" && like.user !== null
        ? getId(like.user)
        : String(like.user ?? "");
    return likedUserId === currentUserId;
  });
}

/** @param {string} postId @param {string} token */
export async function likePost(postId, token) {
  return axios.put(
    `${API_BASE}/posts/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

/** @param {string} postId @param {string} token */
export async function loadComments(postId, token) {
  const response = await axios.get(
    `${API_BASE}/posts/${postId}/comments?page=1&limit=20`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = response.data?.data;
  return Array.isArray(data) ? data : data?.comments || [];
}

/** @param {string} postId @param {string} content @param {string} token */
export async function addComment(postId, content, token) {
  const response = await axios.post(
    `${API_BASE}/posts/${postId}/comments`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data?.data?.comment || response.data?.data;
}

/** @param {string} postId @param {string} caption @param {string} token */
export async function sharePost(postId, caption, token) {
  return axios.post(
    `${API_BASE}/posts/${postId}/share`,
    { body: caption },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

/** @param {string} postId @param {string} commentId @param {string} content @param {string} token */
export async function updateComment(postId, commentId, content, token) {
  const formData = new FormData();
  formData.append("content", content);
  return axios.put(
    `${API_BASE}/posts/${postId}/comments/${commentId}`,
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

/** @param {string} postId @param {string} commentId @param {string} token */
export async function deleteComment(postId, commentId, token) {
  return axios.delete(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** @param {string} postId @param {string} commentId @param {string} token */
export async function likeComment(postId, commentId, token) {
  return axios.put(
    `${API_BASE}/posts/${postId}/comments/${commentId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

/** @param {string} postId @param {string} commentId @param {string} token */
export async function loadReplies(postId, commentId, token) {
  const response = await axios.get(
    `${API_BASE}/posts/${postId}/comments/${commentId}/replies?page=1&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = response.data?.data;
  return Array.isArray(data) ? data : data?.replies || data?.comments || [];
}

/** @param {string} postId @param {string} commentId @param {string} content @param {string} token */
export async function addReply(postId, commentId, content, token) {
  const response = await axios.post(
    `${API_BASE}/posts/${postId}/comments/${commentId}/replies`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data?.data?.reply || response.data?.data;
}

/** @param {string} postId @param {string} replyId @param {string} content @param {string} token */
export async function updateReply(postId, replyId, content, token) {
  const formData = new FormData();
  formData.append("content", content);
  return axios.put(
    `${API_BASE}/posts/${postId}/comments/${replyId}`,
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

/** @param {string} postId @param {string} replyId @param {string} token */
export async function deleteReply(postId, replyId, token) {
  return axios.delete(`${API_BASE}/posts/${postId}/comments/${replyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** @param {string} postId @param {string} replyId @param {string} token */
export async function likeReply(postId, replyId, token) {
  return axios.put(
    `${API_BASE}/posts/${postId}/comments/${replyId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}
