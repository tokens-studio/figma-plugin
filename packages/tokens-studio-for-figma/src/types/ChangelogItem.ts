export type ChangelogItem = {
  _uid: string;
  image?: {
    alt: string;
    filename: string;
  };
  title: string;
  excerpt: string;
  read_more_link?: string;
  read_more_text?: string;
};
