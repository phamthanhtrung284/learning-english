export interface PublicUser {
  id: string;
  username: string;
  email: string;
  level: string;
  xp: number;
  streak: number;
  isAdmin: boolean;
  isPremium: boolean;
  avatar: string;
  dailyUsage: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
}
