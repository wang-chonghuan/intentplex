import {createFileRoute} from '@tanstack/react-router';

import {ItemPage} from '~/components/ItemPage';
import {site} from '~/content/site';
import {listItems} from '~/server/content';

export const Route = createFileRoute('/works/')({
  loader: () => listItems({data: 'work'}),
  component: WorksPage,
});

function WorksPage() {
  return <ItemPage title={site.nav.works} items={Route.useLoaderData()} />;
}
