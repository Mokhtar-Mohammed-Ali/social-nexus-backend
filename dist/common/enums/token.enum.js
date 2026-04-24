"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKENTYPEENUM = exports.LOGOUTENUM = exports.ROLEENUM = void 0;
var ROLEENUM;
(function (ROLEENUM) {
    ROLEENUM[ROLEENUM["User"] = 0] = "User";
    ROLEENUM[ROLEENUM["Admin"] = 1] = "Admin";
})(ROLEENUM || (exports.ROLEENUM = ROLEENUM = {}));
var LOGOUTENUM;
(function (LOGOUTENUM) {
    LOGOUTENUM[LOGOUTENUM["ONE"] = 0] = "ONE";
    LOGOUTENUM[LOGOUTENUM["ALL"] = 1] = "ALL";
})(LOGOUTENUM || (exports.LOGOUTENUM = LOGOUTENUM = {}));
var TOKENTYPEENUM;
(function (TOKENTYPEENUM) {
    TOKENTYPEENUM[TOKENTYPEENUM["ACCESS"] = 0] = "ACCESS";
    TOKENTYPEENUM[TOKENTYPEENUM["REFRESH"] = 1] = "REFRESH";
})(TOKENTYPEENUM || (exports.TOKENTYPEENUM = TOKENTYPEENUM = {}));
;
