"use client";

import { animate } from "animejs";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Comic } from "@/types/comic";

interface MobileFallbackProps {
	comics: Comic[];
	onComicClick: (comicId: string) => void;
}

export function MobileFallback({ comics, onComicClick }: MobileFallbackProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const cards = container.querySelectorAll<HTMLElement>("[data-card]");

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const card = entry.target as HTMLElement;
					if (entry.isIntersecting) {
						animate(card, {
							opacity: [0, 1],
							translateY: [30, 0],
							duration: 500,
							easing: "easeOutCubic",
						});
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -30px 0px" },
		);

		cards.forEach((card) => {
			card.style.opacity = "0";
			observer.observe(card);
		});

		return () => observer.disconnect();
	}, []);

	const handleHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const card = e.currentTarget;
		animate(card, {
			scale: 1.02,
			duration: 200,
			easing: "easeOutQuad",
		});
	}, []);

	const handleLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const card = e.currentTarget;
		animate(card, {
			scale: 1,
			duration: 200,
			easing: "easeOutQuad",
		});
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, comicId: string) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onComicClick(comicId);
			}
		},
		[onComicClick],
	);

	return (
		<div ref={containerRef} className="px-4 py-6">
			<div className="mb-6 px-2">
				<h2 className="text-2xl font-bold tracking-tight">Comics</h2>
				<p className="mt-1 text-sm text-muted-foreground">Discover your next favorite story</p>
			</div>
			<div className="flex flex-col gap-4">
				{comics.map((comic) => (
					<div
						key={comic.id}
						data-card
						role="button"
						tabIndex={0}
						onClick={() => onComicClick(comic.id)}
						onKeyDown={(e) => handleKeyDown(e, comic.id)}
						onMouseEnter={handleHover}
						onMouseLeave={handleLeave}
						className="group flex cursor-pointer gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
					>
						<div className="relative flex w-28 shrink-0 items-center justify-center overflow-hidden bg-muted p-2">
							<Image
								src={comic.cover}
								alt={comic.title}
								width={112}
								height={150}
								className="h-full w-full rounded-lg object-cover transition-transform group-hover:scale-105"
							/>
							<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-black/5" />
						</div>
						<div className="flex flex-1 flex-col justify-center gap-2 py-4 pr-4">
							<div className="flex items-center gap-2">
								<span className="inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-medium text-primary">
									{comic.accessLevel === "free" ? "Free" : "Premium"}
								</span>
							</div>
							<h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
								{comic.title}
							</h3>
							<p className="text-sm text-muted-foreground">{comic.author}</p>
							<p className="text-xs text-muted-foreground">
								{comic.episodeCount} {comic.episodeCount === 1 ? "episode" : "episodes"}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
