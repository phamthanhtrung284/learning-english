import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    error: err.message || "Server error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
