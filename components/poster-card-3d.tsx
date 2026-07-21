"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Poster } from "@/lib/posters";

interface PosterCard3DProps {
	poster: Poster;
	position: THREE.Vector3;
	tangent: THREE.Vector3;
	onClick: (posterId: string) => void;
}

const CARD_WIDTH = 2.2;
const CARD_HEIGHT = 3.0;

function encodeImageSrc(src: string): string {
	if (src.startsWith("http")) return src;
	const parts = src.split("/");
	parts[parts.length - 1] = encodeURIComponent(parts[parts.length - 1]);
	return parts.join("/");
}

const loader = new THREE.TextureLoader();

export function PosterCard3D({ poster, position, tangent, onClick }: PosterCard3DProps) {
	const [texture, setTexture] = useState<THREE.Texture | null>(null);
	const angle = useMemo(() => Math.atan2(tangent.x, tangent.z), [tangent]);

	useEffect(() => {
		const src = encodeImageSrc(poster.image);
		loader.load(
			src,
			(tex) => {
				tex.colorSpace = THREE.SRGBColorSpace;
				setTexture(tex);
			},
			undefined,
			() => {
				setTexture(null);
			},
		);
	}, [poster.image]);

	const handleClick = useCallback(() => {
		onClick(poster.id);
	}, [poster.id, onClick]);

	return (
		<group position={position} rotation={[0, angle, 0]}>
			{/* Card background */}
			<mesh onClick={handleClick}>
				<planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
				<meshStandardMaterial color="#1a1a2e" />
			</mesh>

			{/* Poster image */}
			<mesh position={[0, 0.15, 0.01]} onClick={handleClick}>
				<planeGeometry args={[CARD_WIDTH - 0.2, CARD_HEIGHT - 0.6]} />
				{texture ? (
					<meshStandardMaterial map={texture} toneMapped={false} />
				) : (
					<meshStandardMaterial color="#2a2a4a" />
				)}
			</mesh>
		</group>
	);
}
