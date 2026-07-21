export interface Comic {
	id: string;
	title: string;
	description: string;
	/** Canonical poster image URL used across the app */
	posterUrl: string;
	author: string;
	episodeCount: number;
	accessLevel: "free" | "premium";
	genres: string[];
	rating: number;
	viewsWeekly: number;
	viewsMonthly: number;
	viewsAllTime: number;
	featured: boolean;
}

export const ALL_GENRES = [
	"Action",
	"Adventure",
	"Comedy",
	"Drama",
	"Fantasy",
	"Horror",
	"Mystery",
	"Romance",
	"Sci-Fi",
	"Slice of Life",
	"Supernatural",
	"Thriller",
] as const;

export type Genre = (typeof ALL_GENRES)[number];
