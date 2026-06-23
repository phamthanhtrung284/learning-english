import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; isAdmin?: boolean };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
