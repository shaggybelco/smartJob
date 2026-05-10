import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * The problem this solves
 * ------------------------
 * In Express, route handlers are expected to be synchronous. If you write an
 * async handler and it throws (or a Promise rejects), Express does NOT catch it
 * automatically — the request hangs and the error never reaches `errorHandler`.
 *
 * The classic fix is to wrap every async handler in try/catch + next(err):
 *
 *     router.post("/login", async (req, res, next) => {
 *       try {
 *         const user = await AuthService.login(req.body);
 *         res.json(user);
 *       } catch (err) {
 *         next(err);                   // ← had to remember this every time
 *       }
 *     });
 *
 * `asyncHandler` does that wrapping for you, so the controller can be:
 *
 *     login: asyncHandler(async (req, res) => {
 *       const user = await AuthService.login(req.body);
 *       res.json(user);
 *     });
 *
 * If the inner function throws or its Promise rejects, we catch the error and
 * forward it to Express's error pipeline via `next(err)`. The `errorHandler`
 * middleware then turns it into a JSON response.
 */

// What an async handler looks like: same shape as a normal Express handler,
// but it's allowed to be async (return a Promise).
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    // Promise.resolve(...) handles two cases at once:
    //  - if `fn` is async, it already returns a Promise → we just attach .catch
    //  - if `fn` happens to be sync, Promise.resolve wraps the result so we can
    //    still attach .catch (defensive — shouldn't happen with our usage)
    Promise.resolve(fn(req, res, next)).catch(next);
  };
