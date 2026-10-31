export function getId(item: unknown): string;

export function isPostLiked(post: unknown, user: unknown): boolean;

export function likePost(postId: string, token: string): Promise<any>;

export function loadComments(postId: string, token: string): Promise<any>;

export function addComment(
  postId: string,
  content: string,
  token: string,
): Promise<any>;

export function sharePost(
  postId: string,
  caption: string,
  token: string,
): Promise<any>;

export function updateComment(
  postId: string,
  commentId: string,
  content: string,
  token: string,
): Promise<any>;

export function deleteComment(
  postId: string,
  commentId: string,
  token: string,
): Promise<any>;

export function likeComment(
  postId: string,
  commentId: string,
  token: string,
): Promise<any>;

export function loadReplies(
  postId: string,
  commentId: string,
  token: string,
): Promise<any>;

export function addReply(
  postId: string,
  commentId: string,
  content: string,
  token: string,
): Promise<any>;

export function updateReply(
  postId: string,
  replyId: string,
  content: string,
  token: string,
): Promise<any>;

export function deleteReply(
  postId: string,
  replyId: string,
  token: string,
): Promise<any>;

export function likeReply(
  postId: string,
  replyId: string,
  token: string,
): Promise<any>;
