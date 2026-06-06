"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.usergqlSchema = exports.UsergqlSchema = void 0;
const userTypesgql = __importStar(require("./user.types.gql"));
const userArgs = __importStar(require("./user.args.gql"));
const user_resolver_gql_1 = require("./user.resolver.gql");
const graphql_1 = require("graphql");
class UsergqlSchema {
    userResolverGql;
    constructor() {
        this.userResolverGql = user_resolver_gql_1.userResolverGql;
    }
    registerQuery() {
        return {
            profile: {
                type: userTypesgql.profile,
                args: userArgs.profile,
                resolve: this.userResolverGql.profile,
            },
        };
    }
    registerMutation() {
        return {
            like: {
                type: graphql_1.GraphQLString,
                description: "",
                resolve: () => { },
            },
        };
    }
}
exports.UsergqlSchema = UsergqlSchema;
exports.usergqlSchema = new UsergqlSchema();
