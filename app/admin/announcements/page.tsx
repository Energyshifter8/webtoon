"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
	createAnnouncement,
	deleteAnnouncement,
	getAnnouncements,
	type Announcement,
} from "@/lib/announcements";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

export default function AdminAnnouncementsPage() {
	const { currentUser, isAdmin, loading: authLoading } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const [items, setItems] = useState<Announcement[]>([]);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!authLoading && (!currentUser || !isAdmin)) {
			router.push("/");
		}
	}, [currentUser, isAdmin, authLoading, router]);

	useEffect(() => {
		getAnnouncements(50).then((a) => {
			setItems(a);
			setLoading(false);
		});
	}, []);

	async function handleCreate() {
		if (!title.trim() || !body.trim()) return;
		setSubmitting(true);
		try {
			await createAnnouncement(title.trim(), body.trim());
			setTitle("");
			setBody("");
			toast("Announcement published", "success");
			const updated = await getAnnouncements(50);
			setItems(updated);
		} catch {
			toast("Failed to publish", "error");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDelete(id: string) {
		await deleteAnnouncement(id);
		setItems((prev) => prev.filter((a) => a.id !== id));
		toast("Deleted", "success");
	}

	if (authLoading || !currentUser || !isAdmin) return null;

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			<h1 className="mb-6 text-2xl font-bold">Manage Announcements</h1>

			<div className="mb-8 space-y-4 rounded-2xl border border-border/50 bg-card p-6">
				<div>
					<label className="mb-1 block text-sm font-medium">Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Announcement title"
						className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium">Body</label>
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Write your announcement..."
						rows={4}
						className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
					/>
				</div>
				<Button
					onClick={handleCreate}
					disabled={submitting || !title.trim() || !body.trim()}
					className="rounded-xl"
				>
					{submitting ? "Publishing..." : "Publish"}
				</Button>
			</div>

			{loading ? (
				<div className="flex justify-center py-8">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : items.length === 0 ? (
				<p className="py-8 text-center text-muted-foreground">No announcements yet.</p>
			) : (
				<div className="space-y-3">
					{items.map((a) => (
						<div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-card p-4">
							<div className="min-w-0 flex-1">
								<p className="font-semibold">{a.title}</p>
								<p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.body}</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleDelete(a.id)}
								className="shrink-0 text-destructive hover:text-destructive"
							>
								Delete
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
