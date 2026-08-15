import {createFileRoute} from '@tanstack/react-router';

import {ItemPage} from '~/components/ItemPage';
import {works} from '~/content/loader';
import {site} from '~/content/site';

export const Route = createFileRoute('/works/')({
  component: () => <ItemPage title={site.nav.works} items={works} />,
});
