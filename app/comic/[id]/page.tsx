"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { MembershipModal } from "@/components/membership-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getComicById } from "@/lib/comics";
import type { Comic } from "@/types/comic";

export default function ComicPage() {
	const params = useParams();
	const router = useRouter();
	const comicId = params.id as string;
	const { currentUser, membershipStatus, loading: authLoading } = useAuth();
	const [comic, setComic] = useState<Comic | null>(null);
	const [loading, setLoading] = useState(true);
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [membershipModalOpen, setMembershipModalOpen] = useState(false);

	useEffect(() => {
		if (!comicId) return;
		getComicById(comicId)
			.then(setComic)
			.catch(() => setComic(null))
			.finally(() => setLoading(false));
	}, [comicId]);

	const hasAccess = currentUser && membershipStatus !== "none" && comic?.accessLevel === "free";
	const showAuthPrompt = !authLoading && !currentUser;
	const showMembershipPrompt = !authLoading && currentUser && membershipStatus === "none";

	useEffect(() => {
		if (loading || authLoading) return;
		if (showAuthPrompt) {
			setAuthModalOpen(true);
		} else if (showMembershipPrompt) {
			setMembershipModalOpen(true);
		}
	}, [loading, authLoading, showAuthPrompt, showMembershipPrompt]);

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
				<p className="text-muted-foreground">Loading comic...</p>
			</div>
		);
	}

	if (!comic) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 gap-4 dark:bg-black">
				<p className="text-lg text-muted-foreground">Comic not found.</p>
				<Link href="/" className="text-sm font-medium text-primary hover:underline">
					Back to home
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center justify-between border-b px-6 py-4">
				<button
					type="button"
					onClick={() => router.push("/")}
					className="text-xl font-bold hover:opacity-80"
				>
					Webtoon
				</button>
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
				<div className="w-full max-w-3xl">
					<Card className="overflow-hidden">
						<div className="flex aspect-[16/9] items-center justify-center bg-muted p-8">
							<Image
								src={comic.cover}
								alt={comic.title}
								width={800}
								height={450}
								className="h-full w-full object-contain"
							/>
						</div>
						<CardContent className="flex flex-col gap-4 p-6">
							<div>
								<h1 className="text-2xl font-bold">{comic.title}</h1>
								<p className="text-sm text-muted-foreground">by {comic.author}</p>
							</div>
							<p className="text-muted-foreground">{comic.description}</p>
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<span>
									{comic.episodeCount} {comic.episodeCount === 1 ? "episode" : "episodes"}
								</span>
								<span className="capitalize">{comic.accessLevel}</span>
							</div>
						</CardContent>
					</Card>

					<div className="mt-8">
						{hasAccess ? (
							<div className="flex flex-col gap-4">
								<h2 className="text-lg font-semibold">Episodes</h2>
								<div className="flex flex-col gap-3">
									{Array.from({ length: comic.episodeCount }, (_, i) => i + 1).map((ep) => (
										<div
											key={ep}
											className="flex items-center justify-between rounded-lg border bg-card p-4"
										>
											<div>
												<p className="font-medium">Episode {ep}</p>
												<p className="text-sm text-muted-foreground">Read now</p>
											</div>
											<Button size="sm">Read</Button>
										</div>
									))}
								</div>
							</div>
						) : showAuthPrompt ? (
							<div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center">
								<p className="text-lg font-medium">Log in to read</p>
								<p className="text-sm text-muted-foreground">
									Create a free account to start reading {comic.title}.
								</p>
								<Button onClick={() => setAuthModalOpen(true)}>Log in</Button>
							</div>
						) : showMembershipPrompt ? (
							<div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center">
								<p className="text-lg font-medium">Activate membership</p>
								<p className="text-sm text-muted-foreground">
									Even free comics require activating your membership. It&apos;s free — one click
									and you&apos;re in.
								</p>
								<Button onClick={() => setMembershipModalOpen(true)}>
									Activate free membership
								</Button>
							</div>
						) : (
							<div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center">
								<p className="text-lg font-medium">Premium content</p>
								<p className="text-sm text-muted-foreground">
									This comic requires a premium membership to read.
								</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
