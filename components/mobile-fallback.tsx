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
							translateY: [24, 0],
							scale: [0.97, 1],
							duration: 600,
							easing: "easeOutCubic",
						});
					}
				});
			},
			{ threshold: 0.1, rootMargin: "0px 0px -20px 0px" },
		);

		cards.forEach((card) => {
			card.style.opacity = "0";
			observer.observe(card);
		});

		return () => observer.disconnect();
	}, []);

	const handleHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		animate(e.currentTarget, {
			scale: 1.01,
			translateY: -2,
			duration: 250,
			easing: "easeOutQuad",
		});
	}, []);

	const handleLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		animate(e.currentTarget, {
			scale: 1,
			translateY: 0,
			duration: 250,
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
		<div ref={containerRef} className="px-4 pb-8">
			<div className="flex flex-col gap-5">
				{comics.map((comic, index) => (
					<div
						key={comic.id}
						data-card
						role="button"
						tabIndex={0}
						onClick={() => onComicClick(comic.id)}
						onKeyDown={(e) => handleKeyDown(e, comic.id)}
						onMouseEnter={handleHover}
						onMouseLeave={handleLeave}
						className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
						style={{ animationDelay: `${index * 50}ms` }}
					>
						{/* Cover image */}
						<div className="relative aspect-[3/2] w-full overflow-hidden">
							<Image
								src={comic.cover}
								alt={comic.title}
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								className="object-cover transition-transform duration-500 group-hover:scale-105"
							/>
							{/* Gradient overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

							{/* Access badge */}
							<div className="absolute top-3 left-3">
								<span className="inline-flex items-center rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
									{comic.accessLevel === "free" ? "Free" : "Premium"}
								</span>
							</div>

							{/* Bottom info on image */}
							<div className="absolute bottom-0 left-0 right-0 p-4">
								<h3 className="text-lg font-bold text-white drop-shadow-lg leading-tight">
									{comic.title}
								</h3>
								<p className="mt-1 text-sm text-white/80">{comic.author}</p>
							</div>
						</div>

						{/* Bottom bar */}
						<div className="flex items-center justify-between bg-card px-4 py-3">
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<svg
										className="h-3.5 w-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
									{comic.episodeCount} {comic.episodeCount === 1 ? "episode" : "episodes"}
								</span>
							</div>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
									aria-hidden="true"
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
