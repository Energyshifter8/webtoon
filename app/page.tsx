"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { HorizontalCarousel } from "@/components/horizontal-carousel";
import { MembershipModal } from "@/components/membership-modal";
import { MobileFallback } from "@/components/mobile-fallback";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { POSTERS } from "@/lib/posters";

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
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [membershipModalOpen, setMembershipModalOpen] = useState(false);
	const isMobile = useIsMobile();

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

	return (
		<div className="relative min-h-screen bg-background">
			{/* Desktop: 3D Carousel */}
			{!isMobile && <HorizontalCarousel posters={POSTERS} />}

			{/* Header — glass effect */}
			<header className="glass fixed top-0 left-0 right-0 z-50 border-b border-border/40">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
					<Link href="/" className="flex items-center gap-2">
						<span className="text-xl font-bold gradient-text">📖 Webtoon</span>
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
				<main className="pt-16">
					<div className="mb-6 px-4 text-center">
						<h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
							Discover Comics
						</h2>
						<p className="text-sm text-muted-foreground">
							Browse our collection — no account needed to explore.
						</p>
					</div>
					<MobileFallback posters={POSTERS} onPosterClick={handlePosterClick} />
				</main>
			)}

			{/* Modals */}
			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
