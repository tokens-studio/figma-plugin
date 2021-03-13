import StoryblokClient from 'storyblok-js-client';

const Storyblok = new StoryblokClient({
    cache: {
        clear: 'auto',
        type: 'memory',
    },
});

function formatDate(date) {
    const s = date.getMinutes();
    const t = date.getMinutes();
    const d = date.getDate();
    const m = date.getMonth() + 1; // Month from 0 to 11
    const y = date.getFullYear();
    return `${y}-${m}-${d} ${t}:${s}}`;
}

export default function SbFetchChangelog(lastOnline: Date) {
    if (process.env.STORYBLOK_ACCESS_TOKEN) {
        console.log('Last online was', lastOnline);
        const formattedDate = formatDate(new Date(lastOnline));
        console.log('Last online was', formattedDate);
        Storyblok.get('cdn/stories', {
            token: process.env.STORYBLOK_ACCESS_TOKEN,
            starts_with: 'changelog/',
            // published_at_gt: formattedDate,
        })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
    }
}
