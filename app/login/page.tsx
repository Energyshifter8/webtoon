"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setError(null);
		setLoading(true);

		try {
			await signInWithEmailAndPassword(auth, data.email, data.password);
			router.push("/");
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (
					err.message.includes("auth/invalid-credential") ||
					err.message.includes("auth/user-not-found") ||
					err.message.includes("auth/wrong-password")
				) {
					setError("Invalid email or password.");
				} else {
					setError(err.message);
				}
			} else {
				setError("An unexpected error occurred.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen">
			<div className="hidden flex-1 items-center justify-center lg:flex">
				<div className="gradient-hero flex h-full w-full flex-col items-center justify-center p-12 text-white">
					<div className="animate-float mb-8 text-8xl">📖</div>
					<h1 className="mb-4 text-4xl font-bold tracking-tight">Webtoon A+</h1>
					<p className="max-w-sm text-center text-lg text-white/80">
						Discover immersive stories, stunning artwork, and endless scrolling adventures.
					</p>
					<div className="mt-10 flex gap-3">
						<div className="h-2 w-2 rounded-full bg-white/40" />
						<div className="h-2 w-2 rounded-full bg-white/70" />
						<div className="h-2 w-2 rounded-full bg-white/40" />
					</div>
				</div>
			</div>

			<div className="flex flex-1 items-center justify-center px-6 py-12">
				<div className="w-full max-w-sm space-y-8">
					<div>
						<Link href="/" className="mb-8 inline-block text-2xl font-bold gradient-text lg:hidden">
							Webtoon A+
						</Link>
						<h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Log in to continue your reading journey
						</p>
					</div>

					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						{error && (
							<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								className="h-12 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("email")}
							/>
							{form.formState.errors.email && (
								<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password" className="text-sm font-medium">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Your password"
								className="h-12 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("password")}
							/>
							{form.formState.errors.password && (
								<p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
							)}
						</div>

						<Button
							type="submit"
							className="h-12 w-full rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
							disabled={loading}
						>
							{loading ? "Logging in..." : "Log in"}
						</Button>
					</form>

					<p className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href="/signup"
							className="font-medium text-primary transition-colors hover:text-primary/80"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
