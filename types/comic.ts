export interface Comic {
	id: string;
	title: string;
	description: string;
	cover: string;
	author: string;
	episodeCount: number;
	accessLevel: "free" | "premium";
}
