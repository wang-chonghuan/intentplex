import {createFileRoute} from '@tanstack/react-router';

import {ItemPage} from '~/components/ItemPage';
import {articles} from '~/content/loader';
import {site} from '~/content/site';

export const Route = createFileRoute('/articles/')({
  component: () => <ItemPage title={site.nav.articles} items={articles} />,
});
