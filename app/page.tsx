"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { MembershipModal } from "@/components/membership-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getComics } from "@/lib/comics";
import type { Comic } from "@/types/comic";

export default function Home() {
	const { currentUser, membershipStatus, loading: authLoading } = useAuth();
	const [comics, setComics] = useState<Comic[]>([]);
	const [loading, setLoading] = useState(true);
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [membershipModalOpen, setMembershipModalOpen] = useState(false);
	const [, setPendingComicId] = useState<string | null>(null);

	useEffect(() => {
		getComics()
			.then(setComics)
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	const handleComicClick = (comicId: string) => {
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
	};

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center justify-between border-b px-6 py-4">
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

			<main className="flex flex-1 flex-col items-center px-6 py-10">
				<section className="mb-12 text-center">
					<h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
						Discover Comics
					</h2>
					<p className="text-muted-foreground">
						Browse our collection — no account needed to explore.
					</p>
				</section>

				{loading ? (
					<div className="flex items-center justify-center py-20">
						<p className="text-muted-foreground">Loading comics...</p>
					</div>
				) : comics.length === 0 ? (
					<div className="flex flex-col items-center gap-4 py-20 text-center">
						<p className="text-lg text-muted-foreground">No comics yet.</p>
						<p className="text-sm text-muted-foreground">
							Add comics to the <code>comics</code> collection in Firestore to see them here.
						</p>
					</div>
				) : (
					<section className="grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
						{comics.map((comic) => (
							<button
								key={comic.id}
								type="button"
								onClick={() => handleComicClick(comic.id)}
								className="group text-left"
							>
								<Card className="overflow-hidden transition-all hover:shadow-md">
									<div className="flex aspect-[3/4] items-center justify-center bg-muted p-6">
										<Image
											src={comic.cover}
											alt={comic.title}
											width={200}
											height={267}
											className="h-full w-full object-contain opacity-70 transition-opacity group-hover:opacity-100"
										/>
									</div>
									<CardContent className="flex flex-col gap-1 p-4">
										<h3 className="font-semibold leading-tight">{comic.title}</h3>
										<p className="text-sm text-muted-foreground">{comic.author}</p>
										<p className="text-xs text-muted-foreground">
											{comic.episodeCount} {comic.episodeCount === 1 ? "episode" : "episodes"}
										</p>
									</CardContent>
								</Card>
							</button>
						))}
					</section>
				)}
			</main>

			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
