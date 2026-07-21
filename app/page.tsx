"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { MembershipModal } from "@/components/membership-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface Comic {
	id: string;
	title: string;
	cover: string;
	author: string;
}

const MOCK_COMICS: Comic[] = [
	{ id: "1", title: "The Lone Warrior", cover: "/file.svg", author: "Artist A" },
	{ id: "2", title: "City of Dreams", cover: "/globe.svg", author: "Artist B" },
	{ id: "3", title: "Starlight Saga", cover: "/window.svg", author: "Artist C" },
	{ id: "4", title: "Shadow Realm", cover: "/vercel.svg", author: "Artist D" },
];

export default function Home() {
	const { currentUser, membershipStatus, loading } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [membershipModalOpen, setMembershipModalOpen] = useState(false);
	const [, setPendingComic] = useState<Comic | null>(null);

	const handleComicClick = (comic: Comic) => {
		if (loading) return;

		if (!currentUser) {
			setPendingComic(comic);
			setAuthModalOpen(true);
			return;
		}

		if (membershipStatus === "none") {
			setPendingComic(comic);
			setMembershipModalOpen(true);
			return;
		}

		// TODO: navigate to comic reader
	};

	return (
		<div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
			<header className="flex items-center justify-between border-b px-6 py-4">
				<h1 className="text-xl font-bold">Webtoon</h1>
				<div className="flex items-center gap-3">
					<ThemeToggle />
					{currentUser ? (
						<Button variant="ghost" size="sm">
							{currentUser.displayName || currentUser.email}
						</Button>
					) : (
						<div className="flex gap-2">
							<Link
								href="/login"
								className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground"
							>
								Log in
							</Link>
							<Link
								href="/signup"
								className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</header>

			<main className="flex flex-1 flex-col items-center px-6 py-10">
				<section className="mb-12 text-center">
					<h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
						Discover Comics
					</h2>
					<p className="text-muted-foreground">
						Browse our collection — no account needed to explore.
					</p>
				</section>

				<section className="grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
					{MOCK_COMICS.map((comic) => (
						<button
							key={comic.id}
							type="button"
							onClick={() => handleComicClick(comic)}
							className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md"
						>
							<div className="flex aspect-[3/4] items-center justify-center bg-muted p-6">
								<Image
									src={comic.cover}
									alt={comic.title}
									width={200}
									height={267}
									className="h-full w-full object-contain opacity-70 transition-opacity group-hover:opacity-100"
								/>
							</div>
							<div className="flex flex-col gap-1 p-4">
								<h3 className="font-semibold leading-tight">{comic.title}</h3>
								<p className="text-sm text-muted-foreground">{comic.author}</p>
							</div>
						</button>
					))}
				</section>
			</main>

			<AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
			<MembershipModal open={membershipModalOpen} onOpenChange={setMembershipModalOpen} />
		</div>
	);
}
