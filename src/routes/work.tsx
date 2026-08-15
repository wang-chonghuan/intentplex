import {createFileRoute} from '@tanstack/react-router';
import * as stylex from '@stylexjs/stylex';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Token} from '@astryxdesign/core/Token';

import {PageHeader} from '~/components/PageHeader';
import {projects, workMetrics, workPage, type ProjectStage} from '~/content/work';
import {useLocale} from '~/i18n/locale';
import {font} from '~/styles/tokens.stylex';

export const Route = createFileRoute('/work')({
  component: WorkPage,
});

const STAGE_VARIANT: Record<ProjectStage, 'success' | 'warning' | 'neutral'> = {
  live: 'success',
  beta: 'warning',
  archived: 'neutral',
};

const styles = stylex.create({
  // A KPI figure is the one place a numeral should read as a display face
  // rather than body text, and it wants tabular figures so the tiles align.
  metric: {
    fontFamily: font.heading,
    fontVariantNumeric: 'tabular-nums',
  },
});

function WorkPage() {
  const {t} = useLocale();

  return (
    <VStack gap={8}>
      <PageHeader title={t(workPage.title)} lede={t(workPage.lede)} />

      <VStack gap={3}>
        <Heading level={2}>{t(workPage.metricsHeading)}</Heading>
        <Grid columns={{minWidth: 200, max: 4}} gap={3}>
          {workMetrics.map((metric) => (
            <Card key={metric.id} variant="muted" padding={5}>
              <VStack gap={1}>
                <Heading level={3} type="display-3" xstyle={styles.metric}>
                  {metric.value}
                </Heading>
                <Text type="label">{t(metric.label)}</Text>
                <Text type="supporting">{t(metric.detail)}</Text>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>

      <Divider />

      <VStack gap={3}>
        <Grid columns={{minWidth: 320, max: 2}} gap={4}>
          {projects.map((project) => (
            <ClickableCard
              key={project.id}
              href={project.href}
              target="_blank"
              padding={5}
              elevation="low"
              label={`${project.name} — ${t(workPage.visitLabel)}`}>
              <VStack gap={3}>
                <HStack gap={2} vAlign="center" hAlign="between">
                  <HStack gap={2} vAlign="center">
                    <Heading level={3}>{project.name}</Heading>
                    <Badge
                      variant={STAGE_VARIANT[project.stage]}
                      label={t(workPage.stageLabel[project.stage])}
                    />
                  </HStack>
                  <Text type="supporting">{project.year}</Text>
                </HStack>

                <Text type="label" color="secondary">
                  {t(project.tagline)}
                </Text>

                <Text type="body">{t(project.description)}</Text>

                <HStack gap={1} wrap="wrap">
                  {project.stack.map((tool) => (
                    <Token key={tool} label={tool} />
                  ))}
                </HStack>
              </VStack>
            </ClickableCard>
          ))}
        </Grid>
      </VStack>
    </VStack>
  );
}
