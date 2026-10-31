export type RepoScoring = {
  pos: number;
  mask: number;
  geo: number;
  isp: number;
  delta: number;
  abbr: string;
  site: string;
  label: string;
  resolve: string;
  repo: string;
};

export type Scoring = {
  scores: RepoScoring[];
};
