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
	const [, setPendingComicId] = useState<string | null>(null);
	const isMobile = useIsMobile();

	useLenis();

	useEffect(() => {
		getComics()
			.then(setComics)
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	const handleComicClick = useCallback(
		(comicId: string) => {
			if (authLoading) return;

			if (!currentUser) {
				setPendingComicId(comicId);
				setAuthModalOpen(true);
				return;
			}

			if (membershipStatus === "none") {
				setPendingComicId(comicId);
				setMembershipModalOpen(true);
				return;
			}

			window.location.href = `/comic/${comicId}`;
		},
		[currentUser, membershipStatus, authLoading],
	);

	return (
		<div className="relative min-h-screen bg-zinc-50 dark:bg-black">
			{/* 3D Canvas — fixed fullscreen behind everything */}
			{!loading && comics.length > 0 && !isMobile && (
				<Suspense fallback={null}>
					<WorldCanvas comics={comics} onComicClick={handleComicClick} />
				</Suspense>
			)}

			{/* Header — sits above Canvas */}
			<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-md">
				<h1 className="text-xl font-bold">Webtoon</h1>
				<div className="flex items-center gap-3">
					<ThemeToggle />
					{currentUser ? (
						<Button variant="ghost" size="sm">
							{currentUser.displayName || currentUser.email}
						</Button>
					) : (
						<div className="flex gap-2">
							<Link
								href="/login"
								className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground"
							>
								Log in
							</Link>
							<Link
								href="/signup"
								className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</header>

			{/* Scroll spacer — invisible, provides scroll height for Lenis + camera rig */}
			{!loading && comics.length > 0 && !isMobile && (
				<div style={{ height: `${comics.length * 120 + 200}vh` }} />
			)}

			{/* Mobile fallback — simple vertical list with fade-on-scroll */}
			{!loading && comics.length > 0 && isMobile && (
				<main className="pt-20">
					<div className="mb-8 text-center">
						<h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
							Discover Comics
						</h2>
						<p className="text-muted-foreground">
							Browse our collection — no account needed to explore.
						</p>
					</div>
					<MobileFallback comics={comics} onComicClick={handleComicClick} />
				</main>
			)}

			{/* Loading state */}
			{loading && (
				<div className="flex flex-1 items-center justify-center pt-20">
					<p className="text-muted-foreground">Loading comics...</p>
				</div>
			)}

			{/* Empty state */}
			{!loading && comics.length === 0 && (
				<main className="flex flex-col items-center gap-4 pt-20 text-center">
					<h2 className="text-3xl font-bold tracking-tight text-foreground">Discover Comics</h2>
					<p className="text-lg text-muted-foreground">No comics yet.</p>
					<p className="text-sm text-muted-foreground">
						Add comics to the <code>comics</code> collection in Firestore to see them here.
					</p>
				</main>
			)}

			{/* Modals */}
			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
