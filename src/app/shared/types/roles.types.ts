export enum UserRole {
  Mechanic = 'mechanic',
  User = 'user',
  Admin = 'admin',
}

export type RoleButtonAppearance = 'outline' | 'secondary';

export type RoleDefinition = {
  readonly role: UserRole;
  readonly label: string;
  readonly icon: string;
  readonly appearance: RoleButtonAppearance;
  readonly homeRoute: string;
};

export type RoleStorage = {
  read(): UserRole | null;
  write(role: UserRole): void;
  clear(): void;
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && Object.values(UserRole).includes(value as UserRole);
}
