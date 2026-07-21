import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="border-t border-border/50 bg-card/50">
			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid gap-8 sm:grid-cols-3">
					<div>
						<p className="mb-3 text-lg font-bold gradient-text">📖 Webtoon A+</p>
						<p className="text-sm text-muted-foreground">
							Your destination for captivating webtoons and stories.
						</p>
					</div>
					<div>
						<h4 className="mb-3 text-sm font-semibold">Links</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><Link href="/browse" className="hover:text-foreground transition-colors">Browse Comics</Link></li>
							<li><Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link></li>
							<li><a href="https://discord.gg/example" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a></li>
						</ul>
					</div>
					<div>
						<h4 className="mb-3 text-sm font-semibold">Legal</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
							<li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
						</ul>
					</div>
				</div>
				<div className="mt-8 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
					© {new Date().getFullYear()} Webtoon A+. All rights reserved.
				</div>
			</div>
		</footer>
	);
}
