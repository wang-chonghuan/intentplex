import {createFileRoute} from '@tanstack/react-router';

import {ItemPage} from '~/components/ItemPage';
import {posts} from '~/content/items';
import {site} from '~/content/site';

export const Route = createFileRoute('/posts')({
  component: () => <ItemPage title={site.nav.posts} items={posts} />,
});
