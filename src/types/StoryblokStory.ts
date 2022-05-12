import { ChangelogItem } from './ChangelogItem';

// @README https://www.storyblok.com/docs/api/content-delivery#core-resources/stories/stories
export type StoryblokStory<P = unknown> = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  default_full_slug: string | null;
  created_at: string;
  published_at: string;
  first_published_at: string;
  content: ChangelogItem & {
    component: string;
  } & P;
};
