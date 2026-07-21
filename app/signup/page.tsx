"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";

const signupSchema = z
	.object({
		displayName: z.string().min(2, "Name must be at least 2 characters"),
		email: z.email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
	})
	.check((val) => val.password === val.confirmPassword, {
		error: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			displayName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: SignupFormData) => {
		setError(null);
		setLoading(true);

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
			const user = userCredential.user;

			await updateProfile(user, { displayName: data.displayName });

			await setDoc(doc(db, "users", user.uid), {
				email: data.email,
				displayName: data.displayName,
				membershipStatus: "none",
				createdAt: serverTimestamp(),
			});

			router.push("/");
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (err.message.includes("auth/email-already-in-use")) {
					setError("An account with this email already exists.");
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
		<div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Create an account</CardTitle>
					<CardDescription>Enter your details to get started</CardDescription>
				</CardHeader>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="flex flex-col gap-4">
						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}
						<div className="flex flex-col gap-2">
							<Label htmlFor="displayName">Name</Label>
							<Input id="displayName" placeholder="Your name" {...form.register("displayName")} />
							{form.formState.errors.displayName && (
								<p className="text-xs text-destructive">
									{form.formState.errors.displayName.message}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								{...form.register("email")}
							/>
							{form.formState.errors.email && (
								<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="At least 6 characters"
								{...form.register("password")}
							/>
							{form.formState.errors.password && (
								<p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								{...form.register("confirmPassword")}
							/>
							{form.formState.errors.confirmPassword && (
								<p className="text-xs text-destructive">
									{form.formState.errors.confirmPassword.message}
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Creating account..." : "Sign up"}
						</Button>
						<p className="text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								Log in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
