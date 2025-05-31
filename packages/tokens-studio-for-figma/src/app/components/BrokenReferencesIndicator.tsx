import React from 'react';
import { Button } from '@tokens-studio/ui';
import { WarningTriangleSolid } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { TokensContext } from '@/context';
import { BrokenReferencesModal } from './BrokenReferencesModal';

export function BrokenReferencesIndicator() {
  const { t } = useTranslation(['tokens']);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const tokensContext = React.useContext(TokensContext);

  const brokenReferencesCount = React.useMemo(() => tokensContext.resolvedTokens.filter((token) => token.failedToResolve).length, [tokensContext.resolvedTokens]);

  const handleOpenDialog = React.useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  if (brokenReferencesCount === 0) {
    return null;
  }

  return (
    <>
      <Button
        icon={<WarningTriangleSolid />}
        size="small"
        variant="secondary"
        onClick={handleOpenDialog}
        data-testid="broken-references-indicator"
      >
        {brokenReferencesCount}
        {' '}
        {brokenReferencesCount === 1 ? t('brokenReference') : t('brokenReferences')}
      </Button>
      <BrokenReferencesModal
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        brokenTokens={tokensContext.resolvedTokens.filter((token) => token.failedToResolve)}
        onTokenEdit={handleCloseDialog}
      />
    </>
  );
}
