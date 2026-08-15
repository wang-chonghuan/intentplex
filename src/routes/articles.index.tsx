import {createFileRoute} from '@tanstack/react-router';

import {ItemPage} from '~/components/ItemPage';
import {site} from '~/content/site';
import {listItems} from '~/rpc/content';

export const Route = createFileRoute('/articles/')({
  loader: () => listItems({data: 'article'}),
  component: ArticlesPage,
});

function ArticlesPage() {
  return <ItemPage title={site.nav.articles} items={Route.useLoaderData()} />;
}
