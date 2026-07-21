"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useMemo } from "react";
import { CameraRig } from "@/components/camera-rig";
import { PosterCard3D } from "@/components/poster-card-3d";
import { createCurve, distributeCardsAlongCurve } from "@/lib/curve";
import type { Comic } from "@/types/comic";

interface WorldCanvasProps {
	comics: Comic[];
	onComicClick: (comicId: string) => void;
}

function Scene({ comics, onComicClick }: WorldCanvasProps) {
	const curve = useMemo(() => createCurve(), []);
	const cards = useMemo(
		() => distributeCardsAlongCurve(curve, comics.length),
		[curve, comics.length],
	);

	return (
		<>
			<CameraRig />
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} intensity={0.8} />

			{comics.map((comic, i) => {
				const card = cards[i];
				if (!card) return null;
				return (
					<PosterCard3D
						key={comic.id}
						comic={comic}
						position={card.position}
						tangent={card.tangent}
						cardT={card.t}
						onClick={onComicClick}
					/>
				);
			})}
		</>
	);
}

export function WorldCanvas({ comics, onComicClick }: WorldCanvasProps) {
	const handleComicClick = useCallback(
		(comicId: string) => {
			onComicClick(comicId);
		},
		[onComicClick],
	);

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
			}}
		>
			<Canvas
				camera={{
					fov: 50,
					near: 0.1,
					far: 100,
					position: [0, 0, 10],
				}}
				dpr={[1, 1.5]}
				gl={{
					antialias: true,
					alpha: true,
				}}
				style={{
					background: "transparent",
				}}
			>
				<Suspense fallback={null}>
					<Scene comics={comics} onComicClick={handleComicClick} />
				</Suspense>
			</Canvas>
		</div>
	);
}
