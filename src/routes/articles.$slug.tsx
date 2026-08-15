import {createFileRoute, notFound} from '@tanstack/react-router';

import {ItemDetail} from '~/components/ItemDetail';
import {findItem} from '~/content/items';

export const Route = createFileRoute('/articles/$slug')({
  loader: ({params}) => {
    const item = findItem('article', params.slug);
    if (item == null) throw notFound();
    return item;
  },
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  return <ItemDetail item={Route.useLoaderData()} backHref="/articles" />;
}
