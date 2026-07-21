"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { MembershipModal } from "@/components/membership-modal";
import { MobileFallback } from "@/components/mobile-fallback";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLenis } from "@/hooks/use-lenis";
import { getComics } from "@/lib/comics";
import { POSTERS } from "@/lib/posters";
import type { Comic } from "@/types/comic";

const WorldCanvas = dynamic(
	() => import("@/components/world-canvas").then((mod) => mod.WorldCanvas),
	{ ssr: false },
);

function useIsMobile(breakpoint = 768): boolean {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < breakpoint);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, [breakpoint]);

	return isMobile;
}

export default function Home() {
	const { currentUser, membershipStatus, loading: authLoading } = useAuth();
	const [comics, setComics] = useState<Comic[]>([]);
	const [loading, setLoading] = useState(true);
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [membershipModalOpen, setMembershipModalOpen] = useState(false);
	const isMobile = useIsMobile();

	useLenis();

	useEffect(() => {
		getComics()
			.then(setComics)
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	const handlePosterClick = useCallback(
		(posterId: string) => {
			if (authLoading) return;

			if (!currentUser) {
				setAuthModalOpen(true);
				return;
			}

			if (membershipStatus === "none") {
				setMembershipModalOpen(true);
				return;
			}

			window.location.href = `/comic/${posterId}`;
		},
		[currentUser, membershipStatus, authLoading],
	);

	const handleComicClick = useCallback(
		(comicId: string) => {
			if (authLoading) return;

			if (!currentUser) {
				setAuthModalOpen(true);
				return;
			}

			if (membershipStatus === "none") {
				setMembershipModalOpen(true);
				return;
			}

			window.location.href = `/comic/${comicId}`;
		},
		[currentUser, membershipStatus, authLoading],
	);

	return (
		<div className="relative min-h-screen bg-background">
			{/* 3D Canvas — V0 with hardcoded posters */}
			{!isMobile && (
				<Suspense fallback={null}>
					<WorldCanvas />
				</Suspense>
			)}

			{/* Scroll spacer for Lenis + camera rig */}
			{!isMobile && <div style={{ height: `${POSTERS.length * 120 + 200}vh` }} />}

			{/* Header — glass effect */}
			<header className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/40">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link href="/" className="flex items-center gap-2">
						<span className="text-2xl">📖</span>
						<span className="text-xl font-bold gradient-text">Webtoon</span>
					</Link>
					<div className="flex items-center gap-3">
						<ThemeToggle />
						{currentUser ? (
							<Link href="/account">
								<Button variant="ghost" size="sm" className="gap-2">
									<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
										{(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
									</div>
									<span className="hidden sm:inline">{currentUser.displayName || currentUser.email}</span>
								</Button>
							</Link>
						) : (
							<div className="flex gap-2">
								<Link href="/login">
									<Button variant="ghost" size="sm" className="rounded-xl">
										Log in
									</Button>
								</Link>
								<Link href="/signup">
									<Button size="sm" className="rounded-xl px-4 font-medium transition-all hover:shadow-lg hover:shadow-primary/25">
										Sign up
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Mobile fallback */}
			{isMobile && (
				<main className="pt-20">
					<div className="mb-8 px-6 text-center">
						<h2 className="mb-2 text-3xl font-bold tracking-tight">
							Discover Comics
						</h2>
						<p className="text-muted-foreground">
							Browse our collection — no account needed to explore.
						</p>
					</div>
					{!loading && comics.length > 0 && (
						<MobileFallback comics={comics} onComicClick={handleComicClick} />
					)}
				</main>
			)}

			{/* Loading state */}
			{loading && (
				<div className="flex flex-1 items-center justify-center pt-20">
					<div className="flex flex-col items-center gap-4">
						<div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<p className="text-sm text-muted-foreground">Loading comics...</p>
					</div>
				</div>
			)}

			{/* Empty state */}
			{!loading && comics.length === 0 && isMobile && (
				<main className="flex flex-col items-center justify-center gap-4 pt-32 text-center px-6">
					<div className="text-5xl">📚</div>
					<p className="text-lg text-muted-foreground">No comics yet.</p>
					<p className="text-sm text-muted-foreground">
						Add comics to the <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">comics</code> collection in Firestore.
					</p>
				</main>
			)}

			{/* Modals */}
			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
