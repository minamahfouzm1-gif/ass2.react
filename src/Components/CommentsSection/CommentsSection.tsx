import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

type IdValue = string | number;
type StateSetter<T> = Dispatch<SetStateAction<T>>;

interface UserSummary {
  id?: IdValue;
  _id?: IdValue;
  name?: string;
  photo?: string;
  image?: string;
  username?: string;
}

interface ReplyItem {
  id?: IdValue;
  _id?: IdValue;
  commentCreator?: UserSummary;
  user?: UserSummary;
  content?: string;
  likesCount?: number;
  likes?: unknown[];
}

interface CommentItem<TReply extends ReplyItem = ReplyItem> extends ReplyItem {
  creator?: UserSummary;
  comment?: string;
  body?: string;
  replies?: TReply[];
  repliesCount?: number;
}

interface PostItem {
  id?: IdValue;
  _id?: IdValue;
}

interface DeleteCommentTarget<
  TPost extends PostItem,
  TComment extends CommentItem,
> {
  post: TPost;
  comment: TComment;
}

interface DeleteReplyTarget<
  TPost extends PostItem,
  TComment extends CommentItem,
  TReply extends ReplyItem,
> {
  post: TPost;
  comment: TComment;
  reply: TReply;
}

interface CommentsSectionProps<
  TPost extends PostItem,
  TReply extends ReplyItem,
  TComment extends CommentItem<TReply>,
> {
  post: TPost;
  postComments: Record<string, TComment[]>;
  setPostComments: StateSetter<Record<string, TComment[]>>;
  commentInputs: Record<string, string>;
  setCommentInputs: StateSetter<Record<string, string>>;
  sendingComment: Record<string, boolean>;
  setSendingComment: StateSetter<Record<string, boolean>>;
  user: UserSummary;
  headers: Record<string, string>;
  loadComments: (post: TPost) => Promise<void>;
  handleComment: (post: TPost) => Promise<void> | void;
  handleEditComment: (post: TPost, comment: TComment) => Promise<void> | void;
  handleDeleteComment: (post: TPost, comment: TComment) => Promise<void> | void;
  handleCommentLike: (post: TPost, comment: TComment) => Promise<void> | void;
  handleReply: (post: TPost, comment: TComment) => Promise<void> | void;
  handleEditReply: (
    post: TPost,
    comment: TComment,
    reply: TReply,
  ) => Promise<void> | void;
  handleDeleteReply: (
    post: TPost,
    comment: TComment,
    reply: TReply,
  ) => Promise<void> | void;
  handleReplyLike: (
    post: TPost,
    comment: TComment,
    reply: TReply,
  ) => Promise<void> | void;
  loadReplies: (post: TPost, comment: TComment) => Promise<void>;
  openMenuId: string | null;
  setOpenMenuId: StateSetter<string | null>;
  editingCommentId: string | null;
  setEditingCommentId: StateSetter<string | null>;
  editedCommentContent: string;
  setEditedCommentContent: StateSetter<string>;
  savingComment: boolean;
  deleteCommentTarget: DeleteCommentTarget<TPost, TComment> | null;
  setDeleteCommentTarget: StateSetter<DeleteCommentTarget<
    TPost,
    TComment
  > | null>;
  deletingComment: boolean;
  replyingTo: Record<string, boolean>;
  setReplyingTo: StateSetter<Record<string, boolean>>;
  replyInputs: Record<string, string>;
  setReplyInputs: StateSetter<Record<string, string>>;
  editingReplyId: string | null;
  setEditingReplyId: StateSetter<string | null>;
  editedReplyContent: string;
  setEditedReplyContent: StateSetter<string>;
  savingReply: boolean;
  deleteReplyTarget: DeleteReplyTarget<TPost, TComment, TReply> | null;
  setDeleteReplyTarget: StateSetter<DeleteReplyTarget<
    TPost,
    TComment,
    TReply
  > | null>;
  deletingReply: boolean;
}

function getId(
  item: { id?: IdValue; _id?: IdValue } | null | undefined,
): string {
  return String(item?._id ?? item?.id ?? "");
}

function CommentsSection<
  TPost extends PostItem,
  TReply extends ReplyItem,
  TComment extends CommentItem<TReply>,
>({
  post,
  postComments,
  setPostComments,
  commentInputs,
  setCommentInputs,
  sendingComment,
  setSendingComment,
  user,
  headers,
  loadComments,
  handleComment,
  handleEditComment,
  handleDeleteComment,
  handleCommentLike,
  handleReply,
  handleEditReply,
  handleDeleteReply,
  handleReplyLike,
  loadReplies,
  openMenuId,
  setOpenMenuId,
  editingCommentId,
  setEditingCommentId,
  editedCommentContent,
  setEditedCommentContent,
  savingComment,
  deleteCommentTarget,
  setDeleteCommentTarget,
  deletingComment,
  replyingTo,
  setReplyingTo,
  replyInputs,
  setReplyInputs,
  editingReplyId,
  setEditingReplyId,
  editedReplyContent,
  setEditedReplyContent,
  savingReply,
  deleteReplyTarget,
  setDeleteReplyTarget,
  deletingReply,
}: CommentsSectionProps<TPost, TReply, TComment>) {
  const postId = getId(post);
  const comments = postComments[postId] || [];
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  return (
    <div className="border-t border-slate-200 bg-[#f7f8fa] px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-extrabold text-slate-700">
          Comments ({comments.length})
        </p>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment, index) => {
          const creator =
            comment.commentCreator || comment.user || comment.creator || {};
          const commentId = getId(comment);
          const commentText =
            comment.content || comment.comment || comment.body || "";

          return (
            <div
              key={commentId || index}
              className="relative flex items-start gap-2"
            >
              <img
                alt={creator.name || "User"}
                className="mt-0.5 h-8 w-8 rounded-full object-cover"
                src={creator.photo || creator.image || DEFAULT_AVATAR}
              />

              <div className="min-w-0 flex-1">
                <div className="relative inline-block max-w-full rounded-2xl bg-[#f0f2f5] px-3 py-2">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">
                        {creator.name || "User"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === `comment-${commentId}`
                            ? null
                            : `comment-${commentId}`,
                        )
                      }
                      className="rounded-full px-1.5 text-lg font-bold leading-none text-slate-500 hover:bg-slate-200"
                    >
                      ⋯
                    </button>
                  </div>

                  {/* Edit Comment */}
                  {editingCommentId === commentId ? (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <input
                        value={editedCommentContent}
                        onChange={(e) =>
                          setEditedCommentContent(e.target.value)
                        }
                        autoFocus
                        className="w-full min-w-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleEditComment(post, comment)}
                        disabled={savingComment || !editedCommentContent.trim()}
                        className="rounded-full bg-[#1877f2] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-60"
                      >
                        {savingComment ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={savingComment}
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditedCommentContent("");
                        }}
                        className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
                      {commentText}
                    </p>
                  )}

                  {/* Comment Menu */}
                  {openMenuId === `comment-${commentId}` && (
                    <div className="absolute right-2 top-8 z-30 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(commentId);
                          setEditedCommentContent(commentText);
                          setOpenMenuId(null);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          setDeleteCommentTarget({ post, comment });
                        }}
                        className="block w-full px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Like & Reply buttons */}
                <div className="mt-1.5 flex items-center gap-4 px-1">
                  <button
                    type="button"
                    onClick={() => handleCommentLike(post, comment)}
                    className="text-xs font-semibold text-slate-500 hover:underline"
                  >
                    👍 Like ({comment.likesCount ?? comment.likes?.length ?? 0})
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const isOpen = !replyingTo[commentId];
                      setReplyingTo((prev) => ({
                        ...prev,
                        [commentId]: isOpen,
                      }));
                      if (isOpen) await loadReplies(post, comment);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-[#1877f2] hover:underline"
                  >
                    Reply
                  </button>
                </div>

                {/* Reply Input */}
                {replyingTo[commentId] && (
                  <div className="mt-3 flex items-start gap-2">
                    <img
                      alt="Your profile"
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.photo || DEFAULT_AVATAR}
                    />
                    <div className="relative w-full rounded-2xl border border-slate-200 bg-[#f0f2f5] px-2.5 py-1.5">
                      <textarea
                        placeholder="Write a reply..."
                        rows={1}
                        value={replyInputs[commentId] || ""}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [commentId]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(post, comment);
                            setShowEmojiPicker(null);
                          }
                        }}
                        className="max-h-[100px] min-h-[36px] w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-500"
                      />

                      <div className="mt-1.5 flex items-center justify-between border-t border-slate-200 pt-1.5">
                        <div className="flex items-center gap-1">
                          {/* Upload */}
                          <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-600 hover:bg-slate-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                            />
                          </label>

                          {/* Emoji */}
                          <button
                            type="button"
                            onClick={() =>
                              setShowEmojiPicker((prev) =>
                                prev === `reply-${commentId}`
                                  ? null
                                  : `reply-${commentId}`,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                              <line x1="9" x2="9.01" y1="9" y2="9" />
                              <line x1="15" x2="15.01" y1="9" y2="9" />
                            </svg>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleReply(post, comment);
                            setShowEmojiPicker(null);
                          }}
                          disabled={!replyInputs[commentId]?.trim()}
                          className="rounded-full bg-[#1877f2] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>

                      {/* Emoji Picker for Reply */}
                      {showEmojiPicker === `reply-${commentId}` && (
                        <div className="absolute bottom-14 left-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                          <div className="grid grid-cols-8 gap-1">
                            {[
                              "😀",
                              "😃",
                              "😄",
                              "😁",
                              "😆",
                              "😅",
                              "😂",
                              "🤣",
                              "😊",
                              "😇",
                              "🙂",
                              "😉",
                              "😍",
                              "🥰",
                              "😘",
                              "😎",
                              "🤩",
                              "🥳",
                              "😭",
                              "😡",
                              "🤔",
                              "👍",
                              "👎",
                              "👏",
                              "🙏",
                              "❤️",
                              "🔥",
                              "🎉",
                              "✨",
                              "💯",
                              "💪",
                              "🫶",
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [commentId]:
                                      (prev[commentId] || "") + emoji,
                                  }));
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-xl hover:bg-slate-100"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Replies List */}
                {(comment.replies || []).map((reply) => {
                  const replyCreator = reply.commentCreator || {};
                  const replyId = getId(reply);
                  const likesCount =
                    reply.likesCount ?? reply.likes?.length ?? 0;

                  return (
                    <div
                      key={replyId}
                      className="ml-6 mt-2 flex items-start gap-2"
                    >
                      <img
                        src={replyCreator.photo || DEFAULT_AVATAR}
                        alt={replyCreator.name || "User"}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="inline-block max-w-full rounded-2xl bg-[#f0f2f5] px-2.5 py-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">
                              {replyCreator.name || "User"}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === `reply-${replyId}`
                                    ? null
                                    : `reply-${replyId}`,
                                )
                              }
                              className="ml-auto text-slate-500 hover:text-slate-800"
                            >
                              ⋯
                            </button>
                          </div>

                          {editingReplyId === replyId ? (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <input
                                value={editedReplyContent}
                                onChange={(e) =>
                                  setEditedReplyContent(e.target.value)
                                }
                                className="w-full min-w-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditReply(post, comment, reply)
                                }
                                disabled={
                                  savingReply || !editedReplyContent.trim()
                                }
                                className="rounded-full bg-[#1877f2] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-60"
                              >
                                {savingReply ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                disabled={savingReply}
                                onClick={() => {
                                  setEditingReplyId(null);
                                  setEditedReplyContent("");
                                }}
                                className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words text-sm text-slate-800">
                              {reply.content || ""}
                            </p>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-3 px-2 text-xs font-semibold text-slate-500">
                          <button
                            type="button"
                            onClick={() =>
                              handleReplyLike(post, comment, reply)
                            }
                            className="hover:text-blue-600"
                          >
                            Like ({likesCount})
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const replyKey = `reply-${replyId}`;
                              setReplyingTo((prev) => ({
                                ...prev,
                                [replyKey]: !prev[replyKey],
                              }));
                            }}
                            className="hover:text-[#1877f2]"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Reply input under the reply */}
                        {replyingTo[`reply-${replyId}`] && (
                          <div className="mt-2 flex items-start gap-2">
                            <img
                              alt="Your profile"
                              className="h-7 w-7 rounded-full object-cover"
                              src={user.photo || DEFAULT_AVATAR}
                            />
                            <div className="w-full rounded-2xl border border-slate-200 bg-[#f0f2f5] px-2.5 py-1.5">
                              <textarea
                                placeholder="Write a reply..."
                                rows={1}
                                value={replyInputs[`reply-${replyId}`] || ""}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [`reply-${replyId}`]: e.target.value,
                                  }))
                                }
                                className="max-h-[100px] min-h-[36px] w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-500"
                              />
                              <div className="mt-1 flex justify-end border-t border-slate-200 pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const content =
                                      replyInputs[`reply-${replyId}`]?.trim();
                                    if (!content) return;

                                    setReplyInputs((prev) => ({
                                      ...prev,
                                      [getId(comment)]: content,
                                    }));

                                    handleReply(post, comment);

                                    setReplyInputs((prev) => ({
                                      ...prev,
                                      [`reply-${replyId}`]: "",
                                    }));
                                    setReplyingTo((prev) => ({
                                      ...prev,
                                      [`reply-${replyId}`]: false,
                                    }));
                                  }}
                                  disabled={
                                    !replyInputs[`reply-${replyId}`]?.trim()
                                  }
                                  className="rounded-full bg-[#1877f2] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {openMenuId === `reply-${replyId}` && (
                          <div className="mt-1 w-28 rounded-lg border bg-white py-1 shadow-md">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReplyId(replyId);
                                setEditedReplyContent(reply.content || "");
                                setOpenMenuId(null);
                              }}
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteReplyTarget({ post, comment, reply });
                              }}
                              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="py-3 text-center text-sm text-slate-500">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Add Comment Input */}
      <div className="mt-3 flex items-start gap-2">
        <img
          alt="Your profile"
          className="h-9 w-9 rounded-full object-cover"
          src={user.photo || DEFAULT_AVATAR}
        />
        <div className="relative w-full rounded-2xl border border-slate-200 bg-[#f0f2f5] px-2.5 py-1.5 focus-within:border-[#c7dafc] focus-within:bg-white">
          <textarea
            placeholder="Write a comment..."
            rows={1}
            value={commentInputs[postId] || ""}
            onChange={(e) =>
              setCommentInputs((prev) => ({
                ...prev,
                [postId]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleComment(post);
                setShowEmojiPicker(null); // نقفل الإيموجي لما نبعت
              }
            }}
            className="max-h-[140px] min-h-[40px] w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-5 outline-none placeholder:text-slate-500"
          />

          <div className="mt-2 flex w-full items-center justify-between border-t border-slate-200 pt-2">
            {/* Left side - Upload + Emoji */}
            <div className="flex items-center gap-1">
              {/* Upload */}
              <label
                title="Upload photo"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // مؤقتًا بس هنعرض اسم الصورة، لسه منطق الرفع مش موجود
                      console.log("Selected image:", file.name);
                    }
                  }}
                />
              </label>

              {/* Emoji Button */}
              <button
                type="button"
                title="Choose emoji"
                onClick={() =>
                  setShowEmojiPicker((prev) =>
                    prev === postId ? null : postId,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" x2="9.01" y1="9" y2="9" />
                  <line x1="15" x2="15.01" y1="9" y2="9" />
                </svg>
              </button>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => {
                handleComment(post);
                setShowEmojiPicker(null);
              }}
              disabled={
                !commentInputs[postId]?.trim() || sendingComment[postId]
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-white hover:bg-[#166fe5] disabled:bg-[#9ec5ff]"
            >
              ➤
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker === postId && (
            <div className="absolute bottom-14 left-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <p className="mb-2 text-xs font-bold text-slate-500">
                Choose an emoji
              </p>
              <div className="grid grid-cols-8 gap-1">
                {[
                  "😀",
                  "😃",
                  "😄",
                  "😁",
                  "😆",
                  "😅",
                  "😂",
                  "🤣",
                  "😊",
                  "😇",
                  "🙂",
                  "🙃",
                  "😉",
                  "😍",
                  "🥰",
                  "😘",
                  "😋",
                  "😎",
                  "🤩",
                  "🥳",
                  "😭",
                  "😢",
                  "😡",
                  "🤔",
                  "🤗",
                  "🤭",
                  "🤫",
                  "😴",
                  "👍",
                  "👎",
                  "👏",
                  "🙌",
                  "🙏",
                  "❤️",
                  "🧡",
                  "💛",
                  "💚",
                  "💙",
                  "💜",
                  "💔",
                  "🔥",
                  "🎉",
                  "✨",
                  "💯",
                  "💪",
                  "👌",
                  "🫶",
                  "🤝",
                ].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setCommentInputs((prev) => ({
                        ...prev,
                        [postId]: (prev[postId] || "") + emoji,
                      }));
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-xl hover:bg-slate-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommentsSection;
