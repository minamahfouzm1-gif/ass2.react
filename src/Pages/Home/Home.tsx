import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CommentsSection from "../../Components/CommentsSection/CommentsSection";
import {
  likePost as sendPostLike,
  loadComments as fetchPostComments,
  addComment as createPostComment,
  sharePost as createPostShare,
  updateComment as updatePostComment,
  deleteComment as deletePostComment,
  likeComment as likePostComment,
  loadReplies as fetchPostReplies,
  addReply as createPostReply,
  updateReply as updatePostReply,
  deleteReply as deletePostReply,
  likeReply as likePostReply,
} from "../../utils/postActions";

const API_BASE = "https://route-posts.routemisr.com";
const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

type IdValue = string | number;
interface Identifiable {
  id?: IdValue;
  _id?: IdValue;
}
interface SocialUser extends Identifiable {
  name?: string;
  username?: string;
  photo?: string;
  image?: string;
  profilePhoto?: string;
  email?: string;
}

interface FriendSuggestion extends Identifiable {
  name: string;
  username: string;
  photo?: string;
  mutualFollowersCount?: number;
}

interface SocialLike extends Identifiable {
  user?: string | SocialUser;
}
interface SocialReply extends Identifiable {
  content?: string;
  likesCount?: number;
  likes?: SocialLike[];
  commentCreator?: SocialUser;
  user?: SocialUser;
}
interface SocialComment extends SocialReply {
  comment?: string;
  body?: string;
  creator?: SocialUser;
  replies?: SocialReply[];
  repliesCount?: number;
}
interface SocialPost extends Identifiable {
  body?: string;
  content?: string;
  caption?: string;
  image?: string;
  createdAt?: string;
  isShare?: boolean;
  likes?: SocialLike[];
  likesCount?: number;
  comments?: SocialComment[];
  commentsCount?: number;
  shares?: SocialPost[];
  sharesCount?: number;
  user?: SocialUser;
  author?: SocialUser;
  createdBy?: SocialUser;
  originalPost?: SocialPost;
  sharedPost?: SocialPost | { post?: SocialPost };
  post?: SocialPost;
}


const getId = (item: Identifiable | null | undefined): string =>
  String(item?._id ?? item?.id ?? "");

// ====================== Comments Section Component ======================

export default function Home() {
  // ========== Auth ==========
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ========== Tabs & Loading ==========
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("homeActiveTab") || "feed",
  );
  const [isLoading, setIsLoading] = useState(false);

  // ========== Posts ==========
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [sharedPosts, setSharedPosts] = useState<SocialPost[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sharedPosts") || "[]");
    } catch {
      return [];
    }
  });
  const [savedPosts, setSavedPosts] = useState<SocialPost[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("savedPosts") || "[]");
    } catch {
      return [];
    }
  });

  const [friendSuggestions, setFriendSuggestions] = useState<
    FriendSuggestion[]
  >([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [followingUserId, setFollowingUserId] = useState<string | null>(null);
  const [suggestionsLimit, setSuggestionsLimit] = useState(10);

  // ========== Create Post ==========
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [privacy, setPrivacy] = useState("public");

  // ========== Likes ==========
  const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>(
    {},
  );

  // ========== Comments ==========
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );
  const [postComments, setPostComments] = useState<
    Record<string, SocialComment[]>
  >({});
  const [sendingComment, setSendingComment] = useState<Record<string, boolean>>(
    {},
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<{
    post: SocialPost;
    comment: SocialComment;
  } | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);

  // ========== Replies ==========
  const [replyingTo, setReplyingTo] = useState<Record<string, boolean>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editedReplyContent, setEditedReplyContent] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [deleteReplyTarget, setDeleteReplyTarget] = useState<{
    post: SocialPost;
    comment: SocialComment;
    reply: SocialReply;
  } | null>(null);
  const [deletingReply, setDeletingReply] = useState(false);

  // ========== Share ==========
  const [sharePostTarget, setSharePostTarget] = useState<SocialPost | null>(
    null,
  );
  const [shareCaption, setShareCaption] = useState("");
  const [sharingPost, setSharingPost] = useState(false);
  const [openShareMenuId, setOpenShareMenuId] = useState<string | null>(null);
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [editShareCaption, setEditShareCaption] = useState("");
  const [savingShareCaption, setSavingShareCaption] = useState(false);
  const [deleteShareTarget, setDeleteShareTarget] = useState<SocialPost | null>(
    null,
  );
  const [deletingShare, setDeletingShare] = useState(false);

  // ========== Menus ==========
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ========== Edit & Delete Post ==========
  const [editPostTarget, setEditPostTarget] = useState<any>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostImage, setEditPostImage] = useState<File | null>(null);
  const [savingPost, setSavingPost] = useState(false);

  const [deletePostTarget, setDeletePostTarget] = useState<any>(null);
  const [deletingPost, setDeletingPost] = useState(false);

  // ========== Persist ==========
  useEffect(() => {
    localStorage.setItem("sharedPosts", JSON.stringify(sharedPosts));
  }, [sharedPosts]);

  useEffect(() => {
    localStorage.setItem("homeActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (["feed", "myPosts", "community"].includes(activeTab)) {
      getCommunityPosts();
    }
  }, [activeTab]);

  useEffect(() => {
    getFriendSuggestions();
  }, []);

  // ========== Helpers ==========
  function timeAgo(dateString?: string) {
    if (!dateString) return "";
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (seconds < 60) return "now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString();
  }

  function isSaved(postId: string) {
    return savedPosts.some((p) => getId(p) === postId);
  }

  function isPostLiked(post: SocialPost) {
    const id = getId(post);
    if (id in likedOverrides) return likedOverrides[id];
    const myId = getId(user);
    return (post.likes || []).some((like: SocialLike) => {
      const likeUserId =
        typeof like.user === "object"
          ? getId(like.user)
          : String(like.user ?? "");
      return likeUserId === myId;
    });
  }

  function getOriginalSharedPost(post: SocialPost) {
    if (!post || typeof post !== "object") return null;
    const sharedPost = post.sharedPost;
    const nestedSharedPost =
      sharedPost && "post" in sharedPost ? sharedPost.post : sharedPost;
    const candidates: Array<SocialPost | null | undefined> = [
      post.originalPost,
      nestedSharedPost,
      post.post,
    ];
    return (
      candidates.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (item._id || item.id || item.body || item.content || item.image),
      ) || null
    );
  }

  // ========== API Calls ==========
  async function getCommunityPosts() {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/posts`, { headers });
      const data = res.data.data;
      const list = data?.posts || data || [];
      const allPosts = Array.isArray(list) ? list : [];

      setPosts(allPosts.filter((p) => p.isShare !== true));

      const apiShares = allPosts.filter((p) => p.isShare === true);
      setSharedPosts((prev) => {
        const apiIds = new Set(apiShares.map((p) => getId(p)));
        const localOnly = prev.filter(
          (p) => p.isShare === true && !apiIds.has(getId(p)),
        );
        return [...apiShares, ...localOnly];
      });
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

 async function getFriendSuggestions(limit = 10) {
   if (!token) return;

   try {
     const res = await axios.get(
       `${API_BASE}/users/suggestions?limit=${limit}`,
       { headers },
     );

     const suggestions = res.data?.data?.suggestions;

     if (Array.isArray(suggestions)) {
       setFriendSuggestions(suggestions);
     }
   } catch (error: unknown) {
     if (axios.isAxiosError(error)) {
       console.error(
         "Friend Suggestions Error:",
         error.response?.data || error.message,
       );
     }
   }
  }
  
  async function handleFollowUser(userId: string) {
    if (!userId || followingUserId) return;

    setFollowingUserId(userId);

    try {
      await axios.put(`${API_BASE}/users/${userId}/follow`, {}, { headers });

      setFriendSuggestions((prev) =>
        prev.filter((friend) => getId(friend) !== userId),
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Follow User Error:",
          error.response?.data || error.message,
        );
      }
    } finally {
      setFollowingUserId(null);
    }
  }

  async function handleCreatePost() {
    const content = newPostContent.trim();
    if (!content && !newPostImage) return;
    if (creatingPost) return;

    setCreatingPost(true);
    try {
      const formData = new FormData();
      formData.append("body", content || " ");
      if (newPostImage) formData.append("image", newPostImage);

      await axios.post(`${API_BASE}/posts`, formData, { headers });

      setNewPostContent("");
      setNewPostImage(null);
      await getCommunityPosts();
      if (activeTab === "community") {
        getCommunityPosts();
      }
    } catch {
      // silent
    } finally {
      setCreatingPost(false);
    }
  }

  async function handleLike(post: SocialPost) {
    // لو البوست ده Share، ناخد الأصلي بتاعه
    const targetPost = post.isShare
      ? getOriginalSharedPost(post) || post
      : post;
    const id = getId(targetPost);

    if (!id) return;

    const wasLiked = isPostLiked(targetPost);
    const newLiked = !wasLiked;
    const delta = wasLiked ? -1 : 1;

    // 1. تحديث فوري
    setLikedOverrides((prev) => ({ ...prev, [id]: newLiked }));

    // دالة بتحدّث العدد في أي ليست
    const updateList = (list: SocialPost[]) =>
      list.map((item) => {
        // حالة 1: البوست نفسه
        if (getId(item) === id) {
          return {
            ...item,
            likesCount: Math.max(
              0,
              (item.likesCount ?? item.likes?.length ?? 0) + delta,
            ),
          };
        }

        // حالة 2: البوست ده Share وفيه originalPost
        if (item.isShare) {
          const original = getOriginalSharedPost(item);
          if (original && getId(original) === id) {
            return {
              ...item,
              originalPost: {
                ...original,
                likesCount: Math.max(
                  0,
                  (original.likesCount ?? original.likes?.length ?? 0) + delta,
                ),
              },
            };
          }
        }

        return item;
      });

    // 2. تحديث كل الـ states
    setPosts((prev) => updateList(prev));
    setSharedPosts((prev) => updateList(prev));
    setSavedPosts((prev) => {
      const updated = updateList(prev);
      localStorage.setItem("savedPosts", JSON.stringify(updated));
      return updated;
    });

    // 3. إرسال الطلب
    try {
      await sendPostLike(id, token || "");
    } catch {
      // لو فشل نرجع الحالة
      setLikedOverrides((prev) => ({ ...prev, [id]: wasLiked }));

      const revertList = (list: SocialPost[]) =>
        list.map((item) => {
          if (getId(item) === id) {
            return {
              ...item,
              likesCount: Math.max(
                0,
                (item.likesCount ?? item.likes?.length ?? 0) - delta,
              ),
            };
          }
          if (item.isShare) {
            const original = getOriginalSharedPost(item);
            if (original && getId(original) === id) {
              return {
                ...item,
                originalPost: {
                  ...original,
                  likesCount: Math.max(
                    0,
                    (original.likesCount ?? original.likes?.length ?? 0) -
                      delta,
                  ),
                },
              };
            }
          }
          return item;
        });

      setPosts((prev) => revertList(prev));
      setSharedPosts((prev) => revertList(prev));
      setSavedPosts((prev) => {
        const updated = revertList(prev);
        localStorage.setItem("savedPosts", JSON.stringify(updated));
        return updated;
      });
    }
  }

  async function loadComments(post: SocialPost) {
    const id = getId(post);
    try {
      const comments = await fetchPostComments(id, token || "");
      setPostComments((prev) => ({
        ...prev,
        [id]: comments as SocialComment[],
      }));
    } catch {
      // silent
    }
  }

  async function handleComment(post: SocialPost) {
    const id = getId(post);
    const content = commentInputs[id]?.trim();
    if (!content || sendingComment[id]) return;

    setSendingComment((prev) => ({ ...prev, [id]: true }));
    try {
      const newComment = (await createPostComment(
        id,
        content,
        token || "",
      )) as SocialComment;

      if (newComment && typeof newComment === "object") {
        setPostComments((prev) => ({
          ...prev,
          [id]: [
            newComment,
            ...(prev[id] || []).filter((c) => getId(c) !== getId(newComment)),
          ],
        }));
      }

      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
      const incrementCommentCount = (list: SocialPost[]) =>
        list.map((item) => {
          if (getId(item) === id) {
            return { ...item, commentsCount: (item.commentsCount ?? 0) + 1 };
          }

          const original = getOriginalSharedPost(item);
          if (original && getId(original) === id) {
            return {
              ...item,
              originalPost: {
                ...original,
                commentsCount: (original.commentsCount ?? 0) + 1,
              },
            };
          }

          return item;
        });

      setPosts(incrementCommentCount);
      setSharedPosts(incrementCommentCount);
      setSavedPosts((prev) => {
        const updated = incrementCommentCount(prev);
        localStorage.setItem("savedPosts", JSON.stringify(updated));
        return updated;
      });
      await loadComments(post);
    } catch {
      // silent
    } finally {
      setSendingComment((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleEditComment(post: SocialPost, comment: SocialComment) {
    const postId = getId(post);
    const commentId = getId(comment);
    const content = editedCommentContent.trim();
    if (!postId || !commentId || !content) return;

    setSavingComment(true);
    try {
      await updatePostComment(postId, commentId, content, token || "");

      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((item) =>
          getId(item) === commentId ? { ...item, content } : item,
        ),
      }));
      setEditingCommentId(null);
      setEditedCommentContent("");
    } catch {
      // silent
    } finally {
      setSavingComment(false);
    }
  }

  async function handleDeleteComment(post: SocialPost, comment: SocialComment) {
    const postId = getId(post);
    const commentId = getId(comment);
    if (!postId || !commentId) return;

    setDeletingComment(true);
    try {
      await deletePostComment(postId, commentId, token || "");
      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(
          (item) => getId(item) !== commentId,
        ),
      }));
      setDeleteCommentTarget(null);
      setOpenMenuId(null);
    } catch {
      // silent
    } finally {
      setDeletingComment(false);
    }
  }

  async function handleCommentLike(post: SocialPost, comment: SocialComment) {
    const postId = getId(post);
    const commentId = getId(comment);
    if (!postId || !commentId) return;

    try {
      await likePostComment(postId, commentId, token || "");
      await loadComments(post);
    } catch {
      // silent
    }
  }

  async function loadReplies(post: SocialPost, comment: SocialComment) {
    const postId = getId(post);
    const commentId = getId(comment);
    if (!postId || !commentId) return;

    try {
      const replies = (await fetchPostReplies(
        postId,
        commentId,
        token || "",
      )) as SocialReply[];

      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) =>
          getId(c) === commentId ? { ...c, replies } : c,
        ),
      }));
    } catch {
      // silent
    }
  }

  async function handleReply(post: SocialPost, comment: SocialComment) {
    const postId = getId(post);
    const commentId = getId(comment);
    const content = replyInputs[commentId]?.trim();
    if (!postId || !commentId || !content) return;

    try {
      const newReply = (await createPostReply(
        postId,
        commentId,
        content,
        token || "",
      )) as SocialReply;
      if (!newReply) return;

      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((c) =>
          getId(c) === commentId
            ? {
                ...c,
                replies: [...(c.replies || []), newReply],
                repliesCount: (c.repliesCount || 0) + 1,
              }
            : c,
        ),
      }));
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    } catch {
      // silent
    }
  }

  async function handleEditReply(
    post: SocialPost,
    comment: SocialComment,
    reply: SocialReply,
  ) {
    const postId = getId(post);
    const replyId = getId(reply);
    const content = editedReplyContent.trim();
    if (!postId || !replyId || !content) return;

    setSavingReply(true);
    try {
      await updatePostReply(postId, replyId, content, token || "");
      setEditingReplyId(null);
      setEditedReplyContent("");
      await loadReplies(post, comment);
    } catch {
      // silent
    } finally {
      setSavingReply(false);
    }
  }

  async function handleDeleteReply(
    post: SocialPost,
    comment: SocialComment,
    reply: SocialReply,
  ) {
    const postId = getId(post);
    const replyId = getId(reply);
    if (!postId || !replyId) return;

    setDeletingReply(true);
    try {
      await deletePostReply(postId, replyId, token || "");
      setDeleteReplyTarget(null);
      setOpenMenuId(null);
      await loadReplies(post, comment);
    } catch {
      // silent
    } finally {
      setDeletingReply(false);
    }
  }

  async function handleReplyLike(
    post: SocialPost,
    comment: SocialComment,
    reply: SocialReply,
  ) {
    const postId = getId(post);
    const replyId = getId(reply);
    if (!postId || !replyId) return;

    try {
      await likePostReply(postId, replyId, token || "");
      await loadReplies(post, comment);
    } catch {
      // silent
    }
  }

  async function handleSharePost(post: SocialPost) {
    const postId = getId(post);
    const caption = shareCaption.trim() || "Shared post";
    if (!postId || sharingPost) return;

    setSharingPost(true);
    try {
      const res = await createPostShare(postId, caption, token || "");

      const result = res.data?.data;
      const apiPost = result?.post || result?.sharedPost || result;
      const sharedId = getId(apiPost) || `share-${postId}`;

      const sharedRecord = {
        ...(apiPost && typeof apiPost === "object" ? apiPost : {}),
        id: sharedId,
        _id: sharedId,
        isShare: true,
        body: caption,
        content: caption,
        user: { ...user, ...(apiPost?.user || {}) },
        originalPost: getOriginalSharedPost(apiPost) || post,
        createdAt: apiPost?.createdAt || new Date().toISOString(),
      };

      setSharedPosts((prev) => [
        sharedRecord,
        ...prev.filter((item) => getId(item) !== sharedId),
      ]);

      const incrementShareCount = (list: SocialPost[]) =>
        list.map((item) => {
          if (getId(item) === postId) {
            return { ...item, sharesCount: (item.sharesCount ?? 0) + 1 };
          }
          const original = getOriginalSharedPost(item);
          if (original && getId(original) === postId) {
            return {
              ...item,
              originalPost: {
                ...original,
                sharesCount: (original.sharesCount ?? 0) + 1,
              },
            };
          }
          return item;
        });
      setPosts(incrementShareCount);
      setSharedPosts(incrementShareCount);
      setSavedPosts((prev) => {
        const updated = incrementShareCount(prev);
        localStorage.setItem("savedPosts", JSON.stringify(updated));
        return updated;
      });

      setSharePostTarget(null);
      setShareCaption("");
      setActiveTab("feed");
    } catch (error: unknown) {
      const response = (
        error as {
          response?: { status?: number; data?: { message?: string } };
        }
      )?.response;
      if (
        response?.status === 409 &&
        response.data?.message === "Post already shared"
      ) {
        setSharePostTarget(null);
        setShareCaption("");
      }
    } finally {
      setSharingPost(false);
    }
  }

  async function handleEditShareCaption(share: SocialPost) {
    const shareId = getId(share);
    const caption = editShareCaption.trim();
    if (!shareId || !caption) return;

    setSavingShareCaption(true);
    try {
      await axios.put(
        `${API_BASE}/posts/${shareId}`,
        { body: caption },
        { headers },
      );
      setSharedPosts((prev) =>
        prev.map((item) =>
          getId(item) === shareId
            ? { ...item, body: caption, content: caption, caption }
            : item,
        ),
      );
      setEditingShareId(null);
      setEditShareCaption("");
    } catch {
      // silent
    } finally {
      setSavingShareCaption(false);
    }
  }

  async function handleDeleteShare() {
    if (!deleteShareTarget || deletingShare) return;
    const shareId = getId(deleteShareTarget);
    if (!shareId || shareId.startsWith("share-")) return;

    setDeletingShare(true);
    try {
      await axios.delete(`${API_BASE}/posts/${shareId}`, { headers });
      setSharedPosts((prev) => prev.filter((p) => getId(p) !== shareId));
      setDeleteShareTarget(null);
    } catch {
      // silent
    } finally {
      setDeletingShare(false);
    }
  }

  function handleSavePost(post: SocialPost) {
    const postId = getId(post);
    if (!postId) return;

    const originalPost = getOriginalSharedPost(post);
    const savedRecord = {
      ...post,
      id: postId,
      _id: postId,
      isShare: post.isShare === true,
      originalPost: originalPost
        ? { ...originalPost }
        : post.isShare
          ? post.originalPost
          : undefined,
    };

    setSavedPosts((prev) => {
      const alreadySaved = prev.some((p) => getId(p) === postId);
      const updated = alreadySaved
        ? prev.filter((p) => getId(p) !== postId)
        : [savedRecord, ...prev];
      localStorage.setItem("savedPosts", JSON.stringify(updated));
      return updated;
    });

    setOpenMenuId(null);
    setOpenShareMenuId(null);
  }

  // ========== Edit Post ==========
  function openEditPost(post: any) {
    setEditPostTarget(post);
    setEditPostContent(post.body || post.content || "");
    setEditPostImage(null);
    setOpenMenuId(null);
  }

  async function handleEditPost() {
    if (!editPostTarget || savingPost) return;

    const postId = getId(editPostTarget);
    const content = editPostContent.trim();

    if (!postId || (!content && !editPostImage)) return;

    setSavingPost(true);

    try {
      const formData = new FormData();
      formData.append("body", content);

      if (editPostImage) {
        formData.append("image", editPostImage);
      }

      const res = await axios.put(`${API_BASE}/posts/${postId}`, formData, {
        headers,
      });

      const responsePost = res.data?.data?.post || res.data?.data || {};

      const updatedPost = {
        ...editPostTarget,
        ...responsePost,
        body: content,
        content,
      };

      setPosts((prev) =>
        prev.map((post) =>
          getId(post) === postId ? { ...post, ...updatedPost } : post,
        ),
      );

      setSavedPosts((prev) => {
        const updated = prev.map((post) =>
          getId(post) === postId ? { ...post, ...updatedPost } : post,
        );

        localStorage.setItem("savedPosts", JSON.stringify(updated));
        return updated;
      });

      setEditPostTarget(null);
      setEditPostContent("");
      setEditPostImage(null);

      await getCommunityPosts();
    } catch (err: any) {
      console.error("Edit post failed:", err.response?.data || err.message);
    } finally {
      setSavingPost(false);
    }
  }

  // ========== Delete Post ==========
  async function handleDeletePost() {
    if (!deletePostTarget || deletingPost) return;

    const postId = getId(deletePostTarget);
    if (!postId) return;

    setDeletingPost(true);

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`, { headers });

      setPosts((prev) => prev.filter((post) => getId(post) !== postId));

      setSavedPosts((prev) => {
        const updated = prev.filter((post) => getId(post) !== postId);

        localStorage.setItem("savedPosts", JSON.stringify(updated));
        return updated;
      });

      setDeletePostTarget(null);
    } catch (err: any) {
      console.error("Delete post failed:", err.response?.data || err.message);
    } finally {
      setDeletingPost(false);
    }
  }

  // ========== Render Helpers ==========
  const myId = getId(user);

  const visibleShares = sharedPosts.filter((share) => {
    if (share.isShare !== true) return false;
    const authorId = getId(share.user);
    return authorId === myId;
  });

  const visibleTabPosts =
    activeTab === "myPosts"
      ? posts.filter((post) => {
          const author = post.user || post.author || post.createdBy;
          const authorId = typeof author === "string" ? author : getId(author);

          return authorId === myId;
        })
      : posts;
  
  const filteredFriendSuggestions = friendSuggestions.filter((friend) => {
    const search = friendSearch.toLowerCase().trim();

    return (
      friend.name?.toLowerCase().includes(search) ||
      friend.username?.toLowerCase().includes(search)
    );
  });
  

  // ========== JSX ==========
  return (
    <>
      <main className="min-w-0">
        <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          {/* Sidebar */}
          <aside className="hidden h-fit space-y-3 xl:sticky xl:top-[84px] xl:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {[
                { key: "feed", label: "Feed", icon: "newspaper" },
                { key: "myPosts", label: "My Posts", icon: "sparkles" },
                { key: "community", label: "Community", icon: "earth" },
                { key: "saved", label: "Saved", icon: "bookmark" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition first:mt-0 ${
                    activeTab === tab.key
                      ? "bg-[#e7f3ff] text-[#1877f2]"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <section className="space-y-4">
            {/* Mobile Tabs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:hidden">
              <div className="grid grid-cols-2 gap-2">
                {["feed", "myPosts", "community", "saved"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                      activeTab === tab
                        ? "bg-[#e7f3ff] text-[#1877f2]"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {tab === "feed"
                      ? "Feed"
                      : tab === "myPosts"
                        ? "My Posts"
                        : tab === "community"
                          ? "Community"
                          : "Saved"}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Post */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start gap-3">
                <img
                  alt={user.name || "user"}
                  className="h-11 w-11 rounded-full object-cover"
                  src={user.photo || DEFAULT_AVATAR}
                />
                <div className="flex-1">
                  <p className="text-base font-extrabold text-slate-900">
                    {user.name || "User"}
                  </p>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="bg-transparent outline-none"
                    >
                      <option value="public">Public</option>
                      <option value="following">Followers</option>
                      <option value="only_me">Only me</option>
                    </select>
                  </div>
                </div>
              </div>

              <textarea
                rows={4}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`What's on your mind, ${user.name?.split(" ")[0] || "there"}?`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[17px] leading-relaxed text-slate-800 outline-none transition focus:border-[#1877f2] focus:bg-white"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                    <span>Photo/Vedio</span>
                    <input
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={(e) =>
                        setNewPostImage(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  {newPostImage && (
                    <span className="text-xs text-slate-500">
                      {newPostImage.name}
                    </span>
                  )}
                </div>

                <button
                  disabled={
                    creatingPost || (!newPostContent.trim() && !newPostImage)
                  }
                  onClick={handleCreatePost}
                  className="flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#166fe5] disabled:opacity-60"
                >
                  {creatingPost ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {/* Feed / My Posts */}
            {(activeTab === "feed" || activeTab === "myPosts") && (
              <div className="space-y-4">
                {/* Empty State */}
                {visibleTabPosts.length === 0 && visibleShares.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    {activeTab === "feed"
                      ? "Feed — No posts yet."
                      : "My Posts — No posts yet."}
                  </div>
                )}

                {/* Normal Posts */}
                {visibleTabPosts.map((post) => {
                  const postId = getId(post);

                  const postAuthor = post.user || post.author || post.createdBy;

                  const postAuthorId =
                    typeof postAuthor === "string"
                      ? postAuthor
                      : getId(postAuthor);

                  const isOwnPost = postAuthorId === myId;

                  return (
                    <article
                      key={postId}
                      className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="p-4">
                        {/* Post Header */}
                        <div className="flex items-center gap-3">
                          <img
                            alt={post.user?.name || "user"}
                            className="h-11 w-11 rounded-full object-cover"
                            src={post.user?.photo || DEFAULT_AVATAR}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900">
                              {post.user?.name || "User"}
                            </p>

                            {isSaved(postId) && (
                              <span className="mt-1 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                Saved
                              </span>
                            )}

                            <p className="text-xs text-slate-500">
                              {post.user?.username
                                ? `@${post.user.username} · `
                                : ""}
                              {timeAgo(post.createdAt)} · Public
                            </p>
                          </div>

                          {/* Post Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === postId ? null : postId,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                            >
                              ⋮
                            </button>

                            {openMenuId === postId && (
                              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                {isOwnPost && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditPost(post)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Edit Post
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletePostTarget(post);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                      Delete Post
                                    </button>

                                    <div className="my-1 border-t border-gray-100" />
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleSavePost(post)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {isSaved(postId)
                                    ? "Unsave post"
                                    : "Save post"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
                          {post.body || post.content}
                        </p>

                        {post.image && (
                          <img
                            src={post.image}
                            alt="post"
                            className="mt-3 w-full rounded-xl object-cover"
                          />
                        )}
                      </div>

                      {/* Post Counts */}
                      <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            👍
                          </span>
                          <span>
                            {post.likesCount ?? post.likes?.length ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span>
                            {post.commentsCount ?? post.comments?.length ?? 0}{" "}
                            Comments
                          </span>
                          <span>
                            {post.sharesCount ?? post.shares?.length ?? 0}{" "}
                            Shares
                          </span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {openComments[postId] && (
                        <CommentsSection
                          post={post}
                          postComments={postComments}
                          setPostComments={setPostComments}
                          commentInputs={commentInputs}
                          setCommentInputs={setCommentInputs}
                          sendingComment={sendingComment}
                          setSendingComment={setSendingComment}
                          user={user}
                          headers={headers}
                          loadComments={loadComments}
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

                      {/* Post Actions */}
                      <div className="grid grid-cols-3 gap-1 border-t border-slate-200 p-1">
                        <button
                          type="button"
                          onClick={() => handleLike(post)}
                          className={`rounded-md p-2 text-sm font-semibold transition ${
                            isPostLiked(post)
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          👍 {isPostLiked(post) ? "Liked" : "Like"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenComments((prev) => ({
                              ...prev,
                              [postId]: !prev[postId],
                            }));

                            if (!openComments[postId]) {
                              loadComments(post);
                            }
                          }}
                          className="rounded-md p-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          💬 Comment
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSharePostTarget(post);
                            setShareCaption("");
                          }}
                          className="rounded-md p-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          ↗ Share
                        </button>
                      </div>
                    </article>
                  );
                })}

                {/* Shared Posts */}
                {visibleShares.map((share) => {
                  const original = getOriginalSharedPost(share);
                  const originalUser =
                    original?.user ||
                    original?.author ||
                    original?.createdBy ||
                    {};
                  const originalId = getId(original);
                  const shareId = getId(share);

                  return (
                    <article
                      key={shareId}
                      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
                        isSaved(shareId) ? "border-blue-200" : "border-blue-300"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              share.user?.photo ||
                              share.user?.image ||
                              DEFAULT_AVATAR
                            }
                            alt={share.user?.name || "User"}
                            className="h-11 w-11 rounded-full object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900">
                              {share.user?.name || "User"}
                            </p>

                            {isSaved(shareId) && (
                              <span className="mt-1 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                Saved
                              </span>
                            )}

                            <p className="text-xs text-slate-500">
                              {share.user?.username
                                ? `@${share.user.username} · `
                                : ""}
                              {timeAgo(share.createdAt)} · Public
                            </p>
                          </div>

                          {getId(share.user) === myId && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenShareMenuId((curr) =>
                                    curr === shareId ? null : shareId,
                                  )
                                }
                                className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                              >
                                ⋯
                              </button>

                              {openShareMenuId === shareId && (
                                <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => handleSavePost(share)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                                  >
                                    {isSaved(shareId)
                                      ? "Unsave post"
                                      : "Save post"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingShareId(shareId);
                                      setEditShareCaption(
                                        share.body ||
                                          share.content ||
                                          share.caption ||
                                          "",
                                      );
                                      setOpenShareMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                                  >
                                    Edit caption
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteShareTarget(share);
                                      setOpenShareMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Caption */}
                        {editingShareId === shareId ? (
                          <div className="mt-3 space-y-3">
                            <textarea
                              value={editShareCaption}
                              onChange={(e) =>
                                setEditShareCaption(e.target.value)
                              }
                              rows={3}
                              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-[#1877f2]"
                              placeholder="Edit your caption..."
                            />

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingShareId(null);
                                  setEditShareCaption("");
                                }}
                                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                disabled={savingShareCaption}
                                onClick={() => handleEditShareCaption(share)}
                                className="rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-semibold text-white"
                              >
                                {savingShareCaption
                                  ? "Saving..."
                                  : "Save changes"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          (share.body || share.content || share.caption) && (
                            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
                              {share.body || share.content || share.caption}
                            </p>
                          )
                        )}

                        {/* Original Post */}
                        {original ? (
                          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3 p-3">
                              <img
                                src={
                                  originalUser.photo ||
                                  originalUser.image ||
                                  originalUser.profilePhoto ||
                                  DEFAULT_AVATAR
                                }
                                alt={originalUser.name || "User"}
                                className="h-10 w-10 rounded-full object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {originalUser.name ||
                                    originalUser.username ||
                                    "User"}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {originalUser.username
                                    ? `@${originalUser.username} · `
                                    : ""}
                                  {timeAgo(original.createdAt)} · Public
                                </p>
                              </div>

                              <Link
                                type="button"
                                to="/originalpost"
                                state={{ post: original }}
                                className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1877f2] transition hover:bg-blue-100"
                              >
                                Original Post
                              </Link>
                            </div>

                            <p className="whitespace-pre-wrap px-3 pb-3 text-sm text-slate-800">
                              {original.body || original.content}
                            </p>

                            {original.image && (
                              <img
                                src={original.image}
                                alt="Original post"
                                className="max-h-[500px] w-full object-cover"
                              />
                            )}

                            <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-500">
                              <span>
                                👍{" "}
                                {original.likesCount ??
                                  original.likes?.length ??
                                  0}
                              </span>

                              <span>
                                {original.commentsCount ??
                                  original.comments?.length ??
                                  0}{" "}
                                Comments ·{" "}
                                {original.sharesCount ??
                                  original.shares?.length ??
                                  0}{" "}
                                Shares
                              </span>
                            </div>

                            <div className="flex border-t border-slate-200 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => handleLike(original)}
                                className="flex-1 rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                👍 Like
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!originalId) return;

                                  setOpenComments((prev) => ({
                                    ...prev,
                                    [originalId]: !prev[originalId],
                                  }));

                                  if (!openComments[originalId]) {
                                    loadComments(original);
                                  }
                                }}
                                className="flex-1 rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                💬 Comment
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSharePostTarget(original);
                                  setShareCaption("");
                                }}
                                className="flex-1 rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                ↗ Share
                              </button>
                            </div>

                            {openComments[originalId] && (
                              <CommentsSection
                                post={original}
                                postComments={postComments}
                                setPostComments={setPostComments}
                                commentInputs={commentInputs}
                                setCommentInputs={setCommentInputs}
                                sendingComment={sendingComment}
                                setSendingComment={setSendingComment}
                                user={user}
                                headers={headers}
                                loadComments={loadComments}
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
                                setEditedCommentContent={
                                  setEditedCommentContent
                                }
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
                          </div>
                        ) : (
                          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                            Original post data is missing.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Community */}
            {activeTab === "community" && (
              <div className="space-y-4">
                {isLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    Loading...
                  </div>
                )}

                {!isLoading && posts.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    Community — No posts yet.
                  </div>
                )}

                {!isLoading &&
                  posts.map((post) => {
                    const postId = getId(post);
                    return (
                      <article
                        key={postId}
                        className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              alt={post.user?.name || "user"}
                              className="h-11 w-11 rounded-full object-cover"
                              src={post.user?.photo || DEFAULT_AVATAR}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900">
                                {post.user?.name || "User"}
                              </p>
                              {isSaved(postId) && (
                                <span className="mt-1 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                  Saved
                                </span>
                              )}
                              <p className="text-xs text-slate-500">
                                {post.user?.username
                                  ? `@${post.user.username} · `
                                  : ""}
                                {timeAgo(post.createdAt)} · Public
                              </p>
                            </div>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === postId ? null : postId,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                              >
                                ⋮
                              </button>
                              {openMenuId === postId && (
                                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => handleSavePost(post)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                  >
                                    {isSaved(postId)
                                      ? "Unsave post"
                                      : "Save post"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
                            {post.body || post.content}
                          </p>

                          {post.image && (
                            <img
                              src={post.image}
                              alt="post"
                              className="mt-3 w-full rounded-xl object-cover"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                              👍
                            </span>
                            <span>
                              {post.likesCount ?? post.likes?.length ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>
                              {post.commentsCount ?? post.comments?.length ?? 0}{" "}
                              Comments
                            </span>
                            <span>
                              {post.sharesCount ?? post.shares?.length ?? 0}{" "}
                              Shares
                            </span>
                          </div>
                        </div>

                        {/* Comments Section */}
                        {openComments[postId] && (
                          <CommentsSection
                            post={post}
                            postComments={postComments}
                            setPostComments={setPostComments}
                            commentInputs={commentInputs}
                            setCommentInputs={setCommentInputs}
                            sendingComment={sendingComment}
                            setSendingComment={setSendingComment}
                            user={user}
                            headers={headers}
                            loadComments={loadComments}
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

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-1 border-t border-slate-200 p-1">
                          <button
                            type="button"
                            onClick={() => handleLike(post)}
                            className={`rounded-md p-2 text-sm font-semibold transition ${
                              isPostLiked(post)
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            👍 {isPostLiked(post) ? "Liked" : "Like"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenComments((prev) => ({
                                ...prev,
                                [postId]: !prev[postId],
                              }));
                              if (!openComments[postId]) {
                                loadComments(post);
                              }
                            }}
                            className="rounded-md p-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            💬 Comment
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSharePostTarget(post);
                              setShareCaption("");
                            }}
                            className="rounded-md p-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            ↗ Share
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            )}

            {/* Saved */}
            {activeTab === "saved" && (
              <div className="space-y-4">
                {savedPosts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    Saved — No posts yet.
                  </div>
                ) : (
                  savedPosts.map((post) => {
                    const postId = getId(post);
                    const originalPost = getOriginalSharedPost(post);
                    const displayPost =
                      post.isShare && originalPost ? originalPost : post;
                    const isSharedPost = displayPost !== post;
                    const actionPost = displayPost;
                    const actionId = getId(actionPost);
                    const liked =
                      likedOverrides[getId(displayPost)] ??
                      isPostLiked(displayPost);

                    return (
                      <article
                        key={postId}
                        className="overflow-visible rounded-xl border border-blue-200 bg-white shadow-sm"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              alt={
                                (isSharedPost
                                  ? post.user?.name
                                  : displayPost.user?.name) || "user"
                              }
                              className="h-11 w-11 rounded-full object-cover"
                              src={
                                (isSharedPost
                                  ? post.user?.photo
                                  : displayPost.user?.photo) || DEFAULT_AVATAR
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {(isSharedPost
                                  ? post.user?.name
                                  : displayPost.user?.name) || "User"}
                              </p>
                              <p className="text-xs text-slate-500">
                                @
                                {(isSharedPost
                                  ? post.user?.username
                                  : displayPost.user?.username) || ""}{" "}
                                ·{" "}
                                {post.createdAt ? timeAgo(post.createdAt) : ""}
                              </p>
                              <span className="mt-1 inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                Saved
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSavePost(post)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Unsave
                            </button>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
                            {post.body || post.content || ""}
                          </p>

                          {isSharedPost && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                              <div className="flex items-center gap-3 p-3">
                                <img
                                  src={
                                    displayPost.user?.photo || DEFAULT_AVATAR
                                  }
                                  alt={displayPost.user?.name || "User"}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {displayPost.user?.name || "User"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {displayPost.createdAt
                                      ? timeAgo(displayPost.createdAt)
                                      : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="px-3 pb-3">
                                <p className="whitespace-pre-wrap text-sm text-slate-800">
                                  {displayPost.body ||
                                    displayPost.content ||
                                    ""}
                                </p>
                                {displayPost.image && (
                                  <img
                                    src={displayPost.image}
                                    alt="Original post"
                                    className="mt-3 w-full rounded-xl object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {!isSharedPost && post.image && (
                            <img
                              src={post.image}
                              alt="post"
                              className="mt-3 w-full rounded-xl object-cover"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                          <span>
                            👍{" "}
                            {displayPost.likesCount ??
                              displayPost.likes?.length ??
                              0}
                          </span>
                          <div className="flex gap-3">
                            <span>
                              {displayPost.commentsCount ??
                                displayPost.comments?.length ??
                                0}{" "}
                              Comments
                            </span>
                            <span>
                              {displayPost.sharesCount ??
                                displayPost.shares?.length ??
                                0}{" "}
                              Shares
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 border-t border-slate-200 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => handleLike(displayPost)}
                            className={`rounded-lg py-2 text-sm font-semibold hover:bg-slate-100 ${
                              liked ? "text-[#1877f2]" : "text-slate-600"
                            }`}
                          >
                            👍 {liked ? "Liked" : "Like"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenComments((prev) => ({
                                ...prev,
                                [actionId]: !prev[actionId],
                              }));
                              if (!openComments[actionId]) {
                                loadComments(actionPost);
                              }
                            }}
                            className="rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            💬 Comment
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSharePostTarget(actionPost);
                              setShareCaption("");
                            }}
                            className="rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            ↗ Share
                          </button>
                        </div>

                        {openComments[actionId] && (
                          <CommentsSection
                            post={actionPost}
                            postComments={postComments}
                            setPostComments={setPostComments}
                            commentInputs={commentInputs}
                            setCommentInputs={setCommentInputs}
                            sendingComment={sendingComment}
                            setSendingComment={setSendingComment}
                            user={user}
                            headers={headers}
                            loadComments={loadComments}
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
                    );
                  })
                )}
              </div>
            )}
          </section>

          {/* Right Sidebar - Suggested Friends (static) */}

          {/* Right Sidebar - Suggested Friends */}
          <aside className="hidden h-fit xl:sticky xl:top-[84px] xl:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl text-[#1877f2]">♧</span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Suggested Friends
                  </h3>
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1877f2]">
                  {friendSuggestions.length}
                </span>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1877f2] focus:bg-white"
                />
              </div>

              <div className="space-y-4">
                {filteredFriendSuggestions.length > 0 ? (
                  filteredFriendSuggestions.map((friend) => {
                    const friendId = getId(friend);

                    return (
                      <div key={friendId} className="flex items-center gap-3">
                        <img
                          src={friend.photo || DEFAULT_AVATAR}
                          alt={friend.name}
                          className="h-11 w-11 shrink-0 rounded-full border border-slate-100 object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {friend.name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            @{friend.username}
                          </p>

                          {(friend.mutualFollowersCount ?? 0) > 0 && (
                            <p className="mt-1 text-[11px] text-slate-400">
                              {friend.mutualFollowersCount} mutual followers
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={followingUserId !== null}
                          onClick={() => handleFollowUser(friendId)}
                          className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#1877f2] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {followingUserId === friendId
                            ? "Following..."
                            : "+ Follow"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-4 text-center text-sm text-slate-400">
                    {friendSearch
                      ? "No friends found"
                      : "No suggestions available"}
                  </p>
                )}
              </div>

              {!friendSearch &&
                friendSuggestions.length >= suggestionsLimit && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextLimit = suggestionsLimit + 10;
                      setSuggestionsLimit(nextLimit);
                      getFriendSuggestions(nextLimit);
                    }}
                    className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-[#1877f2] transition hover:bg-blue-50"
                  >
                    View more
                  </button>
                )}
            </div>
          </aside>
        </div>
      </main>

      {/* ========== Modals ========== */}

      {/* Edit Post Modal */}
      {editPostTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Edit Post
              </h4>

              <button
                type="button"
                disabled={savingPost}
                onClick={() => setEditPostTarget(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-4">
              <textarea
                rows={4}
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
              />

              {editPostTarget.image && (
                <div className="rounded-xl border border-slate-200 p-2">
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Current image
                  </p>
                  <img
                    src={editPostTarget.image}
                    alt="Current post"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                📷 Change post image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setEditPostImage(e.target.files?.[0] || null)
                  }
                />
              </label>

              {editPostImage && (
                <p className="text-xs text-blue-600">
                  New image: {editPostImage.name}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                disabled={savingPost}
                onClick={() => setEditPostTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  savingPost || (!editPostContent.trim() && !editPostImage)
                }
                onClick={handleEditPost}
                className="rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-bold text-white hover:bg-[#166fe5] disabled:opacity-60"
              >
                {savingPost ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {deletePostTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Confirm action
              </h4>

              <button
                type="button"
                disabled={deletingPost}
                onClick={() => setDeletePostTarget(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                !
              </div>

              <div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  Delete this post?
                </h5>

                <p className="mt-1 text-sm text-slate-600">
                  This post will be permanently removed from your profile and
                  feed. You won't be able to undo this action.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                disabled={deletingPost}
                onClick={() => setDeletePostTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingPost}
                onClick={handleDeletePost}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-70"
              >
                {deletingPost ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {sharePostTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Share post
              </h4>
              <button
                type="button"
                disabled={sharingPost}
                onClick={() => setSharePostTarget(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-60"
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
                onChange={(e) => setShareCaption(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20"
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <img
                    alt={sharePostTarget.user?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover"
                    src={
                      sharePostTarget.user?.photo ||
                      sharePostTarget.user?.image ||
                      DEFAULT_AVATAR
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {sharePostTarget.user?.name ||
                        sharePostTarget.user?.username ||
                        "User"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                  {sharePostTarget.body || sharePostTarget.content || ""}
                </p>
                {sharePostTarget.image && (
                  <img
                    src={sharePostTarget.image}
                    alt="Shared post"
                    className="mt-2 max-h-64 w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                disabled={sharingPost}
                onClick={() => setSharePostTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sharingPost}
                onClick={() => handleSharePost(sharePostTarget)}
                className="inline-flex items-center rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:opacity-60"
              >
                {sharingPost ? "Sharing..." : "Share now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Share Modal */}
      {deleteShareTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteShareTarget(null)}
        >
          <div
            className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Confirm action
              </h4>
              <button
                type="button"
                onClick={() => setDeleteShareTarget(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                ⚠
              </div>
              <div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  Delete this post?
                </h5>
                <p className="mt-1 text-sm text-slate-600">
                  This post will be permanently removed from your profile and
                  feed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setDeleteShareTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteShare}
                disabled={deletingShare}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                {deletingShare ? "Deleting..." : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Modal */}
      {deleteCommentTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Confirm action
              </h4>
              <button
                type="button"
                disabled={deletingComment}
                onClick={() => setDeleteCommentTarget(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                !
              </div>
              <div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  Delete this comment?
                </h5>
                <p className="mt-1 text-sm text-slate-600">
                  This comment will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                disabled={deletingComment}
                onClick={() => setDeleteCommentTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingComment}
                onClick={() =>
                  handleDeleteComment(
                    deleteCommentTarget.post,
                    deleteCommentTarget.comment,
                  )
                }
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                {deletingComment ? "Deleting..." : "Delete comment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reply Modal */}
      {deleteReplyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h4 className="text-base font-extrabold text-slate-900">
                Confirm action
              </h4>
              <button
                type="button"
                disabled={deletingReply}
                onClick={() => setDeleteReplyTarget(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                !
              </div>
              <div>
                <h5 className="text-sm font-extrabold text-slate-900">
                  Delete this reply?
                </h5>
                <p className="mt-1 text-sm text-slate-600">
                  This reply will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                disabled={deletingReply}
                onClick={() => setDeleteReplyTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingReply}
                onClick={() =>
                  handleDeleteReply(
                    deleteReplyTarget.post,
                    deleteReplyTarget.comment,
                    deleteReplyTarget.reply,
                  )
                }
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                {deletingReply ? "Deleting..." : "Delete reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
