"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
	getDownloadURL,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/toast";
import { ALL_GENRES } from "@/types/comic";
import { Button } from "@/components/ui/button";

interface UploadState {
	file: File | null;
	progress: number;
	url: string | null;
	error: string | null;
	uploading: boolean;
}

function formatSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({
	label,
	accept,
	preview,
	children,
	onDrop,
}: {
	label: string;
	accept: string;
	preview: React.ReactNode;
	children?: React.ReactNode;
	onDrop: (file: File) => void;
}) {
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = useCallback(
		(file: File) => {
			if (!accept.split(",").some((ext) => file.name.toLowerCase().endsWith(ext.trim()))) {
				return;
			}
			onDrop(file);
		},
		[accept, onDrop],
	);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={(e) => {
				e.preventDefault();
				setDragging(false);
				const file = e.dataTransfer.files[0];
				if (file) handleFile(file);
			}}
			onClick={() => inputRef.current?.click()}
			className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition-all ${
				dragging
					? "border-primary bg-primary/5"
					: "border-border hover:border-primary/50 hover:bg-muted/50"
			}`}
		>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
				}}
			/>
			{preview ?? (
				<>
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
						{accept.includes(".pdf") ? "📄" : "🖼️"}
					</div>
					<p className="text-sm font-medium text-foreground">{label}</p>
					<p className="text-xs text-muted-foreground">
						Drag & drop or click to browse
					</p>
					<p className="text-xs text-muted-foreground">Accepted: {accept}</p>
				</>
			)}
			{children}
		</div>
	);
}

export default function AdminUploadPage() {
	const router = useRouter();
	const { currentUser, isAdmin, loading: authLoading } = useAuth();
	const { toast } = useToast();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [genres, setGenres] = useState<string[]>([]);
	const [isPaid, setIsPaid] = useState(false);

	const [poster, setPoster] = useState<UploadState>({
		file: null,
		progress: 0,
		url: null,
		error: null,
		uploading: false,
	});
	const [pdf, setPdf] = useState<UploadState>({
		file: null,
		progress: 0,
		url: null,
		error: null,
		uploading: false,
	});
	const [submitting, setSubmitting] = useState(false);

	if (authLoading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!currentUser || !isAdmin) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<p className="text-muted-foreground">Access denied. Admin only.</p>
			</div>
		);
	}

	function toggleGenre(genre: string) {
		setGenres((prev) =>
			prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
		);
	}

	function resetForm() {
		setTitle("");
		setDescription("");
		setGenres([]);
		setIsPaid(false);
		setPoster({ file: null, progress: 0, url: null, error: null, uploading: false });
		setPdf({ file: null, progress: 0, url: null, error: null, uploading: false });
	}

	function uploadFile(
		file: File,
		path: string,
		onProgress: (p: number) => void,
		onDone: (url: string) => void,
		onError: (msg: string) => void,
	) {
		const storageRef = ref(storage, path);
		const task = uploadBytesResumable(storageRef, file);
		task.on(
			"state_changed",
			(snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
			(err) => onError(err.message),
			() => getDownloadURL(task.snapshot.ref).then(onDone),
		);
	}

	function retryUpload(
		file: File,
		path: string,
		stateSetter: React.Dispatch<React.SetStateAction<UploadState>>,
	) {
		stateSetter((prev) => ({ ...prev, uploading: true, error: null, progress: 0 }));
		uploadFile(
			file,
			path,
			(p) => stateSetter((prev) => ({ ...prev, progress: p })),
			(url) => stateSetter((prev) => ({ ...prev, url, uploading: false })),
			(err) => stateSetter((prev) => ({ ...prev, error: err, uploading: false })),
		);
	}

	function handlePosterDrop(file: File) {
		if (!file.type.startsWith("image/")) {
			toast("Poster must be an image (.jpg, .png, .webp)", "error");
			return;
		}
		const comicId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || crypto.randomUUID();
		setPoster({ file, progress: 0, url: null, error: null, uploading: true });
		uploadFile(
			file,
			`posters/${comicId}/poster.jpg`,
			(p) => setPoster((prev) => ({ ...prev, progress: p })),
			(url) => setPoster((prev) => ({ ...prev, url, uploading: false })),
			(err) => setPoster((prev) => ({ ...prev, error: err, uploading: false })),
		);
	}

	function handlePdfDrop(file: File) {
		if (!file.name.toLowerCase().endsWith(".pdf")) {
			toast("Only PDF files are accepted", "error");
			return;
		}
		const comicId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || crypto.randomUUID();
		setPdf({ file, progress: 0, url: null, error: null, uploading: true });
		uploadFile(
			file,
			`comics/${comicId}/content.pdf`,
			(p) => setPdf((prev) => ({ ...prev, progress: p })),
			(url) => setPdf((prev) => ({ ...prev, url, uploading: false })),
			(err) => setPdf((prev) => ({ ...prev, error: err, uploading: false })),
		);
	}

	async function handleSubmit() {
		if (!title.trim()) return toast("Title is required", "error");
		if (!poster.url) return toast("Upload a poster image first", "error");
		if (!pdf.url) return toast("Upload a PDF first", "error");

		setSubmitting(true);
		try {
			const comicId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
			await setDoc(doc(db, "comics", comicId), {
				title: title.trim(),
				description: description.trim(),
				genres,
				isPaid,
				posterUrl: poster.url,
				pdfUrl: pdf.url,

				author: currentUser!.displayName || currentUser!.email || "Unknown",
				episodeCount: 1,
				accessLevel: isPaid ? "premium" : "free",
				rating: 0,
				viewsWeekly: 0,
				viewsMonthly: 0,
				viewsAllTime: 0,
				featured: false,
				createdAt: new Date().toISOString(),
			});
			toast("Comic uploaded successfully!", "success");
			resetForm();
			router.push(`/comic/${comicId}`);
		} catch (err) {
			toast(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-2xl px-6 py-10">
			<h1 className="mb-8 text-3xl font-bold">Upload Comic</h1>

			<div className="space-y-6">
				<div>
					<label className="mb-2 block text-sm font-medium">Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Comic title"
						className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Short description of the comic"
						rows={3}
						className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary resize-none"
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium">Genres</label>
					<div className="flex flex-wrap gap-2">
						{ALL_GENRES.map((genre) => (
							<button
								key={genre}
								type="button"
								onClick={() => toggleGenre(genre)}
								className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
									genres.includes(genre)
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-card text-muted-foreground hover:border-primary/50"
								}`}
							>
								{genre}
							</button>
						))}
					</div>
				</div>

				<div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
					<div>
						<p className="text-sm font-medium">Paid comic</p>
						<p className="text-xs text-muted-foreground">Require premium membership</p>
					</div>
					<button
						type="button"
						onClick={() => setIsPaid(!isPaid)}
						className={`relative h-6 w-11 rounded-full transition-colors ${
							isPaid ? "bg-primary" : "bg-muted"
						}`}
					>
						<span
							className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
								isPaid ? "translate-x-[22px]" : "translate-x-0.5"
							}`}
						/>
					</button>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<DropZone
						label="Poster Image"
						accept=".jpg,.jpeg,.png,.webp"
						onDrop={handlePosterDrop}
						preview={
							poster.file ? (
								<div className="flex flex-col items-center gap-3">
									<div className="relative h-40 w-28 overflow-hidden rounded-lg border border-border">
										<Image
											src={URL.createObjectURL(poster.file)}
											alt="Poster preview"
											fill
											className="object-cover"
										/>
									</div>
									<p className="text-xs text-muted-foreground">{poster.file.name}</p>
								</div>
							) : undefined
						}
					>
						{poster.uploading && (
							<div className="mt-3 w-full">
								<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-primary transition-all"
										style={{ width: `${poster.progress}%` }}
									/>
								</div>
								<p className="mt-1 text-xs text-muted-foreground">{poster.progress}%</p>
							</div>
						)}
						{poster.error && (
							<div className="mt-3 flex flex-col items-center gap-2">
								<p className="text-xs text-red-500">{poster.error}</p>
								<Button
									size="sm"
									variant="outline"
									onClick={(e) => {
										e.stopPropagation();
										if (poster.file) retryUpload(poster.file, `posters/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/poster.jpg`, setPoster);
									}}
								>
									Retry
								</Button>
							</div>
						)}
						{poster.url && (
							<p className="mt-2 text-xs text-green-600">✓ Uploaded</p>
						)}
					</DropZone>

					<DropZone
						label="Comic PDF"
						accept=".pdf"
						onDrop={handlePdfDrop}
						preview={
							pdf.file ? (
								<div className="flex flex-col items-center gap-3">
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
										📄
									</div>
									<p className="max-w-full truncate text-sm font-medium">
										{pdf.file.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{formatSize(pdf.file.size)}
									</p>
								</div>
							) : undefined
						}
					>
						{pdf.uploading && (
							<div className="mt-3 w-full">
								<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-primary transition-all"
										style={{ width: `${pdf.progress}%` }}
									/>
								</div>
								<p className="mt-1 text-xs text-muted-foreground">{pdf.progress}%</p>
							</div>
						)}
						{pdf.error && (
							<div className="mt-3 flex flex-col items-center gap-2">
								<p className="text-xs text-red-500">{pdf.error}</p>
								<Button
									size="sm"
									variant="outline"
									onClick={(e) => {
										e.stopPropagation();
										if (pdf.file) retryUpload(pdf.file, `comics/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/content.pdf`, setPdf);
									}}
								>
									Retry
								</Button>
							</div>
						)}
						{pdf.url && (
							<p className="mt-2 text-xs text-green-600">✓ Uploaded</p>
						)}
					</DropZone>
				</div>

				<Button
					onClick={handleSubmit}
					disabled={submitting || !poster.url || !pdf.url}
					className="w-full rounded-xl py-3 text-base font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
				>
					{submitting ? (
						<span className="flex items-center gap-2">
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
							Publishing…
						</span>
					) : (
						"Publish Comic"
					)}
				</Button>
			</div>
		</div>
	);
}
