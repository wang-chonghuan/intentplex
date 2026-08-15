import {createFileRoute} from '@tanstack/react-router';

import {ItemPage} from '~/components/ItemPage';
import {site} from '~/content/site';
import {listItems} from '~/server/content';

export const Route = createFileRoute('/posts')({
  loader: () => listItems({data: 'post'}),
  component: PostsPage,
});

function PostsPage() {
  return <ItemPage title={site.nav.posts} items={Route.useLoaderData()} />;
}
