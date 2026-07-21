"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { isAdmin, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !isAdmin) {
			router.push("/");
		}
	}, [isAdmin, loading, router]);

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center justify-between border-b px-6 py-4">
				<div className="flex items-center gap-4">
					<Link href="/" className="text-xl font-bold hover:opacity-80">
						Webtoon A+
					</Link>
					<span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
						Admin
					</span>
				</div>
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<Link href="/admin/upload">
						<Button variant="ghost" size="sm">
							Upload
						</Button>
					</Link>
					<Link href="/admin/announcements">
						<Button variant="ghost" size="sm">
							Announcements
						</Button>
					</Link>
					<Link href="/admin/payments">
						<Button variant="ghost" size="sm">
							Payments
						</Button>
					</Link>
				</div>
			</header>
			{children}
		</div>
	);
}
