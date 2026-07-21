"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getBookmarks } from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";
import { getPosterUrl } from "@/lib/get-poster";
import type { Comic } from "@/types/comic";

export default function BookmarksPage() {
	const { currentUser, loading: authLoading } = useAuth();
	const [bookmarks, setBookmarks] = useState<Comic[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (authLoading) return;
		if (!currentUser) {
			setLoading(false);
			return;
		}
		getBookmarks(currentUser.uid).then((b) => {
			setBookmarks(b);
			setLoading(false);
		});
	}, [currentUser, authLoading]);

	if (authLoading || loading) {
		return (
			<div className="flex flex-1 items-center justify-center py-20">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!currentUser) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
				<div className="text-5xl">🔐</div>
				<div className="text-center">
					<h2 className="text-xl font-bold">Log in to view bookmarks</h2>
					<p className="mt-2 text-sm text-muted-foreground">Save your favorite comics for easy access.</p>
				</div>
				<Link href="/login">
					<Button className="rounded-xl px-6">Log in</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
			<h1 className="mb-6 text-3xl font-bold">Bookmarks</h1>
			{bookmarks.length === 0 ? (
				<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card py-16 text-center">
					<div className="text-5xl">📑</div>
					<p className="text-muted-foreground">No bookmarks yet.</p>
					<Link href="/browse">
						<Button variant="outline" className="rounded-xl">Browse comics</Button>
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{bookmarks.map((comic) => (
						<Link
							key={comic.id}
							href={`/comic/${comic.id}`}
							className="group overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg"
						>
							<div className="relative aspect-[3/4] overflow-hidden">
								<Image
									src={getPosterUrl(comic)}
									alt={comic.title}
									fill
									className="object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							</div>
							<div className="p-3">
								<p className="truncate text-sm font-semibold">{comic.title}</p>
								<p className="text-xs text-muted-foreground">{comic.author}</p>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
