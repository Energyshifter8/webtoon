"use client";

import { onAuthStateChanged, type User, getIdTokenResult } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import type { MembershipStatus, UserProfile } from "@/types/user";

interface AuthContextValue {
	currentUser: User | null;
	userProfile: UserProfile | null;
	membershipStatus: MembershipStatus;
	isAdmin: boolean;
	loading: boolean;
	activateMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [authResolved, setAuthResolved] = useState(false);
	const [profileResolved, setProfileResolved] = useState(false);
	const [claimsResolved, setClaimsResolved] = useState(false);
	const [adminClaim, setAdminClaim] = useState(false);

	useEffect(() => {
		let claimsAbort = false;

		const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user);
			setAdminClaim(false);
			setClaimsResolved(false);

			if (!user) {
				setUserProfile(null);
				setAuthResolved(true);
				setProfileResolved(true);
				setClaimsResolved(true);
				return;
			}

			setAuthResolved(true);
			setProfileResolved(false);

			// read id token claims to detect custom 'admin' claim
			getIdTokenResult(user)
				.then((res) => {
					if (!claimsAbort) {
						console.log("[useAuth] Claims resolved:", { admin: res.claims?.admin, allClaims: Object.keys(res.claims || {}) });
						setAdminClaim(Boolean(res.claims?.admin));
						setClaimsResolved(true);
					}
				})
				.catch((err) => {
					if (!claimsAbort) {
						console.warn("[useAuth] Claims error:", err);
						setAdminClaim(false);
						setClaimsResolved(true);
					}
				});

			const userDocRef = doc(db, "users", user.uid);

			const unsubscribeProfile = onSnapshot(
				userDocRef,
				(snapshot) => {
					if (snapshot.exists()) {
						const data = snapshot.data();
						console.log("[useAuth] Profile loaded from Firestore:", { role: data.role, membershipStatus: data.membershipStatus, uid: user.uid });
						setUserProfile({
							uid: user.uid,
							email: user.email ?? "",
							displayName: data.displayName,
							membershipStatus: data.membershipStatus ?? "none",
							role: data.role ?? "user",
							createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
						});
					} else {
						console.log("[useAuth] No Firestore doc for uid:", user.uid);
						setUserProfile({
							uid: user.uid,
							email: user.email ?? "",
							displayName: user.displayName ?? undefined,
							membershipStatus: "none",
							role: "user",
							createdAt: new Date().toISOString(),
						});
					}
					setProfileResolved(true);
				},
				(error) => {
					console.warn("[useAuth] Firestore snapshot error:", error.message, error.code);
					setUserProfile({
						uid: user.uid,
						email: user.email ?? "",
						displayName: user.displayName ?? undefined,
						membershipStatus: "none",
						role: "user",
						createdAt: new Date().toISOString(),
					});
					setProfileResolved(true);
				},
			);

			return () => {
				claimsAbort = true;
				unsubscribeProfile();
			};
		});

		return () => unsubscribeAuth();
	}, []);

	const membershipStatus = userProfile?.membershipStatus ?? "none";
	const isAdmin = userProfile?.role === "admin" || adminClaim;
	const loading = !authResolved || !profileResolved || !claimsResolved;

	if (!loading) {
		console.log("[useAuth] Final state:", { isAdmin, role: userProfile?.role, adminClaim, uid: currentUser?.uid });
	}

	const activateMembership = async () => {
		if (!currentUser) return;
		const userDocRef = doc(db, "users", currentUser.uid);
		await setDoc(userDocRef, { membershipStatus: "free" }, { merge: true });
	};

	return (
		<AuthContext.Provider
			value={{ currentUser, userProfile, membershipStatus, isAdmin, loading, activateMembership }}
		>
			{children}
		</AuthContext.Provider>
	);
}
