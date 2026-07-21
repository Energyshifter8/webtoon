"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { SmoothScroll } from "./smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SmoothScroll>
			<AuthProvider>{children}</AuthProvider>
		</SmoothScroll>
	);
}
