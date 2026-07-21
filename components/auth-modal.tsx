"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
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
			<DialogContent className="sm:max-w-md overflow-hidden p-0">
				{/* Gradient accent bar */}
				<div className="gradient-hero h-1.5 w-full" />

				<div className="p-6">
					<DialogHeader className="mb-6">
						<DialogTitle className="text-xl">Log in to continue</DialogTitle>
					</DialogHeader>

					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="modal-email" className="text-sm font-medium">
								Email
							</Label>
							<Input
								id="modal-email"
								type="email"
								placeholder="you@example.com"
								className="h-11 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("email")}
							/>
							{form.formState.errors.email && (
								<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="modal-password" className="text-sm font-medium">
								Password
							</Label>
							<Input
								id="modal-password"
								type="password"
								placeholder="Your password"
								className="h-11 rounded-xl border-border/50 bg-muted/30 px-4 transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
								{...form.register("password")}
							/>
							{form.formState.errors.password && (
								<p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
							)}
						</div>

						<div className="flex flex-col gap-3 pt-2">
							<Button
								type="submit"
								className="h-11 w-full rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
								disabled={loading}
							>
								{loading ? "Logging in..." : "Log in"}
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={handleSignup}
								className="h-11 w-full rounded-xl text-muted-foreground hover:text-foreground"
							>
								Create account
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
