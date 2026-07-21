"use client";

import { animate } from "animejs";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Poster } from "@/lib/posters";

interface MobileFallbackProps {
	posters: Poster[];
	onPosterClick: (posterId: string) => void;
}

export function MobileFallback({ posters, onPosterClick }: MobileFallbackProps) {
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
		(e: React.KeyboardEvent, posterId: string) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onPosterClick(posterId);
			}
		},
		[onPosterClick],
	);

	return (
		<div ref={containerRef}>
			<div className="flex flex-col">
				{posters.map((poster, index) => (
					<div
						key={poster.id}
						data-card
						role="button"
						tabIndex={0}
						onClick={() => onPosterClick(poster.id)}
						onKeyDown={(e) => handleKeyDown(e, poster.id)}
						onMouseEnter={handleHover}
						onMouseLeave={handleLeave}
						className="group relative w-full cursor-pointer"
						style={{ animationDelay: `${index * 50}ms` }}
					>
						<div className="relative aspect-[9/16] w-full overflow-hidden">
							<Image
								src={poster.image}
								alt={poster.title}
								fill
								sizes="100vw"
								className="object-cover transition-transform duration-500 group-hover:scale-105"
								priority={index < 2}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
							<div className="absolute bottom-0 left-0 right-0 p-5 pb-8">
								<h3 className="text-xl font-bold text-white drop-shadow-lg leading-tight">
									{poster.title}
								</h3>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
