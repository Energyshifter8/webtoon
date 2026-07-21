"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { CameraRig } from "@/components/camera-rig";
import { PosterCard3D } from "@/components/poster-card-3d";
import { createCurve, distributeCardsAlongCurve } from "@/lib/curve";
import { POSTERS } from "@/lib/posters";

function Scene() {
	const curve = useMemo(() => createCurve(), []);
	const cards = useMemo(
		() => distributeCardsAlongCurve(curve, POSTERS.length),
		[curve],
	);

	const handleClick = (posterId: string) => {
		window.location.href = `/comic/${posterId}`;
	};

	return (
		<>
			<CameraRig />
			<ambientLight intensity={1.2} />
			<directionalLight position={[5, 5, 5]} intensity={0.8} />
			<directionalLight position={[-5, 3, -5]} intensity={0.4} />

			{POSTERS.map((poster, i) => {
				const card = cards[i];
				if (!card) return null;
				return (
					<PosterCard3D
						key={poster.id}
						poster={poster}
						position={card.position}
						tangent={card.tangent}
						onClick={handleClick}
					/>
				);
			})}
		</>
	);
}

export function WorldCanvas() {
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
				overflow: "hidden",
			}}
		>
			<Canvas
				camera={{
					fov: 50,
					near: 0.1,
					far: 100,
					position: [0, 0, 8],
				}}
				dpr={[1, 2]}
				gl={{
					antialias: true,
					alpha: true,
				}}
				style={{
					width: "100%",
					height: "100%",
					background: "transparent",
				}}
			>
				<Suspense fallback={null}>
					<Scene />
				</Suspense>
			</Canvas>
		</div>
	);
}
