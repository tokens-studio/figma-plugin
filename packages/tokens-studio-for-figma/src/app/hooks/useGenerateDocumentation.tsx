import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIsProUser } from './useIsProUser';
import LivingDocumentationModal from '../components/modals/LivingDocumentationModal';
import UpgradeToProModal from '../components/UpgradeToProModal';
import generateDocumentationImage from '@/app/assets/hints/generatedocumentation.png';
import { track } from '@/utils/analytics';

type UseGenerateDocumentationOptions = {
  initialTokenSet?: string;
  initialStartsWith?: string;
  source?: 'footer' | 'tokenset-context-menu' | 'tokengroup-context-menu';
};

export function useGenerateDocumentation(options: UseGenerateDocumentationOptions = {}) {
  const { initialTokenSet, initialStartsWith, source = 'footer' } = options;
  const isProUser = useIsProUser();
  const { t } = useTranslation(['tokens']);

  const [docModalVisible, setDocModalVisible] = React.useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = React.useState(false);

  const handleCloseDocModal = React.useCallback(() => {
    setDocModalVisible(false);
  }, []);

  const handleCloseUpgradeModal = React.useCallback(() => {
    setUpgradeModalVisible(false);
  }, []);

  const handleGenerateDocumentation = React.useCallback(() => {
    if (isProUser) {
      setDocModalVisible(true);
      // Track when generate documentation is launched from different sources
      track('Generate Documentation Launched', {
        source,
      });
    } else {
      setUpgradeModalVisible(true);
    }
  }, [isProUser, source]);

  const modals = React.useMemo(
    () => (
      <>
        {docModalVisible && (
          <LivingDocumentationModal
            isOpen
            onClose={handleCloseDocModal}
            initialTokenSet={initialTokenSet}
            initialStartsWith={initialStartsWith}
          />
        )}
        {upgradeModalVisible && (
          <UpgradeToProModal
            isOpen
            onClose={handleCloseUpgradeModal}
            feature="documentation-feature"
            title={t('upgradeToPro')}
            image={generateDocumentationImage}
            description={t('generateDocumentationDescription')}
          />
        )}
      </>
    ),
    [
      docModalVisible,
      upgradeModalVisible,
      handleCloseDocModal,
      handleCloseUpgradeModal,
      initialTokenSet,
      initialStartsWith,
      t,
    ],
  );

  return {
    handleGenerateDocumentation,
    modals,
  };
}
