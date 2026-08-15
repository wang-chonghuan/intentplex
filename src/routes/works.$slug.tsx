import {createFileRoute, notFound} from '@tanstack/react-router';

import {ItemDetail} from '~/components/ItemDetail';
import {findItem} from '~/content/items';

export const Route = createFileRoute('/works/$slug')({
  loader: ({params}) => {
    const item = findItem('work', params.slug);
    if (item == null) throw notFound();
    return item;
  },
  component: WorkDetailPage,
});

function WorkDetailPage() {
  return <ItemDetail item={Route.useLoaderData()} backHref="/works" />;
}
