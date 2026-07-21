import * as THREE from "three";

export interface FalloffParams {
	radius: number;
	falloff: number;
	minScale: number;
	maxScale: number;
}

export const DEFAULT_FALLOFF_PARAMS: FalloffParams = {
	radius: 5,
	falloff: 2.5,
	minScale: 0.4,
	maxScale: 1.2,
};

function smoothstep(edge0: number, edge1: number, x: number): number {
	const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

export function computeFalloff(
	cameraPos: THREE.Vector3,
	cardPos: THREE.Vector3,
	params: FalloffParams = DEFAULT_FALLOFF_PARAMS,
): { scale: number; blur: number; emphasis: number } {
	const dist = cameraPos.distanceTo(cardPos);
	const normalized = smoothstep(0, params.radius, dist);
	const emphasis = 1 - normalized;

	const scale = THREE.MathUtils.lerp(params.maxScale, params.minScale, normalized);
	const blur = smoothstep(0, params.falloff, dist) * 8;

	return { scale, blur, emphasis };
}

export function computeFalloffFromT(
	cameraT: number,
	cardT: number,
	params: FalloffParams = DEFAULT_FALLOFF_PARAMS,
): { scale: number; blur: number; emphasis: number } {
	const dist = Math.abs(cameraT - cardT);
	const normalized = smoothstep(0, params.radius / 20, dist);
	const emphasis = 1 - normalized;

	const scale = THREE.MathUtils.lerp(params.maxScale, params.minScale, normalized);
	const blur = smoothstep(0, params.falloff / 10, dist) * 8;

	return { scale, blur, emphasis };
}
