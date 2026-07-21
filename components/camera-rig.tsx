"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { createCurve } from "@/lib/curve";
import { useScrollStore } from "@/store/scroll";

const LOOK_AHEAD = 0.02;

export function CameraRig() {
	const { camera } = useThree();
	const curve = useMemo(() => createCurve(), []);
	const progress = useScrollStore((s) => s.progress);
	const targetPos = useRef(new THREE.Vector3());
	const targetLookAt = useRef(new THREE.Vector3());

	useFrame(() => {
		const t = Math.min(1, Math.max(0, progress));
		const point = curve.getPointAt(t);

		const lookAheadT = Math.min(1, t + LOOK_AHEAD);
		const lookAtPoint = curve.getPointAt(lookAheadT);

		targetPos.current.copy(point);
		targetLookAt.current.copy(lookAtPoint);

		camera.position.lerp(targetPos.current, 0.08);

		const currentLookAt = new THREE.Vector3();
		camera.getWorldDirection(currentLookAt);
		currentLookAt.add(camera.position);
		currentLookAt.lerp(targetLookAt.current, 0.08);

		camera.lookAt(currentLookAt);
	});

	return null;
}
