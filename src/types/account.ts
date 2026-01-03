export type AdminAccount = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | Date;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  email: string;
  password?: string;
  lastLoginAt?: string | Date;
  status?: number; // 1: active, 0: inactive, -1: banned, 2: not active email
  isDeleted?: boolean;
  role?: number; // 0: user, 1: admin, 2: seller, 3: warehouse manager
  sex?: number; // 1: male, 2: female
  createdAt?: string;
  updatedAt?: string;
};
