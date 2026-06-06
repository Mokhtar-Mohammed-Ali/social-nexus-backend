export enum NotificationType {
  // Posts
  LIKE_POST = "LIKE_POST",
  COMMENT_POST = "COMMENT_POST",
  REPOST = "REPOST",

  // Comments
  REPLY_COMMENT = "REPLY_COMMENT",
  LIKE_COMMENT = "LIKE_COMMENT",

  // Social
  FOLLOW = "FOLLOW",
  UNFOLLOW = "UNFOLLOW",

  // Mentions
  MENTION_POST = "MENTION_POST",
  MENTION_COMMENT = "MENTION_COMMENT",

  // System
  SYSTEM = "SYSTEM",

  // Reactions (generic future-proof)
  REACTION = "REACTION",
}