import {createFileRoute} from '@tanstack/react-router';

import {ItemDetail} from '~/components/ItemDetail';
import {getDetail} from '~/rpc/content';

export const Route = createFileRoute('/articles/$slug')({
  loader: ({params}) => getDetail({data: {kind: 'article', slug: params.slug}}),
  component: ArticleDetailPage,
});

function ArticleDetailPage() {
  return <ItemDetail item={Route.useLoaderData()} backHref="/articles" />;
}
