"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
	uid: string;
	email: string;
	displayName: string;
	role: string;
	membershipStatus: string;
	createdAt: string;
	lastLoginAt: string;
}

export default function AdminUsersPage() {
	const { currentUser, isAdmin, loading: authLoading } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [users, setUsers] = useState<UserData[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [membershipFilter, setMembershipFilter] = useState<string>("all");
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
	const [pendingPromote, setPendingPromote] = useState<{ uid: string; email: string } | null>(null);

	useEffect(() => {
		if (!authLoading && (!currentUser || !isAdmin)) {
			router.push("/");
		}
	}, [currentUser, isAdmin, authLoading, router]);

	useEffect(() => {
		if (!currentUser || !isAdmin) return;

		const fetchUsers = async () => {
			setLoading(true);
			try {
				const snapshot = await getDocs(collection(db, "users"));
				const data = snapshot.docs.map((docSnap) => {
					const d = docSnap.data();
					return {
						uid: docSnap.id,
						email: d.email || "",
						displayName: d.displayName || "",
						role: d.role || "user",
						membershipStatus: d.membershipStatus || "none",
						createdAt: d.createdAt?.toDate?.()?.toISOString() ?? "",
						lastLoginAt: d.lastLoginAt?.toDate?.()?.toISOString() ?? "",
					};
				});
				setUsers(data);
			} catch {
				toast("Failed to load users", "error");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [currentUser, isAdmin, toast]);

	const filteredUsers = users.filter((u) => {
		const matchesSearch = search === "" || u.email.toLowerCase().includes(search.toLowerCase()) || u.displayName.toLowerCase().includes(search.toLowerCase());
		const matchesMembership = membershipFilter === "all" || u.membershipStatus === membershipFilter;
		return matchesSearch && matchesMembership;
	});

	async function updateMembership(uid: string, status: string) {
		setUpdatingId(uid);
		try {
			await updateDoc(doc(db, "users", uid), { membershipStatus: status });
			setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, membershipStatus: status } : u)));
			toast("Membership updated", "success");
		} catch {
			toast("Failed to update membership", "error");
		} finally {
			setUpdatingId(null);
		}
	}

	async function updateRole(uid: string, role: string) {
		setUpdatingId(uid);
		try {
			await updateDoc(doc(db, "users", uid), { role });
			setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
			toast("Role updated", "success");
		} catch {
			toast("Failed to update role", "error");
		} finally {
			setUpdatingId(null);
		}
	}

	function handlePromoteClick(uid: string, email: string, currentRole: string) {
		if (currentRole === "admin") {
			updateRole(uid, "user");
			return;
		}
		setPendingPromote({ uid, email });
		setPromoteDialogOpen(true);
	}

	function confirmPromote() {
		if (pendingPromote) {
			updateRole(pendingPromote.uid, "admin");
			setPendingPromote(null);
			setPromoteDialogOpen(false);
		}
	}

	if (authLoading || !currentUser || !isAdmin) return null;

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
			<h1 className="mb-6 text-2xl font-bold">Manage Users</h1>

			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
				<Input
					placeholder="Search by email or name..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-sm"
				/>
				<Select value={membershipFilter} onValueChange={setMembershipFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Membership" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="none">None</SelectItem>
						<SelectItem value="free">Free</SelectItem>
						<SelectItem value="paid">Paid</SelectItem>
						<SelectItem value="premium">Premium</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{loading ? (
				<div className="flex justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : filteredUsers.length === 0 ? (
				<div className="rounded-xl border border-border/50 bg-card py-12 text-center">
					<p className="text-muted-foreground">No users found.</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-border/50 bg-muted/50">
								<th className="px-4 py-3 font-medium">Email</th>
								<th className="px-4 py-3 font-medium">Name</th>
								<th className="px-4 py-3 font-medium">Role</th>
								<th className="px-4 py-3 font-medium">Membership</th>
								<th className="px-4 py-3 font-medium">Created</th>
								<th className="px-4 py-3 font-medium">Last Login</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.map((user) => (
								<tr key={user.uid} className="border-b border-border/30 last:border-0">
									<td className="max-w-[200px] truncate px-4 py-3">{user.email}</td>
									<td className="max-w-[150px] truncate px-4 py-3 text-muted-foreground">
										{user.displayName || "—"}
									</td>
									<td className="px-4 py-3">
										<button
											type="button"
											onClick={() => handlePromoteClick(user.uid, user.email, user.role)}
											disabled={updatingId === user.uid}
											className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
												user.role === "admin"
													? "bg-primary/10 text-primary hover:bg-primary/20"
													: "bg-muted text-muted-foreground hover:bg-muted/80"
											} disabled:opacity-50`}
										>
											{updatingId === user.uid ? "..." : user.role === "admin" ? "Admin" : "User"}
										</button>
									</td>
									<td className="px-4 py-3">
										<Select
											value={user.membershipStatus}
											onValueChange={(val) => updateMembership(user.uid, val)}
											disabled={updatingId === user.uid}
										>
											<SelectTrigger className="h-8 w-[100px] text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="none">None</SelectItem>
												<SelectItem value="free">Free</SelectItem>
												<SelectItem value="paid">Paid</SelectItem>
												<SelectItem value="premium">Premium</SelectItem>
											</SelectContent>
										</Select>
									</td>
									<td className="px-4 py-3 text-xs text-muted-foreground">
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
									</td>
									<td className="px-4 py-3 text-xs text-muted-foreground">
										{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<AlertDialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Promote to Admin?</AlertDialogTitle>
						<AlertDialogDescription>
							This will grant <strong>{pendingPromote?.email}</strong> full access to all admin routes
							including user management, uploads, and payments.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogClose>Cancel</AlertDialogClose>
						<Button onClick={confirmPromote}>Promote</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
