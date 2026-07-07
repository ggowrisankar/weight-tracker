import { authMiddleware } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

//Mock the jsonwebtoken library so we control exactly what jwt.verify returns, instead of needing a real token or a real JWT_SECRET.
jest.mock('jsonwebtoken');

//Helper to build a fake Express `req` object with a given Authorization header.
function buildReq(authHeaderValue) {
  return {
    headers: {
      authorization: authHeaderValue,
    },
  };
}

//Helper to build a fake Express `res` object we can inspect after the call.
function buildRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); //allows res.status(401).json(...) chaining
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  // lear mock call history between tests so one test's calls don't bleed into another's assertions.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls next() and attaches req.user when token is valid', () => {
    const req = buildReq('Bearer valid.token.here');
    const res = buildRes();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 'user123', email: 'test@example.com' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', process.env.JWT_SECRET);
    expect(req.user).toEqual({ id: 'user123', email: 'test@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when no Authorization header is present', () => {
    const req = buildReq(undefined);
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header does not start with "Bearer"', () => {
    const req = buildReq('Basic somecredentials');
    const res = buildRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when jwt.verify throws (invalid or expired token)', () => {
    const req = buildReq('Bearer some.invalid.token');
    const res = buildRes();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid Token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('handles a malformed Authorization header gracefully (e.g. "Bearer" with no token)', () => {
    // This tests the edge case we actually flagged during code review earlier:
    // authHeader.split(" ")[1] assumes a well-formed header.
    const req = buildReq('Bearer');
    const res = buildRes();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('jwt must be provided');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});