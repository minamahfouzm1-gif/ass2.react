import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CommentsSection from "../../Components/CommentsSection/CommentsSection";
import {
  isPostLiked,
  likePost,
  loadComments as fetchComments,
  addComment as createComment,
  sharePost as createShare,
  updateComment as updatePostComment,
  deleteComment as deletePostComment,
  likeComment as likePostComment,
  loadReplies as fetchPostReplies,
  addReply as createPostReply,
  updateReply as updatePostReply,
  deleteReply as deletePostReply,
  likeReply as likePostReply,
} from "../../utils/postActions";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

type IdValue = string | number;
interface UserSummary {
  id?: IdValue;
  _id?: IdValue;
  name?: string;
  username?: string;
  photo?: string;
  image?: string;
  email?: string;
}
interface LikeItem {
  id?: IdValue;
  _id?: IdValue;
  user?: string | UserSummary;
}
interface ReplyItem {
  id?: IdValue;
  _id?: IdValue;
  content?: string;
  likesCount?: number;
  likes?: unknown[];
  commentCreator?: UserSummary;
  user?: UserSummary;
}
interface CommentItem extends ReplyItem {
  comment?: string;
  body?: string;
  creator?: UserSummary;
  replies?: ReplyItem[];
  repliesCount?: number;
}
interface PostItem {
  id?: IdValue;
  _id?: IdValue;
  body?: string;
  content?: string;
  image?: string;
  createdAt?: string;
  likes?: LikeItem[];
  likesCount?: number;
  comments?: CommentItem[];
  commentsCount?: number;
  shares?: unknown[];
  sharesCount?: number;
  isShare?: boolean;
  originalPost?: PostItem;
  user?: UserSummary;
  author?: UserSummary;
  createdBy?: UserSummary;
}
interface DeleteCommentTarget {
  post: PostItem;
  comment: CommentItem;
}
interface DeleteReplyTarget {
  post: PostItem;
  comment: CommentItem;
  reply: ReplyItem;
}

function getId(
  item: { id?: IdValue; _id?: IdValue } | null | undefined,
): string {
  return String(item?._id ?? item?.id ?? "");
}

function getOriginalPost(post: PostItem | undefined): PostItem | undefined {
  if (!post) return undefined;
  return post.isShare && post.originalPost ? post.originalPost : post;
}

function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  const timestamp = new Date(dateString).getTime();
  if (!Number.isFinite(timestamp)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString();
}

export default function OriginalPost() {
  const location = useLocation();
  const navigate = useNavigate();
  const routePost = (location.state as { post?: PostItem } | null)?.post;
  const post = useMemo(() => getOriginalPost(routePost), [routePost]);
  const currentUser = useMemo<UserSummary>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const token = localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };
  const postId = getId(post);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [postComments, setPostComments] = useState<
    Record<string, CommentItem[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );
  const [sendingComment, setSendingComment] = useState<Record<string, boolean>>(
    {},
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [deleteCommentTarget, setDeleteCommentTarget] =
    useState<DeleteCommentTarget | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editedReplyContent, setEditedReplyContent] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [deleteReplyTarget, setDeleteReplyTarget] =
    useState<DeleteReplyTarget | null>(null);
  const [deletingReply, setDeletingReply] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [sharing, setSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLiked(isPostLiked(post, currentUser));
    setLikesCount(post.likesCount ?? post.likes?.length ?? 0);
    setCommentsCount(post.commentsCount ?? post.comments?.length ?? 0);
    setSharesCount(post.sharesCount ?? post.shares?.length ?? 0);
  }, [post, currentUser]);

  useEffect(() => {
    if (!postId) return;
    try {
      const saved = JSON.parse(
        localStorage.getItem("savedPosts") || "[]",
      ) as PostItem[];
      setIsSaved(saved.some((item) => getId(item) === postId));
    } catch {
      setIsSaved(false);
    }
  }, [postId]);

  async function loadPostComments(target: PostItem): Promise<void> {
    const id = getId(target);
    if (!id) return;
    try {
      const comments = await fetchComments(id, token);
      setPostComments((previous) => ({
        ...previous,
        [id]: comments as CommentItem[],
      }));
    } catch {
      // Keep the existing comments visible if the request fails.
    }
  }

  async function handleLike(): Promise<void> {
    if (!postId) return;
    const previousLiked = liked;
    const delta = previousLiked ? -1 : 1;
    setLiked(!previousLiked);
    setLikesCount((previous) => Math.max(0, previous + delta));
    try {
      await likePost(postId, token);
    } catch {
      setLiked(previousLiked);
      setLikesCount((previous) => Math.max(0, previous - delta));
    }
  }

  async function handleToggleComments(): Promise<void> {
    const willOpen = !showComments;
    setShowComments(willOpen);
    if (willOpen && !postComments[postId]?.length)
      await loadPostComments(post!);
  }

  async function handleComment(target: PostItem): Promise<void> {
    const id = getId(target);
    const content = commentInputs[id]?.trim();
    if (!id || !content || sendingComment[id]) return;
    setSendingComment((previous) => ({ ...previous, [id]: true }));
    try {
      const newComment = (await createComment(
        id,
        content,
        token,
      )) as CommentItem;
      if (newComment) {
        setPostComments((previous) => ({
          ...previous,
          [id]: [
            newComment,
            ...(previous[id] || []).filter(
              (item) => getId(item) !== getId(newComment),
            ),
          ],
        }));
        setCommentsCount((previous) => previous + 1);
        setCommentInputs((previous) => ({ ...previous, [id]: "" }));
      }
    } catch {
      // Keep the draft so the user can retry.
    } finally {
      setSendingComment((previous) => ({ ...previous, [id]: false }));
    }
  }

  async function handleEditComment(
    target: PostItem,
    comment: CommentItem,
  ): Promise<void> {
    const id = getId(target);
    const commentId = getId(comment);
    const content = editedCommentContent.trim();
    if (!id || !commentId || !content) return;
    setSavingComment(true);
    try {
      await updatePostComment(id, commentId, content, token);
      setPostComments((previous) => ({
        ...previous,
        [id]: (previous[id] || []).map((item) =>
          getId(item) === commentId ? { ...item, content } : item,
        ),
      }));
      setEditingCommentId(null);
      setEditedCommentContent("");
    } catch {
      // Keep the edit form open so the user can retry.
    } finally {
      setSavingComment(false);
    }
  }

  async function handleDeleteComment(
    target: PostItem,
    comment: CommentItem,
  ): Promise<void> {
    const id = getId(target);
    const commentId = getId(comment);
    if (!id || !commentId) return;
    setDeletingComment(true);
    try {
      await deletePostComment(id, commentId, token);
      setPostComments((previous) => ({
        ...previous,
        [id]: (previous[id] || []).filter((item) => getId(item) !== commentId),
      }));
      setCommentsCount((previous) => Math.max(0, previous - 1));
      setDeleteCommentTarget(null);
      setOpenMenuId(null);
    } catch {
      // Keep the confirmation open so the user can retry.
    } finally {
      setDeletingComment(false);
    }
  }

  async function handleCommentLike(
    target: PostItem,
    comment: CommentItem,
  ): Promise<void> {
    const id = getId(target);
    const commentId = getId(comment);
    if (!id || !commentId) return;
    try {
      await likePostComment(id, commentId, token);
      await loadPostComments(target);
    } catch {
      // Keep the current comment state if the request fails.
    }
  }

  async function loadReplies(
    target: PostItem,
    comment: CommentItem,
  ): Promise<void> {
    const id = getId(target);
    const commentId = getId(comment);
    if (!id || !commentId) return;
    try {
      const replies = (await fetchPostReplies(
        id,
        commentId,
        token,
      )) as ReplyItem[];
      setPostComments((previous) => ({
        ...previous,
        [id]: (previous[id] || []).map((item) =>
          getId(item) === commentId ? { ...item, replies } : item,
        ),
      }));
    } catch {
      // Keep the currently loaded replies.
    }
  }

  async function handleReply(
    target: PostItem,
    comment: CommentItem,
  ): Promise<void> {
    const id = getId(target);
    const commentId = getId(comment);
    const content = replyInputs[commentId]?.trim();
    if (!id || !commentId || !content) return;
    try {
      const newReply = (await createPostReply(
        id,
        commentId,
        content,
        token,
      )) as ReplyItem | undefined;
      if (!newReply) return;
      setPostComments((previous) => ({
        ...previous,
        [id]: (previous[id] || []).map((item) =>
          getId(item) === commentId
            ? {
                ...item,
                replies: [...(item.replies || []), newReply],
                repliesCount: (item.repliesCount || 0) + 1,
              }
            : item,
        ),
      }));
      setReplyInputs((previous) => ({ ...previous, [commentId]: "" }));
    } catch {
      // Keep the reply draft so the user can retry.
    }
  }

  async function handleEditReply(
    target: PostItem,
    comment: CommentItem,
    reply: ReplyItem,
  ): Promise<void> {
    const id = getId(target);
    const replyId = getId(reply);
    const content = editedReplyContent.trim();
    if (!id || !replyId || !content) return;
    setSavingReply(true);
    try {
      await updatePostReply(id, replyId, content, token);
      setEditingReplyId(null);
      setEditedReplyContent("");
      await loadReplies(target, comment);
    } catch {
      // Keep the edit form open so the user can retry.
    } finally {
      setSavingReply(false);
    }
  }

  async function handleDeleteReply(
    target: PostItem,
    comment: CommentItem,
    reply: ReplyItem,
  ): Promise<void> {
    const id = getId(target);
    const replyId = getId(reply);
    if (!id || !replyId) return;
    setDeletingReply(true);
    try {
      await deletePostReply(id, replyId, token);
      setDeleteReplyTarget(null);
      setOpenMenuId(null);
      await loadReplies(target, comment);
    } catch {
      // Keep the confirmation open so the user can retry.
    } finally {
      setDeletingReply(false);
    }
  }

  async function handleReplyLike(
    target: PostItem,
    comment: CommentItem,
    reply: ReplyItem,
  ): Promise<void> {
    const id = getId(target);
    const replyId = getId(reply);
    if (!id || !replyId) return;
    try {
      await likePostReply(id, replyId, token);
      await loadReplies(target, comment);
    } catch {
      // Keep the currently loaded replies.
    }
  }

  function handleSavePost(): void {
    if (!postId || !post) return;
    try {
      const saved = JSON.parse(
        localStorage.getItem("savedPosts") || "[]",
      ) as PostItem[];
      const exists = saved.some((item) => getId(item) === postId);
      const updated = exists
        ? saved.filter((item) => getId(item) !== postId)
        : [{ ...post, id: postId, _id: postId }, ...saved];
      localStorage.setItem("savedPosts", JSON.stringify(updated));
      setIsSaved(!exists);
      setOpenMenuId(null);
    } catch {
      // Keep the current UI state if local storage is unavailable.
    }
  }

  async function handleShare(): Promise<void> {
    if (!postId || sharing) return;
    setSharing(true);
    try {
      await createShare(postId, shareCaption.trim() || "Shared post", token);
      setSharesCount((previous) => previous + 1);
      setShareModalOpen(false);
      setShareCaption("");
    } catch {
      // Keep the share dialog open so the user can retry.
    } finally {
      setSharing(false);
    }
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-10 text-center text-slate-500">
        Post not found
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const author = post.user || post.author || post.createdBy || {};
  return (
    <div className="mx-auto max-w-7xl px-3 py-3.5">
      <main className="min-w-0">
        <div className="mx-auto max-w-3xl space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back
          </button>
          <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${getId(author)}`} className="shrink-0">
                  <img
                    alt={author.name || "User"}
                    className="h-11 w-11 rounded-full object-cover"
                    src={author.photo || author.image || DEFAULT_AVATAR}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${getId(author)}`}
                    className="truncate text-sm font-bold text-foreground hover:underline"
                  >
                    {author.name || author.username || "User"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {author.username ? `@${author.username} · ` : ""}
                    {timeAgo(post.createdAt)} · Public
                  </p>
                  {isSaved && (
                    <span className="mt-1 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                      Saved
                    </span>
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === "post-menu" ? null : "post-menu",
                      )
                    }
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  >
                    ⋯
                  </button>
                  {openMenuId === "post-menu" && (
                    <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        onClick={handleSavePost}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                      >
                        {isSaved ? "Unsave post" : "Save post"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {post.body || post.content || ""}
              </p>
            </div>
            {post.image && (
              <img
                alt="Post"
                className="max-h-[620px] w-full border-y border-slate-200 object-cover"
                src={post.image}
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-slate-500">
              <span>👍 {likesCount} likes</span>
              <span>
                {commentsCount} comments · {sharesCount} shares
              </span>
            </div>
            <div className="mx-4 border-t border-slate-200" />
            <div className="grid grid-cols-3 gap-1 p-1">
              <button
                type="button"
                onClick={handleLike}
                className={`rounded-md p-2 text-sm font-semibold ${liked ? "bg-blue-50 text-[#1877f2]" : "text-slate-600 hover:bg-slate-100"}`}
              >
                👍 {liked ? "Liked" : "Like"}
              </button>
              <button
                type="button"
                onClick={handleToggleComments}
                className="rounded-md p-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                💬 Comment
              </button>
              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="rounded-md p-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                ↗ Share
              </button>
            </div>
            {showComments && (
              <CommentsSection
                post={post}
                postComments={postComments}
                setPostComments={setPostComments}
                commentInputs={commentInputs}
                setCommentInputs={setCommentInputs}
                sendingComment={sendingComment}
                setSendingComment={setSendingComment}
                user={currentUser}
                headers={headers}
                loadComments={loadPostComments}
                handleComment={handleComment}
                handleEditComment={handleEditComment}
                handleDeleteComment={handleDeleteComment}
                handleCommentLike={handleCommentLike}
                handleReply={handleReply}
                handleEditReply={handleEditReply}
                handleDeleteReply={handleDeleteReply}
                handleReplyLike={handleReplyLike}
                loadReplies={loadReplies}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                editingCommentId={editingCommentId}
                setEditingCommentId={setEditingCommentId}
                editedCommentContent={editedCommentContent}
                setEditedCommentContent={setEditedCommentContent}
                savingComment={savingComment}
                deleteCommentTarget={deleteCommentTarget}
                setDeleteCommentTarget={setDeleteCommentTarget}
                deletingComment={deletingComment}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                editingReplyId={editingReplyId}
                setEditingReplyId={setEditingReplyId}
                editedReplyContent={editedReplyContent}
                setEditedReplyContent={setEditedReplyContent}
                savingReply={savingReply}
                deleteReplyTarget={deleteReplyTarget}
                setDeleteReplyTarget={setDeleteReplyTarget}
                deletingReply={deletingReply}
              />
            )}
          </article>
        </div>
      </main>

      {shareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Share post
              </h4>
              <button
                type="button"
                disabled={sharing}
                onClick={() => setShareModalOpen(false)}
                className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 p-4">
              <textarea
                placeholder="Say something about this..."
                rows={3}
                maxLength={500}
                value={shareCaption}
                onChange={(event) => setShareCaption(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1877f2]"
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-bold">
                  {author.name || author.username || "User"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {post.body || post.content || ""}
                </p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Shared post"
                    className="mt-2 max-h-64 w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                disabled={sharing}
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sharing}
                onClick={handleShare}
                className="rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {sharing ? "Sharing..." : "Share now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteCommentTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="font-bold">Delete this comment?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This comment will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCommentTarget(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingComment}
                onClick={() =>
                  void handleDeleteComment(
                    deleteCommentTarget.post,
                    deleteCommentTarget.comment,
                  )
                }
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white"
              >
                {deletingComment ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteReplyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="font-bold">Delete this reply?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This reply will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteReplyTarget(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingReply}
                onClick={() =>
                  void handleDeleteReply(
                    deleteReplyTarget.post,
                    deleteReplyTarget.comment,
                    deleteReplyTarget.reply,
                  )
                }
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white"
              >
                {deletingReply ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
