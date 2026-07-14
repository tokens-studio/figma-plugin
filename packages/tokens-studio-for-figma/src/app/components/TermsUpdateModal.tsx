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
const TERMS_URL = 'https://tokens.studio/terms';

export default function TermsUpdateModal() {
  const dispatch = useDispatch();
  const isProUser = useIsProUser();
  const { isAuthenticated } = useAuthStore();
  const activeTab = useSelector(activeTabSelector);
  const seenFlag = useSelector((state: any) => state.settings?.[TERMS_UPDATE_MODAL_KEY]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Skip showing modal in Cypress tests
    const isCypress = typeof window !== 'undefined' && (window as any).Cypress;
    if (seenFlag !== false || !isProUser || isAuthenticated || activeTab === Tabs.LOADING || isCypress) {
      setOpen(false);
      return undefined;
    }

    // Let the application settle before showing the announcement.
    const timer = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(timer);
  }, [activeTab, isAuthenticated, isProUser, seenFlag]);

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
        <span>
          We have updated our Terms and Conditions, which will come into effect in 30 days. The changes include adding a new Subprocess (Render.com) and improvements around our license portal.
        </span>
        <span style={{ display: 'block', marginTop: '16px', fontSize: '12px' }}>
          July 15th, 2026
        </span>
      </div>
    </Modal>
  );
}
