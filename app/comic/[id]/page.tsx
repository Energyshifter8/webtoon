"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { MembershipModal } from "@/components/membership-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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
			<div className="flex flex-1 items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Loading comic...</p>
				</div>
			</div>
		);
	}

	if (!comic) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-background gap-6 px-6">
				<div className="text-6xl">😕</div>
				<div className="text-center">
					<h2 className="text-2xl font-bold">Comic not found</h2>
					<p className="mt-2 text-muted-foreground">
						The comic you&apos;re looking for doesn&apos;t exist.
					</p>
				</div>
				<Link href="/">
					<Button className="rounded-xl px-6">Back to home</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="glass sticky top-0 z-50 border-b border-border/50">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
					<button
						type="button"
						onClick={() => router.push("/")}
						className="text-xl font-bold gradient-text"
					>
						Webtoon A+
					</button>
					<div className="flex items-center gap-4">
						<ThemeToggle />
						{currentUser ? (
							<Button variant="ghost" size="sm">
								{currentUser.displayName || currentUser.email}
							</Button>
						) : (
							<div className="flex gap-2">
								<Link
									href="/login"
									className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium transition-colors hover:bg-muted"
								>
									Log in
								</Link>
								<Link
									href="/signup"
									className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
								>
									Sign up
								</Link>
							</div>
						)}
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 py-10">
				<div className="animate-slide-up overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl">
					<div className="relative aspect-[21/9] overflow-hidden">
						<Image
							src={comic.cover}
							alt={comic.title}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 896px"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-8">
							<div className="flex items-end justify-between gap-6">
								<div>
									<div className="mb-3 flex items-center gap-2">
										<span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
											{comic.accessLevel === "free" ? "Free" : "Premium"}
										</span>
										<span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
											{comic.episodeCount} {comic.episodeCount === 1 ? "Episode" : "Episodes"}
										</span>
									</div>
									<h1 className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
										{comic.title}
									</h1>
									<p className="mt-2 text-sm text-white/80">by {comic.author}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="p-8">
						<p className="text-muted-foreground leading-relaxed">{comic.description}</p>
					</div>
				</div>

				<div className="mt-10">
					{hasAccess ? (
						<div className="animate-slide-up">
							<div className="mb-6 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
									📚
								</div>
								<h2 className="text-2xl font-bold">Episodes</h2>
							</div>
							<div className="flex flex-col gap-3">
								{Array.from({ length: comic.episodeCount }, (_, i) => i + 1).map((ep) => (
									<div
										key={ep}
										className="group flex items-center justify-between rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
									>
										<div className="flex items-center gap-4">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
												{ep}
											</div>
											<div>
												<p className="font-semibold">Episode {ep}</p>
												<p className="text-sm text-muted-foreground">Read now</p>
											</div>
										</div>
										<Button
											size="sm"
											className="rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
										>
											Read
										</Button>
									</div>
								))}
							</div>
						</div>
					) : showAuthPrompt ? (
						<div className="animate-slide-up flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card p-12 text-center shadow-lg">
							<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-4xl">
								🔐
							</div>
							<div>
								<h3 className="text-xl font-bold">Log in to read</h3>
								<p className="mt-2 max-w-sm text-muted-foreground">
									Create a free account to start reading {comic.title}.
								</p>
							</div>
							<Button
								onClick={() => setAuthModalOpen(true)}
								className="rounded-xl px-8 font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
							>
								Log in
							</Button>
						</div>
					) : showMembershipPrompt ? (
						<div className="animate-slide-up flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card p-12 text-center shadow-lg">
							<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-4xl text-white shadow-lg shadow-amber-500/25">
								⚡
							</div>
							<div>
								<h3 className="text-xl font-bold">Activate membership</h3>
								<p className="mt-2 max-w-sm text-muted-foreground">
									Even free comics require activating your membership. It&apos;s free — one click
									and you&apos;re in.
								</p>
							</div>
							<Button
								onClick={() => setMembershipModalOpen(true)}
								className="rounded-xl px-8 font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
							>
								Activate free membership
							</Button>
						</div>
					) : (
						<div className="animate-slide-up flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card p-12 text-center shadow-lg">
							<div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 text-4xl text-white shadow-lg shadow-purple-500/25">
								👑
							</div>
							<div>
								<h3 className="text-xl font-bold">Premium content</h3>
								<p className="mt-2 max-w-sm text-muted-foreground">
									This comic requires a premium membership to read.
								</p>
							</div>
						</div>
					)}
				</div>
			</main>

			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
