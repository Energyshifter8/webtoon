"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useScrollStore } from "@/store/scroll";

export function useLenis() {
	const lenisRef = useRef<Lenis | null>(null);
	const setProgress = useScrollStore((s) => s.setProgress);

	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			touchMultiplier: 2,
		});

		lenisRef.current = lenis;

		function raf(time: number) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		const rafId = requestAnimationFrame(raf);

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const progress = docHeight > 0 ? scrollTop / docHeight : 0;
			setProgress(Math.min(1, Math.max(0, progress)));
		};

		lenis.on("scroll", handleScroll);

		return () => {
			cancelAnimationFrame(rafId);
			lenis.destroy();
			lenisRef.current = null;
		};
	}, [setProgress]);

	return lenisRef;
}
