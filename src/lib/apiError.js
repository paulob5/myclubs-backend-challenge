/*
  Error wrapping our API errors (especially the codes).
*/

// this class can be imported via require().default
// or the standard default import syntax
// like so: import ApiError from 'location'
export default class ApiError extends Error {
  constructor(error) {
    const {
      code = "0000",
      message = "An error occurred.",
      status = 422,
      stack
    } = error;

    super(message);

    this.message = message;
    this.code = code;
    this.status = status;
    this.stack = stack;
    // this is important as the constructor
    // name is error because the class is
    // derived from the Error class
    this.name = "ApiError";

    Error.captureStackTrace(this, ApiError);
  }
}

// this function unifies all errors to not leak any sensitive
// error information to the clients, it can be extended to
// provide special developer specific stack traces in the future
export const expressErrorHandler = (err, req, res, _) => {
  const { name } = err;

  // convert unknown errors to standard
  // api errors for default error values
  if (!name || name !== "ApiError") {
    err = new ApiError(err);
    err.status = 500;
  }

  !IS_PRODUCTION && console.error(err);

  const { status, code, message } = err;

  // do this to prevent sensitive error messages
  // from leaking out. ApiErrors have a standard
  // error message so no additional check is required
  const errMsg = name === "ApiError" ? message : "An internal error occurred.";

  return res.status(status).json({ error: { code, message: errMsg } });
};
