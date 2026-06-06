"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["LIKE_POST"] = "LIKE_POST";
    NotificationType["COMMENT_POST"] = "COMMENT_POST";
    NotificationType["REPOST"] = "REPOST";
    NotificationType["REPLY_COMMENT"] = "REPLY_COMMENT";
    NotificationType["LIKE_COMMENT"] = "LIKE_COMMENT";
    NotificationType["FOLLOW"] = "FOLLOW";
    NotificationType["UNFOLLOW"] = "UNFOLLOW";
    NotificationType["MENTION_POST"] = "MENTION_POST";
    NotificationType["MENTION_COMMENT"] = "MENTION_COMMENT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["REACTION"] = "REACTION";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
