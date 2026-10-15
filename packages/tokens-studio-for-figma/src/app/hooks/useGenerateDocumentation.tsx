import React from 'react';
import { useIsProUser } from './useIsProUser';
import LivingDocumentationModal from '../components/modals/LivingDocumentationModal';
import { useUpgradeDialogStore } from '@/app/store/useUpgradeDialogStore';
import { track } from '@/utils/analytics';

type UseGenerateDocumentationOptions = {
  initialTokenSet?: string;
  initialStartsWith?: string;
  source?: 'footer' | 'tokenset-context-menu' | 'tokengroup-context-menu';
};

export function useGenerateDocumentation(options: UseGenerateDocumentationOptions = {}) {
  const { initialTokenSet, initialStartsWith, source = 'footer' } = options;
  const isProUser = useIsProUser();
  const openUpgradeDialog = useUpgradeDialogStore((state) => state.openUpgradeDialog);

  const [docModalVisible, setDocModalVisible] = React.useState(false);

  const handleCloseDocModal = React.useCallback(() => {
    setDocModalVisible(false);
  }, []);

  const handleGenerateDocumentation = React.useCallback(() => {
    if (isProUser) {
      setDocModalVisible(true);
      // Track when generate documentation is launched from different sources
      track('Generate Documentation Launched', {
        source,
      });
    } else {
      openUpgradeDialog('docsGenerator', source);
    }
  }, [isProUser, source, openUpgradeDialog]);

  const modals = React.useMemo(
    () => (
      docModalVisible && (
        <LivingDocumentationModal
          isOpen
          onClose={handleCloseDocModal}
          initialTokenSet={initialTokenSet}
          initialStartsWith={initialStartsWith}
        />
      )
    ),
    [
      docModalVisible,
      handleCloseDocModal,
      initialTokenSet,
      initialStartsWith,
    ],
  );

  return {
    handleGenerateDocumentation,
    modals,
  };
}
