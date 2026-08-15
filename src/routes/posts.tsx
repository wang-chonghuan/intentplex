import {useMemo, useState} from 'react';
import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {HeartIcon, MessageCircleIcon, NotebookPenIcon} from 'lucide-react';

import {PageHeader} from '~/components/PageHeader';
import {posts, postsPage, type PostTopic} from '~/content/posts';
import {useLocale} from '~/i18n/locale';
import {border, color, frame, space} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/posts')({
  component: PostsPage,
});

type Filter = 'all' | PostTopic;

const FILTERS: readonly Filter[] = ['all', 'build', 'read', 'teach', 'play'];

const styles = stylex.create({
  // A feed is dense scannable data, so it renders as rows rather than a stack
  // of cards. The rule below is the row separator; everything else is spacing.
  stream: {
    maxWidth: frame.proseWidth,
  },
  row: {
    borderBlockEndColor: color.border,
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: border.width,
    paddingBlockEnd: space.s5,
    ':last-of-type': {
      borderBlockEndWidth: 0,
      paddingBlockEnd: space.s0,
    },
  },
});

function PostsPage() {
  const {t} = useLocale();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => (filter === 'all' ? posts : posts.filter((post) => post.topic === filter)),
    [filter],
  );

  return (
    <VStack gap={8}>
      <PageHeader
        title={t(postsPage.title)}
        lede={t(postsPage.lede)}
        aside={
          <Text type="supporting">
            {visible.length} {t(postsPage.countLabel)}
          </Text>
        }
      />

      {/* HStack, not a bare child of the VStack: a vertical stack stretches
          its children, and the control should hug its segments. */}
      <HStack hAlign="start">
        <SegmentedControl
          size="sm"
          label={t(postsPage.filterLabel)}
          value={filter}
          onChange={(next) => setFilter(next as Filter)}>
          {FILTERS.map((key) => (
            <SegmentedControlItem
              key={key}
              value={key}
              label={t(postsPage.topics[key])}
            />
          ))}
        </SegmentedControl>
      </HStack>

      <Divider />

      {visible.length === 0 ? (
        <EmptyState
          icon={<Icon icon={NotebookPenIcon} size="lg" />}
          title={t(postsPage.emptyTitle)}
          description={t(postsPage.emptyBody)}
        />
      ) : (
        <VStack gap={5} xstyle={styles.stream}>
          {visible.map((post) => (
            <VStack key={post.id} gap={3} xstyle={styles.row}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Avatar name="Yong Wang" size="sm" tooltip={false} />
                <Timestamp value={post.date} format="relative" type="supporting" />
                <Badge variant="neutral" label={t(postsPage.topics[post.topic])} />
              </HStack>

              <Text type="body">{t(post.body)}</Text>

              <HStack gap={4} vAlign="center">
                <HStack gap={1} vAlign="center">
                  <Icon icon={MessageCircleIcon} size="xsm" color="secondary" />
                  <Text type="supporting">{post.replies}</Text>
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Icon icon={HeartIcon} size="xsm" color="secondary" />
                  <Text type="supporting">{post.likes}</Text>
                </HStack>
              </HStack>
            </VStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
