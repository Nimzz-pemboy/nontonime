export interface ScrapedCard {
  title: string;
  thumbnail: string;
  originalUrl: string;
  score?: string | null;
  status?: string | null;
  episodesLabel?: string | null;
}

export interface ScrapedEpisodeRef {
  eps: number;
  originalUrl: string;
  date?: string | null;
}

export interface ScrapedDetail {
  title: string;
  japanese?: string | null;
  poster: string;
  synopsisParagraphs: string[];
  score?: string | null;
  status?: string | null;
  type?: string | null;
  studios?: string | null;
  aired?: string | null;
  genres: string[];
  episodeList: ScrapedEpisodeRef[];
}

export interface ScrapedEpisodePlayback {
  title: string;
  streamOptions: { label: string; url: string }[];
  downloadLinks: { title: string; url: string }[];
  prevEpisodeUrl?: string | null;
  nextEpisodeUrl?: string | null;
}
