import React from 'react';
import { useTranslation } from 'react-i18next';
import { useIsProUser } from './useIsProUser';
import LivingDocumentationModal from '../components/modals/LivingDocumentationModal';
import UpgradeToProModal from '../components/UpgradeToProModal';
import generateDocumentationImage from '@/app/assets/hints/generatedocumentation.png';

type UseGenerateDocumentationOptions = {
  initialTokenSet?: string;
  initialStartsWith?: string;
};

export function useGenerateDocumentation(options: UseGenerateDocumentationOptions = {}) {
  const { initialTokenSet, initialStartsWith } = options;
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
    } else {
      setUpgradeModalVisible(true);
    }
  }, [isProUser]);

  const modals = React.useMemo(() => (
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
  ), [
    docModalVisible,
    upgradeModalVisible,
    handleCloseDocModal,
    handleCloseUpgradeModal,
    initialTokenSet,
    initialStartsWith,
    t,
  ]);

  return {
    handleGenerateDocumentation,
    modals,
  };
}
