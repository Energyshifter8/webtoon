"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { HorizontalCarousel } from "@/components/horizontal-carousel";
import { MembershipModal } from "@/components/membership-modal";
import { MobileFallback } from "@/components/mobile-fallback";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { POSTERS } from "@/lib/posters";
import { getTrendingComics, getPopularComics, getFeaturedComic } from "@/lib/comics";
import { getAnnouncements, type Announcement } from "@/lib/announcements";
import type { Comic } from "@/types/comic";

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

function TrendingSection({ comics }: { comics: Comic[] }) {
	if (comics.length === 0) return null;
	return (
		<section className="py-8">
			<div className="mb-4 flex items-center justify-between px-4 sm:px-0">
				<h2 className="text-xl font-bold">🔥 Trending</h2>
				<Link href="/browse" className="text-sm text-primary hover:underline">View all</Link>
			</div>
			<HorizontalCarousel comics={comics} />
		</section>
	);
}

function PopularSection() {
	const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
	const [comics, setComics] = useState<Comic[]>([]);

	useEffect(() => {
		getPopularComics(period, 10).then(setComics);
	}, [period]);

	const tabs = [
		{ key: "weekly" as const, label: "Weekly" },
		{ key: "monthly" as const, label: "Monthly" },
		{ key: "allTime" as const, label: "All-time" },
	];

	return (
		<section className="py-8">
			<div className="mb-4 flex items-center gap-4 px-4 sm:px-0">
				<h2 className="text-xl font-bold">📊 Popular</h2>
				<div className="flex gap-1 rounded-lg bg-muted p-1">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => setPeriod(tab.key)}
							className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
								period === tab.key
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>
			<div className="space-y-2 px-4 sm:px-0">
				{comics.map((comic, i) => (
					<Link
						key={comic.id}
						href={`/comic/${comic.id}`}
						className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
					>
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
							{i + 1}
						</div>
						<div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg">
							<Image src={comic.posterUrl || comic.cover} alt={comic.title} fill className="object-cover" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-semibold">{comic.title}</p>
							<p className="text-xs text-muted-foreground">{comic.author}</p>
						</div>
						<div className="text-right text-xs text-muted-foreground">
							{period === "weekly" && comic.viewsWeekly.toLocaleString()}
							{period === "monthly" && comic.viewsMonthly.toLocaleString()}
							{period === "allTime" && comic.viewsAllTime.toLocaleString()}
							<span className="ml-1">views</span>
						</div>
					</Link>
				))}
				{comics.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">No comics yet.</p>
				)}
			</div>
		</section>
	);
}

function EditorsPickSection({ comic }: { comic: Comic | null }) {
	if (!comic) return null;
	return (
		<section className="py-8">
			<h2 className="mb-4 text-xl font-bold px-4 sm:px-0">⭐ Editor&apos;s Pick</h2>
			<Link href={`/comic/${comic.id}`} className="group block px-4 sm:px-0">
				<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg">
					<div className="relative aspect-[3/1] overflow-hidden">
						<Image src={comic.posterUrl || comic.cover} alt={comic.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
						<div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
						<div className="absolute bottom-0 left-0 p-6 md:p-10">
							<div className="mb-2 flex items-center gap-2">
								<span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">Featured</span>
								{comic.genres?.slice(0, 2).map((g) => (
									<span key={g} className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">{g}</span>
								))}
							</div>
							<h3 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl">{comic.title}</h3>
							<p className="mt-1 text-sm text-white/80">by {comic.author}</p>
						</div>
					</div>
				</div>
			</Link>
		</section>
	);
}

function AnnouncementsSection({ items }: { items: Announcement[] }) {
	if (items.length === 0) return null;
	return (
		<section className="py-8">
			<div className="mb-4 flex items-center justify-between px-4 sm:px-0">
				<h2 className="text-xl font-bold">📢 Announcements</h2>
				<Link href="/announcements" className="text-sm text-primary hover:underline">View all</Link>
			</div>
			<div className="space-y-3 px-4 sm:px-0">
				{items.slice(0, 3).map((a) => (
					<div key={a.id} className="rounded-xl border border-border/50 bg-card p-4">
						<p className="text-xs text-muted-foreground">
							{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
						</p>
						<p className="mt-1 font-semibold">{a.title}</p>
						<p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.body}</p>
					</div>
				))}
			</div>
		</section>
	);
}

export default function Home() {
	const { currentUser, membershipStatus, loading: authLoading } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [membershipModalOpen, setMembershipModalOpen] = useState(false);
	const isMobile = useIsMobile();

	const [trending, setTrending] = useState<Comic[]>([]);
	const [featured, setFeatured] = useState<Comic | null>(null);
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);

	useEffect(() => {
		getTrendingComics(10).then(setTrending);
		getFeaturedComic().then(setFeatured);
		getAnnouncements(3).then(setAnnouncements);
	}, []);

	const handlePosterClick = useCallback(
		(posterId: string) => {
			if (authLoading) return;
			if (!currentUser) { setAuthModalOpen(true); return; }
			if (membershipStatus === "none") { setMembershipModalOpen(true); return; }
			window.location.href = `/comic/${posterId}`;
		},
		[currentUser, membershipStatus, authLoading],
	);

	return (
		<div className="relative min-h-screen bg-background">
			{!isMobile && <HorizontalCarousel comics={trending} />}
			<main className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
				{isMobile && (
					<>
						<div className="mb-6 text-center">
							<h2 className="mb-2 text-2xl font-bold tracking-tight">Discover Comics</h2>
							<p className="text-sm text-muted-foreground">Browse our collection — no account needed to explore.</p>
						</div>
						<MobileFallback posters={POSTERS} onPosterClick={handlePosterClick} />
					</>
				)}
				<TrendingSection comics={trending} />
				<PopularSection />
				<EditorsPickSection comic={featured} />
				<AnnouncementsSection items={announcements} />
			</main>
			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
