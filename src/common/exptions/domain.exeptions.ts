import { GraphQLError } from "graphql";
import { ErrorAplicationExeptions } from "./application.exptions";
export const mapGeaphQLError=(error:ErrorAplicationExeptions)=>{
throw new GraphQLError(
  error.message||"internal server error",
{  extensions:{
    statusCode:error.status||500,
    cause:error.cause
  }}
)
}
// Bad Request (400)
export class BadRequestExpetions extends ErrorAplicationExeptions {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
  }
}
// 409 Conflict
export class ConflictException extends ErrorAplicationExeptions {
  constructor(message: string, cause?: unknown) {
    super(message, 409, cause);
  }
}

// Not Found (404)
export class NotFoundExpetions extends ErrorAplicationExeptions {
  constructor(message: string, cause?: unknown) {
    super(message, 404, cause);
  }
}

// Unauthorized (401)
export class UnauthorizedExpetions extends ErrorAplicationExeptions {
  constructor(message: string, cause?: unknown) {
    super(message, 401, cause);
  }
}

// Forbidden (403)
export class ForbiddenExpetions extends ErrorAplicationExeptions {
  constructor(message: string, cause?: unknown) {
    super(message, 403, cause);
  }
}

// Internal Server Error (500)
export class InternalServerErrorExpetions extends ErrorAplicationExeptions {
  constructor(message: string, cause?: unknown) {
    super(message, 500, cause);
  }
}
