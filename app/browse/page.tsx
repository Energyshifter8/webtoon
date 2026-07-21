"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getComicsPage } from "@/lib/comics";
import { ALL_GENRES } from "@/types/comic";
import type { Comic } from "@/types/comic";
import { getPosterUrl } from "@/lib/get-poster";
import type { DocumentSnapshot } from "firebase/firestore";

function BrowseContent() {
	const searchParams = useSearchParams();
	const initialGenres = searchParams.get("genres")?.split(",").filter(Boolean) || [];

	const [comics, setComics] = useState<Comic[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
	const [sort, setSort] = useState<"newest" | "rating" | "views">("newest");
	const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [genresOpen, setGenresOpen] = useState(true);

	const loadComics = useCallback(
		async (reset = false) => {
			setLoading(true);
			try {
				const { comics: newComics, lastDoc: newLast } = await getComicsPage(
					sort,
					selectedGenres.length > 0 ? selectedGenres : undefined,
					reset ? undefined : lastDoc ?? undefined,
				);
				setComics((prev) => (reset ? newComics : [...prev, ...newComics]));
				setLastDoc(newLast);
				setHasMore(newComics.length >= 12);
			} finally {
				setLoading(false);
			}
		},
		[sort, selectedGenres, lastDoc],
	);

	useEffect(() => {
		loadComics(true);
	}, [sort, selectedGenres]);

	function toggleGenre(genre: string) {
		setSelectedGenres((prev) =>
			prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
			<h1 className="mb-6 text-3xl font-bold">Browse Comics</h1>
			<div className="flex flex-col gap-6 lg:flex-row">
				<aside className="w-full shrink-0 lg:w-64">
					<div className="sticky top-20 space-y-6">
						<div>
							<button
								type="button"
								onClick={() => setGenresOpen(!genresOpen)}
								className="mb-3 flex w-full items-center justify-between text-sm font-semibold"
							>
								Genres
								<span className="text-muted-foreground">{genresOpen ? "▾" : "▸"}</span>
							</button>
							{genresOpen && (
								<div className="space-y-1">
									{ALL_GENRES.map((genre) => (
										<button
											key={genre}
											type="button"
											onClick={() => toggleGenre(genre)}
											className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
												selectedGenres.includes(genre)
													? "bg-primary/10 text-primary font-medium"
													: "text-muted-foreground hover:bg-muted hover:text-foreground"
											}`}
										>
											<span
												className={`h-3.5 w-3.5 rounded border ${
													selectedGenres.includes(genre)
														? "border-primary bg-primary"
														: "border-border"
												}`}
											/>
											{genre}
										</button>
									))}
								</div>
							)}
						</div>
						<div>
							<p className="mb-3 text-sm font-semibold">Sort by</p>
							<div className="space-y-1">
								{[
									{ key: "newest" as const, label: "Newest" },
									{ key: "rating" as const, label: "Top Rated" },
									{ key: "views" as const, label: "Most Viewed" },
								].map((opt) => (
									<button
										key={opt.key}
										type="button"
										onClick={() => setSort(opt.key)}
										className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
											sort === opt.key
												? "bg-primary/10 text-primary font-medium"
												: "text-muted-foreground hover:bg-muted hover:text-foreground"
										}`}
									>
										<span
											className={`h-3.5 w-3.5 rounded-full border ${
												sort === opt.key ? "border-primary bg-primary" : "border-border"
											}`}
										/>
										{opt.label}
									</button>
								))}
							</div>
						</div>
						{selectedGenres.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedGenres([])}
								className="w-full text-xs"
							>
								Clear filters
							</Button>
						)}
					</div>
				</aside>
				<div className="flex-1">
					{comics.length === 0 && !loading ? (
						<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card py-16 text-center">
							<div className="text-4xl">📚</div>
							<p className="text-muted-foreground">No comics found matching your filters.</p>
							<Button variant="ghost" size="sm" onClick={() => { setSelectedGenres([]); setSort("newest"); }}>
								Reset filters
							</Button>
						</div>
					) : (
						<>
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
								{comics.map((comic) => (
									<Link
										key={comic.id}
										href={`/comic/${comic.id}`}
										className="group overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
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
											<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
												<span>⭐ {comic.rating?.toFixed(1) || "N/A"}</span>
												<span>•</span>
												<span>{comic.author}</span>
											</div>
										</div>
									</Link>
								))}
							</div>
							{hasMore && (
								<div className="mt-8 flex justify-center">
									<Button
										variant="outline"
										onClick={() => loadComics(false)}
										disabled={loading}
										className="rounded-xl px-8"
									>
										{loading ? "Loading..." : "Load more"}
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default function BrowsePage() {
	return (
		<Suspense fallback={<div className="flex flex-1 items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
			<BrowseContent />
		</Suspense>
	);
}
