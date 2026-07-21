"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Comic } from "@/types/comic";
import { getPosterUrl } from "@/lib/get-poster";

const ARC_SPREAD = 28;

export function HorizontalCarousel({ comics, fixed = true }: { comics: Comic[]; fixed?: boolean }) {
	const [active, setActive] = useState(0);
	const touchX = useRef(0);
	const scrollAccum = useRef(0);
	const rafId = useRef(0);
	const count = comics.length;

	useEffect(() => {
		if (!fixed) return;
		const el = document.querySelector("[data-carousel]") as HTMLElement | null;
		if (!el) return;

		// track whether pointer is over the carousel; only then consume wheel events
		let hovered = false;
		const onPointerEnter = () => (hovered = true);
		const onPointerLeave = () => (hovered = false);

		const tick = () => {
			if (scrollAccum.current > 1) {
				scrollAccum.current = 0;
				setActive((p) => (p + 1) % count);
			} else if (scrollAccum.current < -1) {
				scrollAccum.current = 0;
				setActive((p) => (p - 1 + count) % count);
			}
			rafId.current = requestAnimationFrame(tick);
		};
		rafId.current = requestAnimationFrame(tick);

		// global wheel listener but only reacts when pointer is over the carousel
		const onWheelGlobal = (e: WheelEvent) => {
			if (!hovered) return;
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (Math.abs(delta) < 5) return;
			e.preventDefault();
			scrollAccum.current += delta * 0.015;
			scrollAccum.current = Math.max(-3, Math.min(3, scrollAccum.current));
		};

		const onTouchStart = (e: TouchEvent) => {
			touchX.current = e.touches[0].clientX;
		};

		const onTouchEnd = (e: TouchEvent) => {
			const dx = e.changedTouches[0].clientX - touchX.current;
			if (Math.abs(dx) > 50) {
				setActive((p) => (dx < 0 ? (p + 1) % count : (p - 1 + count) % count));
			}
		};

		window.addEventListener("wheel", onWheelGlobal, { passive: false });
		el.addEventListener("mouseenter", onPointerEnter);
		el.addEventListener("mouseleave", onPointerLeave);
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchend", onTouchEnd, { passive: true });

		return () => {
			cancelAnimationFrame(rafId.current);
			window.removeEventListener("wheel", onWheelGlobal);
			el.removeEventListener("mouseenter", onPointerEnter);
			el.removeEventListener("mouseleave", onPointerLeave);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchend", onTouchEnd);
		};
	}, [count, fixed]);

	const prev = useCallback(() => setActive((p) => (p - 1 + count) % count), [count]);
	const next = useCallback(() => setActive((p) => (p + 1) % count), [count]);

	if (count === 0) return null;

	if (!fixed) {
		// simpler inline horizontal scroller for use in sections
		return (
			<div className="-mx-4 overflow-x-auto px-4 py-2 sm:px-0">
				<div className="flex gap-3">
					{comics.map((comic) => (
						<a
							key={comic.id}
							href={`/comic/${comic.id}`}
							className="relative shrink-0 w-[140px] sm:w-[180px] md:w-[220px] rounded-xl overflow-hidden border border-border/50 bg-card"
						>
							<div className="relative aspect-[2/3]">
							<Image src={getPosterUrl(comic)} alt={comic.title} fill className="object-cover" />
							</div>
							<div className="p-2">
							<p className="truncate text-sm font-semibold">{comic.title}</p>
							<p className="text-xs text-muted-foreground">{comic.author}</p>
							</div>
						</a>
					))}
				</div>
			</div>
		);
	}

	return (
		<div
			data-carousel
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 10,
				overflow: "hidden",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				perspective: 1200,
			}}
		>
			{comics.map((comic, i) => {
				const offset = ((i - active + count + count / 2) % count) - count / 2;
				const absOffset = Math.abs(offset);
				const translateX = offset * ARC_SPREAD;
				const translateZ = -absOffset * 80;
				const rotateY = offset < 0 ? 25 : offset > 0 ? -25 : 0;
				const scale = 1 - absOffset * 0.12;
				const opacity = 1 - absOffset * 0.25;
				const blur = absOffset > 1 ? absOffset * 1.5 : 0;
				const zIndex = count - absOffset;
				const isCenter = offset === 0;
				const imgSrc = getPosterUrl(comic);

				return (
					<button
						key={comic.id}
						type="button"
						onClick={() => {
							if (isCenter) {
							window.location.href = `/comic/${comic.id}`;
							} else {
							setActive(i);
							}
						}}
						aria-label={comic.title}
						style={{
							position: "absolute",
							width: "min(260px, 38vw)",
							aspectRatio: "2/3",
							borderRadius: 16,
							overflow: "hidden",
							cursor: isCenter ? "pointer" : "default",
							transform: `translateX(${translateX}vw) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
							opacity,
							filter: blur > 0 ? `blur(${blur}px)` : "none",
							zIndex,
							boxShadow: isCenter ? "0 12px 50px rgba(0,0,0,0.6)" : "0 6px 20px rgba(0,0,0,0.3)",
							border: isCenter
							? "2px solid rgba(168,85,247,0.6)"
							: "1px solid rgba(255,255,255,0.08)",
							transition:
							"transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, filter 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease",
							padding: 0,
							background: "none",
							outline: "none",
						}}
					>
						<Image
							src={imgSrc}
							alt={comic.title}
							fill
							sizes="min(260px, 38vw)"
							draggable={false}
							priority={absOffset < 2}
							style={{ objectFit: "cover", userSelect: "none" }}
						/>
						<div
							style={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							padding: "20px 16px 16px",
							background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
							}}
						>
							<div
							style={{
								color: "#fff",
								fontSize: 16,
								fontWeight: 700,
								lineHeight: 1.25,
								textShadow: "0 1px 8px rgba(0,0,0,0.7)",
							}}
							>
							{comic.title}
							</div>
						</div>
						{isCenter && (
							<div
							style={{
								position: "absolute",
								top: 12,
								right: 12,
								background: "rgba(168,85,247,0.9)",
								color: "#fff",
								fontSize: 10,
								fontWeight: 700,
								padding: "3px 10px",
								borderRadius: 20,
								letterSpacing: 0.5,
								backdropFilter: "blur(6px)",
							}}
							>
							FOCUS
							</div>
						)}
					</button>
				);
			})}

			<button
				type="button"
				onClick={prev}
				aria-label="Previous"
				style={{
					position: "absolute",
					left: "max(16px, 3vw)",
					top: "50%",
					transform: "translateY(-50%)",
					width: 44,
					height: 44,
					borderRadius: "50%",
					border: "1px solid rgba(255,255,255,0.15)",
					background: "rgba(0,0,0,0.45)",
					color: "#fff",
					fontSize: 20,
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backdropFilter: "blur(8px)",
					zIndex: 100,
					transition: "background 0.2s",
				}}
			>
				&#x2039;
			</button>
			<button
				type="button"
				onClick={next}
				aria-label="Next"
				style={{
					position: "absolute",
					right: "max(16px, 3vw)",
					top: "50%",
					transform: "translateY(-50%)",
					width: 44,
					height: 44,
					borderRadius: "50%",
					border: "1px solid rgba(255,255,255,0.15)",
					background: "rgba(0,0,0,0.45)",
					color: "#fff",
					fontSize: 20,
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backdropFilter: "blur(8px)",
					zIndex: 100,
					transition: "background 0.2s",
				}}
			>
				&#x203A;
			</button>
		</div>
	);
}
