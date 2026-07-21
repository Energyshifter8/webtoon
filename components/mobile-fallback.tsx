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
							translateY: [40, 0],
							duration: 500,
							easing: "easeOutCubic",
						});
					}
				});
			},
			{ threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
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
			scale: 1.03,
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
		<div ref={containerRef} className="flex flex-col gap-4 px-4 py-6">
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
					className="flex cursor-pointer gap-4 overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
				>
					<div className="flex w-28 shrink-0 items-center justify-center bg-muted p-3">
						<Image
							src={comic.cover}
							alt={comic.title}
							width={112}
							height={150}
							className="h-full w-full object-contain"
						/>
					</div>
					<div className="flex flex-1 flex-col justify-center gap-1 py-3 pr-3">
						<h3 className="font-semibold leading-tight">{comic.title}</h3>
						<p className="text-sm text-muted-foreground">{comic.author}</p>
						<p className="text-xs text-muted-foreground">
							{comic.episodeCount} {comic.episodeCount === 1 ? "episode" : "episodes"}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
