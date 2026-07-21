"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAnnouncements, type Announcement } from "@/lib/announcements";

export default function AnnouncementsPage() {
	const [items, setItems] = useState<Announcement[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getAnnouncements(50).then((a) => {
			setItems(a);
			setLoading(false);
		});
	}, []);

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			<h1 className="mb-8 text-3xl font-bold">Announcements</h1>
			{loading ? (
				<div className="flex justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : items.length === 0 ? (
				<div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card py-16 text-center">
					<div className="text-5xl">📢</div>
					<p className="text-muted-foreground">No announcements yet.</p>
					<Link href="/" className="text-sm text-primary hover:underline">Back to home</Link>
				</div>
			) : (
				<div className="space-y-6">
					{items.map((a) => (
						<article key={a.id} className="rounded-2xl border border-border/50 bg-card p-6">
							<p className="text-xs text-muted-foreground">
								{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
							</p>
							<h2 className="mt-2 text-xl font-bold">{a.title}</h2>
							<p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{a.body}</p>
						</article>
					))}
				</div>
			)}
		</div>
	);
}
