export type MembershipStatus = "none" | "free" | "premium";

export interface UserProfile {
	uid: string;
	email: string;
	displayName?: string;
	membershipStatus: MembershipStatus;
	createdAt: string;
}
