import {createFileRoute} from '@tanstack/react-router';

import {ItemDetail} from '~/components/ItemDetail';
import {getDetail} from '~/server/content';

export const Route = createFileRoute('/works/$slug')({
  loader: ({params}) => getDetail({data: {kind: 'work', slug: params.slug}}),
  component: WorkDetailPage,
});

function WorkDetailPage() {
  return <ItemDetail item={Route.useLoaderData()} backHref="/works" />;
}
