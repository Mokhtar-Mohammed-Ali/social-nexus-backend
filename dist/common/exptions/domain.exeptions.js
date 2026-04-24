"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorExpetions = exports.ForbiddenExpetions = exports.UnauthorizedExpetions = exports.NotFoundExpetions = exports.ConflictException = exports.BadRequestExpetions = void 0;
const application_exptions_1 = require("./application.exptions");
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
