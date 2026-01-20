// This file is used to define the HttpError class and the STATUSCODE object

const STATUSCODE = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

const statusToMessage = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Internal Server Error"
};

class HttpError extends Error {
  constructor(statusCode, message="") {
    if (message === "") {
      message = statusToMessage[statusCode];
    }
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function handleError(error, res) {
    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    // We are NOT suppose to handle exceptions that is not of type HttpError
    // If received this kind of error - we need to display where it was thrown
    // and declare it as an actual error. We only need to reach here in the
    // debugging faze.
    console.error(`ERROR : ${error.message}`)
    console.error(`THROWN: ${error.stack}`)
    return res.status(STATUSCODE.INTERNAL_SERVER_ERROR).json({ error: "Some kind of error" });
}

// Export both the class and the constants
module.exports = {
    HttpError,
    STATUSCODE,
    handleError
};