"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionValue = exports.ReactionType = void 0;
var ReactionType;
(function (ReactionType) {
    ReactionType[ReactionType["POST"] = 0] = "POST";
    ReactionType[ReactionType["COMMENT"] = 1] = "COMMENT";
})(ReactionType || (exports.ReactionType = ReactionType = {}));
var ReactionValue;
(function (ReactionValue) {
    ReactionValue[ReactionValue["LIKE"] = 0] = "LIKE";
    ReactionValue[ReactionValue["LOVE"] = 1] = "LOVE";
    ReactionValue[ReactionValue["HAHA"] = 2] = "HAHA";
    ReactionValue[ReactionValue["WOW"] = 3] = "WOW";
    ReactionValue[ReactionValue["ANGRY"] = 4] = "ANGRY";
    ReactionValue[ReactionValue["SAD"] = 5] = "SAD";
})(ReactionValue || (exports.ReactionValue = ReactionValue = {}));
