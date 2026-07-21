"use client";

import { Html } from "@react-three/drei";
import type * as THREE from "three";
import type { Poster } from "@/lib/posters";

interface PosterCard3DProps {
	poster: Poster;
	position: THREE.Vector3;
	tangent: THREE.Vector3;
	onClick: (posterId: string) => void;
}

export function PosterCard3D({ poster, position, tangent, onClick }: PosterCard3DProps) {
	const angle = Math.atan2(tangent.x, tangent.z);

	const handleClick = () => {
		onClick(poster.id);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick(poster.id);
		}
	};

	return (
		<group position={position} rotation={[0, angle, 0]}>
			<Html
				transform
				distanceFactor={8}
				style={{
					pointerEvents: "auto",
					width: "220px",
				}}
			>
				<div
					role="button"
					tabIndex={0}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					style={{
						cursor: "pointer",
						background: "var(--card)",
						color: "var(--card-foreground)",
						borderRadius: "12px",
						overflow: "hidden",
						boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
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
						}}
					>
						<img
							src={poster.image}
							alt={poster.title}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					</div>
					<div style={{ padding: "12px 16px" }}>
						<h3
							style={{
								fontWeight: 600,
								fontSize: "14px",
								lineHeight: "1.3",
								margin: 0,
							}}
						>
							{poster.title}
						</h3>
					</div>
				</div>
			</Html>
		</group>
	);
}
