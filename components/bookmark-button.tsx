"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toggleBookmark, isBookmarked } from "@/lib/bookmarks";
import type { Comic } from "@/types/comic";

export function BookmarkButton({ comic }: { comic: Comic }) {
	const { currentUser } = useAuth();
	const [bookmarked, setBookmarked] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!currentUser) { setLoading(false); return; }
		isBookmarked(currentUser.uid, comic.id).then((v) => {
			setBookmarked(v);
			setLoading(false);
		});
	}, [currentUser, comic.id]);

	async function handleToggle() {
		if (!currentUser) return;
		const now = await toggleBookmark(currentUser.uid, comic);
		setBookmarked(now);
	}

	if (loading) return null;

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				handleToggle();
			}}
			aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
			className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
				bookmarked
					? "border-primary/50 bg-primary/10 text-primary"
					: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
			}`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill={bookmarked ? "currentColor" : "none"}
				stroke="currentColor"
				strokeWidth={2}
				className="h-4 w-4"
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
			</svg>
		</button>
	);
}
