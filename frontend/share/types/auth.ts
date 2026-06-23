export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isPremium: boolean;
  level: string;
  xp: number;
  streak: number;
  avatar: string;
  dailyUsage: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
