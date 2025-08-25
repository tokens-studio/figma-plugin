import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';
import { SparksSolid } from 'iconoir-react';

import { useGenerateDocumentation } from '@/app/hooks/useGenerateDocumentation';
import ProBadge from './ProBadge';

export default function GenerateDocumentationButton() {
  const { t } = useTranslation(['tokens']);
  const { handleGenerateDocumentation, modals } = useGenerateDocumentation({
    source: 'footer',
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton tooltip="Tools" aria-label="Tools" size="small" icon={<SparksSolid />} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top">
            <DropdownMenu.Item onSelect={handleGenerateDocumentation}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {t('generateDocumentation')}
                <ProBadge compact campaign="generate-documentation-dropdown" />
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      {modals}
    </>
  );
}
