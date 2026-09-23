export type News = {
  id: number;
  title: string;
  content: string;
  image: string | null;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NewsPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: News[];
};
