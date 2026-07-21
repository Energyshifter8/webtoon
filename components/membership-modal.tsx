"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Activate your membership</DialogTitle>
					<DialogDescription>
						Even free comics require activating your membership to read. This is completely free —
						just click below to get started.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleActivate} disabled={loading}>
						{loading ? "Activating..." : "Activate free membership"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
