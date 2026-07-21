export type MembershipStatus = "none" | "free" | "premium" | "paid";

export type UserRole = "user" | "admin";

export interface UserProfile {
	uid: string;
	email: string;
	displayName?: string;
	membershipStatus: MembershipStatus;
	role: UserRole;
	createdAt: string;
}
