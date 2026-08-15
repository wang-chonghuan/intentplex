import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Heading} from '@astryxdesign/core/Heading';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

import {contactLinks, contactsPage} from '~/content/contacts';
import {useLocale} from '~/i18n/locale';
import {frame} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/contacts')({
  component: ContactsPage,
});

const styles = stylex.create({
  column: {
    maxWidth: frame.proseWidth,
  },
});

function ContactsPage() {
  const {t} = useLocale();

  return (
    <VStack gap={6} xstyle={styles.column}>
      <VStack gap={3}>
        <Heading level={1}>{t(contactsPage.title)}</Heading>
        <Text type="large" color="secondary">
          {t(contactsPage.lede)}
        </Text>
      </VStack>

      <MetadataList columns="single" label={{position: 'start', width: 140}}>
        <MetadataListItem label={t(contactsPage.emailLabel)}>
          <Link href={`mailto:${contactsPage.email}`}>{contactsPage.email}</Link>
        </MetadataListItem>
        {contactLinks.map((link) => (
          <MetadataListItem key={link.id} label={link.name}>
            <Link href={link.href} isExternalLink>
              {link.handle}
            </Link>
          </MetadataListItem>
        ))}
      </MetadataList>
    </VStack>
  );
}
