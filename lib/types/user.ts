export type CreateUserParams = {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  role: string;
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
};
