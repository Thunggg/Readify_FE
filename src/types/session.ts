export type AccountSession = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  lastUsedAt?: string | Date;
  createdAt?: string | Date;
  isCurrent?: boolean;
};

