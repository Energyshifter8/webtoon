"use client";

import { useEffect, useRef } from "react";

export function useIsMobile(breakpoint = 768): boolean {
	const isMobileRef = useRef(false);

	useEffect(() => {
		const check = () => {
			isMobileRef.current = window.innerWidth < breakpoint;
		};
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, [breakpoint]);

	return isMobileRef.current;
}
