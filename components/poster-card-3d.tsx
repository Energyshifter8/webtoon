"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animate } from "animejs";
import { useCallback, useMemo, useRef } from "react";
import type * as THREE from "three";
import { computeFalloffFromT, DEFAULT_FALLOFF_PARAMS } from "@/lib/falloff";
import { useScrollStore } from "@/store/scroll";
import type { Comic } from "@/types/comic";

interface PosterCard3DProps {
	comic: Comic;
	position: THREE.Vector3;
	tangent: THREE.Vector3;
	cardT: number;
	onClick: (comicId: string) => void;
}

export function PosterCard3D({ comic, position, tangent, cardT, onClick }: PosterCard3DProps) {
	const groupRef = useRef<THREE.Group>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const progress = useScrollStore((s) => s.progress);
	const emphasisRef = useRef(0);

	const angle = useMemo(() => {
		return Math.atan2(tangent.x, tangent.z);
	}, [tangent]);

	useFrame(() => {
		if (!groupRef.current) return;

		const { emphasis } = computeFalloffFromT(progress, cardT, DEFAULT_FALLOFF_PARAMS);

		emphasisRef.current += (emphasis - emphasisRef.current) * 0.1;

		const card = cardRef.current;
		if (card) {
			const blur = (1 - emphasisRef.current) * 4;
			card.style.filter = `blur(${blur}px)`;
			card.style.opacity = `${0.3 + emphasisRef.current * 0.7}`;
		}
	});

	const handleMouseEnter = useCallback(() => {
		if (cardRef.current) {
			animate(cardRef.current, {
				scale: 1.05,
				duration: 200,
				easing: "easeOutQuad",
			});
			cardRef.current.style.boxShadow = "0 0 20px rgba(128, 90, 213, 0.5)";
		}
	}, []);

	const handleMouseLeave = useCallback(() => {
		if (cardRef.current) {
			animate(cardRef.current, {
				scale: 1,
				duration: 200,
				easing: "easeOutQuad",
			});
			cardRef.current.style.boxShadow = "none";
		}
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onClick(comic.id);
			}
		},
		[comic.id, onClick],
	);

	const handleClick = useCallback(() => {
		onClick(comic.id);
	}, [comic.id, onClick]);

	return (
		<group ref={groupRef} position={position} rotation={[0, angle, 0]}>
			<Html
				transform
				distanceFactor={8}
				style={{
					pointerEvents: "auto",
					width: "220px",
				}}
			>
				<div
					ref={cardRef}
					role="button"
					tabIndex={0}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					style={{
						cursor: "pointer",
						background: "var(--card)",
						color: "var(--card-foreground)",
						borderRadius: "12px",
						overflow: "hidden",
						boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
						transition: "box-shadow 0.2s",
						userSelect: "none",
					}}
				>
					<div
						style={{
							aspectRatio: "3/4",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "var(--muted)",
							padding: "24px",
						}}
					>
						<img
							src={comic.cover}
							alt={comic.title}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "contain",
								opacity: 0.8,
							}}
						/>
					</div>
					<div style={{ padding: "16px" }}>
						<h3
							style={{
								fontWeight: 600,
								fontSize: "14px",
								lineHeight: "1.3",
								margin: 0,
							}}
						>
							{comic.title}
						</h3>
						<p
							style={{
								fontSize: "12px",
								color: "var(--muted-foreground)",
								margin: "4px 0 0",
							}}
						>
							{comic.author}
						</p>
					</div>
				</div>
			</Html>
		</group>
	);
}
