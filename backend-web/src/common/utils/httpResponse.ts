import { Response } from "express";

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json(data);
}

export function fail(res: Response, error: string, status = 400) {
  return res.status(status).json({ error });
}

export function notFound(res: Response, message = "Not found") {
  return res.status(404).json({ error: message });
}
