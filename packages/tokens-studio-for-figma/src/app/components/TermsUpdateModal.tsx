import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { Modal } from './Modal/Modal';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { activeTabSelector } from '@/selectors/activeTabSelector';
import { Tabs } from '@/constants/Tabs';
import { useAuthStore } from '@/app/store/useAuthStore';

const ModalFooterRight = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '$3',
});

export const TERMS_UPDATE_MODAL_KEY = 'seenTermsUpdate2026Subprocessors';
const TERMS_URL = 'https://production.tokens.studio/legal/terms-of-service';

/**
 * Whether this user still has the terms update to see. Other startup dialogs that only some users get wait for it.
 * The seen flag alone isn't enough: it is false for everyone who isn't shown the update.
 */
export function useTermsUpdatePending(): boolean {
  const isProUser = useIsProUser();
  const { isPro: hasTokensStudioSubscription } = useAuthStore();
  const seenFlag = useSelector((state: any) => state.settings?.[TERMS_UPDATE_MODAL_KEY]);
  return seenFlag === false && isProUser && !hasTokensStudioSubscription;
}

export default function TermsUpdateModal() {
  const dispatch = useDispatch();
  const pending = useTermsUpdatePending();
  const activeTab = useSelector(activeTabSelector);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Skip showing modal in Cypress tests
    const isCypress = typeof window !== 'undefined' && (window as any).Cypress;
    if (!pending || activeTab === Tabs.LOADING || isCypress) {
      setOpen(false);
      return undefined;
    }

    // Let the application settle before showing the announcement.
    const timer = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [activeTab, pending]);

  const handleClose = useCallback(() => {
    dispatch.settings.setSeenTermsUpdate2026Subprocessors(true);
    setOpen(false);
  }, [dispatch]);

  if (!open) return null;

  return (
    <Modal
      title="Terms & Conditions Update"
      isOpen={open}
      close={handleClose}
      showClose={false}
      footer={(
        <ModalFooterRight>
          {/* @ts-ignore Exception for Button to accept target */}
          <Button as="a" href={TERMS_URL} target="_blank" rel="noreferrer" variant="secondary">
            View the terms
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Continue
          </Button>
        </ModalFooterRight>
      )}
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          We have updated our Terms and Conditions, which will come into effect on August 16th, 2026. The changes
          include adding a new Subprocessor (Render.com) and improvements around our license portal. This notice is
          dated July 17th, 2026.
        </p>
      </div>
    </Modal>
  );
}
