"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import type * as THREE from "three";
import type { Poster } from "@/lib/posters";

const CARD_W = 220;
const CARD_H = 330;
const RADIUS = 5;
const ARC = Math.PI * 0.35;
const COUNT = 5;
const CYCLE = COUNT * ARC;

function encodeImageSrc(src: string): string {
	if (src.startsWith("http")) return src;
	const parts = src.split("/");
	parts[parts.length - 1] = encodeURIComponent(parts[parts.length - 1]);
	return parts.join("/");
}

function Carousel({ posters }: { posters: Poster[] }) {
	const groupRef = useRef<THREE.Group>(null);
	const cardEls = useRef<(HTMLDivElement | null)[]>([]);
	const angle = useRef(0);
	const target = useRef(0);
	const lastInput = useRef(0);
	const touchX = useRef(0);

	useEffect(() => {
		const el = document.querySelector("[data-carousel]") as HTMLElement | null;
		if (!el) return;

		const onWheel = (e: WheelEvent) => {
			const now = performance.now();
			if (now - lastInput.current < 50) return;
			const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
			if (Math.abs(delta) < 8) return;
			e.preventDefault();
			lastInput.current = now;
			target.current += (delta > 0 ? 1 : -1) * ARC;
		};

		const onTouchStart = (e: TouchEvent) => {
			touchX.current = e.touches[0].clientX;
		};

		const onTouchEnd = (e: TouchEvent) => {
			const dx = e.changedTouches[0].clientX - touchX.current;
			if (Math.abs(dx) > 40) {
				target.current += (dx < 0 ? 1 : -1) * ARC;
			}
		};

		el.addEventListener("wheel", onWheel, { passive: false });
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchend", onTouchEnd);
		};
	}, []);

	useFrame(() => {
		if (!groupRef.current) return;

		angle.current += (target.current - angle.current) * 0.08;
		groupRef.current.rotation.y = -angle.current;

		for (let i = 0; i < cardEls.current.length; i++) {
			const el = cardEls.current[i];
			if (!el) continue;

			const worldAngle = i * ARC - angle.current;
			const normalized = ((worldAngle % CYCLE) + CYCLE * 1.5) % CYCLE - CYCLE / 2;
			const normDist = Math.min(Math.abs(normalized) / (CYCLE / 2), 1);
			const isCenter = normDist < 0.15;

			el.style.transform = `scale(${1 - normDist * 0.28})`;
			el.style.opacity = String(1 - normDist * 0.5);
			el.style.filter = normDist > 0.3 ? `blur(${normDist * 4}px)` : "none";
			el.style.cursor = isCenter ? "pointer" : "default";
			el.style.boxShadow = isCenter
				? "0 8px 40px rgba(0,0,0,0.55)"
				: "0 4px 16px rgba(0,0,0,0.3)";
			el.style.border = isCenter
				? "2px solid rgba(168,85,247,0.5)"
				: "1px solid rgba(255,255,255,0.08)";

			const badge = el.querySelector("[data-badge]") as HTMLElement | null;
			if (badge) badge.style.display = isCenter ? "block" : "none";
		}
	});

	const handleCardClick = useCallback((posterId: string, cardIdx: number) => {
		const worldAngle = cardIdx * ARC - angle.current;
		const normalized = ((worldAngle % CYCLE) + CYCLE * 1.5) % CYCLE - CYCLE / 2;
		const normDist = Math.abs(normalized) / (CYCLE / 2);

		if (normDist < 0.15) {
			window.location.href = `/comic/${posterId}`;
		} else {
			const currentCycle = Math.round(angle.current / CYCLE);
			let newTarget = cardIdx * ARC + currentCycle * CYCLE;
			if (newTarget - angle.current > CYCLE / 2) newTarget -= CYCLE;
			if (angle.current - newTarget > CYCLE / 2) newTarget += CYCLE;
			target.current = newTarget;
		}
	}, []);

	const prev = useCallback(() => {
		target.current -= ARC;
	}, []);

	const next = useCallback(() => {
		target.current += ARC;
	}, []);

	return (
		<>
			<ambientLight intensity={1.4} />
			<directionalLight position={[5, 8, 5]} intensity={0.9} />
			<directionalLight position={[-5, 5, -5]} intensity={0.3} />

			<group ref={groupRef}>
				{posters.map((poster, i) => {
					const a = i * ARC;
					const x = Math.sin(a) * RADIUS;
					const z = Math.cos(a) * RADIUS;

					return (
						<group
							key={poster.id}
							position={[x, 0, z]}
							rotation={[0, -a, 0]}
						>
							<Html
								transform
								distanceFactor={7}
								style={{ pointerEvents: "auto" }}
							>
								<div
									ref={(el) => {
										cardEls.current[i] = el;
									}}
									style={{
										width: CARD_W,
										height: CARD_H,
										borderRadius: 14,
										overflow: "hidden",
										position: "relative",
									}}
									onClick={() => handleCardClick(poster.id, i)}
									onKeyDown={(e: React.KeyboardEvent) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleCardClick(poster.id, i);
										}
									}}
									role="button"
									tabIndex={0}
								>
									<img
										src={encodeImageSrc(poster.image)}
										alt={poster.title}
										draggable={false}
										style={{
											width: "100%",
											height: "100%",
											objectFit: "cover",
											display: "block",
											userSelect: "none",
										}}
									/>
									<div
										style={{
											position: "absolute",
											bottom: 0,
											left: 0,
											right: 0,
											padding: "16px 14px 14px",
											background:
												"linear-gradient(transparent, rgba(0,0,0,0.85))",
										}}
									>
										<div
											style={{
												color: "#fff",
												fontSize: 15,
												fontWeight: 700,
												lineHeight: 1.25,
												textShadow:
													"0 1px 6px rgba(0,0,0,0.7)",
											}}
										>
											{poster.title}
										</div>
									</div>
									<div
										data-badge
										style={{
											position: "absolute",
											top: 10,
											right: 10,
											background: "rgba(168,85,247,0.85)",
											color: "#fff",
											fontSize: 10,
											fontWeight: 700,
											padding: "3px 9px",
											borderRadius: 20,
											letterSpacing: 0.4,
											backdropFilter: "blur(6px)",
											display: "none",
										}}
									>
										FOCUS
									</div>
								</div>
							</Html>
						</group>
					);
				})}
			</group>

			<group position={[-3.8, 0, 1]}>
				<Html transform distanceFactor={7}>
					<button
						type="button"
						onClick={prev}
						aria-label="Previous poster"
						style={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							border: "1px solid rgba(255,255,255,0.15)",
							background: "rgba(0,0,0,0.5)",
							color: "#fff",
							fontSize: 18,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backdropFilter: "blur(8px)",
						}}
					>
						&#x2039;
					</button>
				</Html>
			</group>
			<group position={[3.8, 0, 1]}>
				<Html transform distanceFactor={7}>
					<button
						type="button"
						onClick={next}
						aria-label="Next poster"
						style={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							border: "1px solid rgba(255,255,255,0.15)",
							background: "rgba(0,0,0,0.5)",
							color: "#fff",
							fontSize: 18,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backdropFilter: "blur(8px)",
						}}
					>
						&#x203A;
					</button>
				</Html>
			</group>
		</>
	);
}

export function HorizontalCarousel({ posters }: { posters: Poster[] }) {
	return (
		<div
			data-carousel
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
				overflow: "hidden",
			}}
		>
			<Canvas
				camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 7] }}
				dpr={[1, 2]}
				gl={{ antialias: true, alpha: true }}
				style={{
					width: "100%",
					height: "100%",
					background: "transparent",
				}}
			>
				<Carousel posters={posters} />
			</Canvas>
		</div>
	);
}
