"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";

const loginSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AuthModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
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
			onOpenChange(false);
			form.reset();
		} catch (err: unknown) {
			if (err instanceof Error) {
				if (err.message.includes("auth/invalid-credential")) {
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

	const handleSignup = () => {
		onOpenChange(false);
		router.push("/signup");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Log in to continue</DialogTitle>
					<DialogDescription>
						You need an account to read comics. Log in or create a free account.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
					)}
					<div className="flex flex-col gap-2">
						<Label htmlFor="modal-email">Email</Label>
						<Input
							id="modal-email"
							type="email"
							placeholder="you@example.com"
							{...form.register("email")}
						/>
						{form.formState.errors.email && (
							<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="modal-password">Password</Label>
						<Input
							id="modal-password"
							type="password"
							placeholder="Your password"
							{...form.register("password")}
						/>
						{form.formState.errors.password && (
							<p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
						)}
					</div>
					<DialogFooter className="flex flex-col gap-2 sm:flex-row">
						<Button type="submit" disabled={loading}>
							{loading ? "Logging in..." : "Log in"}
						</Button>
						<Button type="button" variant="outline" onClick={handleSignup}>
							Create account
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
