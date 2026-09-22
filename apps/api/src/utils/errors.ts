export class HttpError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  static badRequest(message = 'Permintaan tidak valid.', code = 'BAD_REQUEST', details?: unknown) {
    return new HttpError(400, code, message, details);
  }

  static unauthorized(message = 'Kamu perlu masuk untuk mengakses halaman ini.', code = 'UNAUTHORIZED') {
    return new HttpError(401, code, message);
  }

  static forbidden(message = 'Kamu tidak memiliki wewenang untuk aksi ini.', code = 'FORBIDDEN') {
    return new HttpError(403, code, message);
  }

  static notFound(message = 'Sumber daya tidak ditemukan.', code = 'NOT_FOUND') {
    return new HttpError(404, code, message);
  }

  static conflict(message = 'Data sudah ada atau terjadi konflik.', code = 'CONFLICT') {
    return new HttpError(409, code, message);
  }

  static unprocessable(message = 'Data tidak dapat diproses.', code = 'UNPROCESSABLE_ENTITY', details?: unknown) {
    return new HttpError(422, code, message, details);
  }

  static tooManyRequests(message = 'Terlalu banyak permintaan. Coba lagi nanti.', code = 'RATE_LIMIT_EXCEEDED') {
    return new HttpError(429, code, message);
  }
}
