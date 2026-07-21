"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ALL_GENRES } from "@/types/comic";

const NAV_LINKS = [
	{ href: "/", label: "Home" },
	{ href: "/browse", label: "Browse" },
	{ href: "/bookmarks", label: "Bookmarks" },
	{ href: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
	const pathname = usePathname();
	const { currentUser } = useAuth();
	const [genresOpen, setGenresOpen] = useState(false);

	return (
		<header className="glass sticky top-0 left-0 right-0 z-50 border-b border-border/40">
			<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
				<div className="flex items-center gap-6">
					<Link href="/" className="flex items-center gap-2">
						<span className="text-lg font-bold gradient-text">📖 Webtoon A+</span>
					</Link>
					<nav className="hidden items-center gap-1 md:flex">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									pathname === link.href
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								{link.label}
							</Link>
						))}
						<div
							className="relative"
							onMouseEnter={() => setGenresOpen(true)}
							onMouseLeave={() => setGenresOpen(false)}
						>
							<button
								type="button"
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									pathname.startsWith("/browse") && pathname.includes("genres")
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								Genres ▾
							</button>
							{genresOpen && (
								<div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-border bg-card p-3 shadow-xl">
									<div className="grid grid-cols-2 gap-1">
										{ALL_GENRES.map((genre) => (
											<Link
												key={genre}
												href={`/browse?genres=${genre}`}
												className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
												onClick={() => setGenresOpen(false)}
											>
												{genre}
											</Link>
										))}
									</div>
								</div>
							)}
						</div>
					</nav>
				</div>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					{currentUser ? (
						<Link href="/account">
							<Button variant="ghost" size="sm" className="gap-2">
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
									{(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
								</div>
								<span className="hidden sm:inline">{currentUser.displayName || currentUser.email}</span>
							</Button>
						</Link>
					) : (
						<div className="flex gap-1.5">
							<Link href="/login">
								<Button variant="ghost" size="sm" className="rounded-xl">
									Log in
								</Button>
							</Link>
							<Link href="/signup">
								<Button size="sm" className="rounded-xl px-4 text-xs font-medium">
									Sign up
								</Button>
							</Link>
						</div>
					)}
				</div>
			</div>
			{/* Mobile nav */}
			<nav className="flex overflow-x-auto border-t border-border/30 px-4 py-2 md:hidden">
				{NAV_LINKS.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
							pathname === link.href
								? "bg-primary/10 text-primary"
								: "text-muted-foreground"
						}`}
					>
						{link.label}
					</Link>
				))}
				<Link
					href="/browse?genres="
					className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground"
				>
					Genres
				</Link>
			</nav>
		</header>
	);
}
