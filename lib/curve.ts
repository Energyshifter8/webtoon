import * as THREE from "three";

export function createCurve(): THREE.CatmullRomCurve3 {
	return new THREE.CatmullRomCurve3(
		[
			new THREE.Vector3(0, 0, 10),
			new THREE.Vector3(4, 1, 6),
			new THREE.Vector3(-3, -1, 2),
			new THREE.Vector3(5, 0.5, -2),
			new THREE.Vector3(-2, 1, -6),
			new THREE.Vector3(3, -0.5, -10),
			new THREE.Vector3(0, 0, -14),
		],
		false,
		"catmullrom",
		0.5,
	);
}

export function distributeCardsAlongCurve(
	curve: THREE.CatmullRomCurve3,
	count: number,
): { position: THREE.Vector3; tangent: THREE.Vector3; t: number }[] {
	const cards: { position: THREE.Vector3; tangent: THREE.Vector3; t: number }[] = [];
	const spacing = 1 / (count + 1);

	for (let i = 0; i < count; i++) {
		const t = spacing * (i + 1);
		const position = curve.getPointAt(t);
		const tangent = curve.getTangentAt(t);
		cards.push({ position, tangent, t });
	}

	return cards;
}
