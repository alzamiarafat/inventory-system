class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function badRequest(message, details) {
  return new HttpError(400, message, details);
}

function conflict(message, details) {
  return new HttpError(409, message, details);
}

function forbidden(message, details) {
  return new HttpError(403, message, details);
}

function notFound(message, details) {
  return new HttpError(404, message, details);
}

module.exports = {
  HttpError,
  badRequest,
  conflict,
  forbidden,
  notFound,
};

