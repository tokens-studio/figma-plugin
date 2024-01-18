import { StoryblokStory } from '@/types';

export function formatDate(date?: number | Date) {
  const formatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
  const [month, , day, , year, , hour, , minute] = formatter.formatToParts(date);
  return `${year.value}-${month.value}-${day.value} ${hour.value}:${minute.value}`;
}

export default async function fetchChangelog(lastOnline: Date, setChangelog: (stories: StoryblokStory['content'][]) => void): Promise<void> {
  if (process.env.STORYBLOK_ACCESS_TOKEN && lastOnline.toString() !== '0') {
    const token = process.env.STORYBLOK_ACCESS_TOKEN;
    const formattedDate = formatDate(new Date(lastOnline));
    const response = await fetch(
      `https://api.storyblok.com/v1/cdn/stories?version=published&token=${token}&first_published_at_gt=${formattedDate}&startsWith=changelog/&sort_by=first_published_at`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const res = await response.json() as {
      stories: StoryblokStory[];
    };
    if (res.stories) {
      const stories = res.stories.map((story) => ({ ...story.content }));
      setChangelog(stories);
    }
  }
}
