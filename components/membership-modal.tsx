"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

interface MembershipModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function MembershipModal({ open, onOpenChange }: MembershipModalProps) {
	const { activateMembership } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleActivate = async () => {
		setLoading(true);
		try {
			await activateMembership();
			onOpenChange(false);
		} catch {
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md overflow-hidden p-0">
				{/* Gradient accent bar */}
				<div className="gradient-hero h-1.5 w-full" />

				<div className="p-6 text-center">
					<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
						✨
					</div>

					<DialogHeader className="mb-6">
						<DialogTitle className="text-xl">Activate your membership</DialogTitle>
					</DialogHeader>

					<p className="mb-6 text-sm text-muted-foreground leading-relaxed">
						Even free comics require activating your membership to read. This is completely free —
						just click below to get started.
					</p>

					<div className="flex flex-col gap-3">
						<Button
							onClick={handleActivate}
							disabled={loading}
							className="h-12 w-full rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
						>
							{loading ? "Activating..." : "Activate free membership"}
						</Button>
						<Button
							variant="ghost"
							onClick={() => onOpenChange(false)}
							className="h-11 w-full rounded-xl text-muted-foreground hover:text-foreground"
						>
							Maybe later
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
