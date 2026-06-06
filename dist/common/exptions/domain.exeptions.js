"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorExpetions = exports.ForbiddenExpetions = exports.UnauthorizedExpetions = exports.NotFoundExpetions = exports.ConflictException = exports.BadRequestExpetions = exports.mapGeaphQLError = void 0;
const graphql_1 = require("graphql");
const application_exptions_1 = require("./application.exptions");
const mapGeaphQLError = (error) => {
    throw new graphql_1.GraphQLError(error.message || "internal server error", { extensions: {
            statusCode: error.status || 500,
            cause: error.cause
        } });
};
exports.mapGeaphQLError = mapGeaphQLError;
class BadRequestExpetions extends application_exptions_1.ErrorAplicationExeptions {
    constructor(message, cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestExpetions = BadRequestExpetions;
class ConflictException extends application_exptions_1.ErrorAplicationExeptions {
    constructor(message, cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class NotFoundExpetions extends application_exptions_1.ErrorAplicationExeptions {
    constructor(message, cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundExpetions = NotFoundExpetions;
class UnauthorizedExpetions extends application_exptions_1.ErrorAplicationExeptions {
    constructor(message, cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedExpetions = UnauthorizedExpetions;
class ForbiddenExpetions extends application_exptions_1.ErrorAplicationExeptions {
    constructor(message, cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenExpetions = ForbiddenExpetions;
class InternalServerErrorExpetions extends application_exptions_1.ErrorAplicationExeptions {
    constructor(message, cause) {
        super(message, 500, cause);
    }
}
exports.InternalServerErrorExpetions = InternalServerErrorExpetions;
