import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { Modal } from './Modal/Modal';
import Link from './Link';

const ModalFooterRight = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
});

export const TERMS_UPDATE_MODAL_KEY = 'seenTermsUpdate2026';

export default function TermsUpdateModal() {
  const dispatch = useDispatch();
  const seenFlag = useSelector((state: any) => state.settings?.seenTermsUpdate2026 ?? false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Skip showing modal in Cypress tests
    const isCypress = typeof window !== 'undefined' && (window as any).Cypress;
    if (!seenFlag && !isCypress) {
      setOpen(true);
    }
  }, [seenFlag]);

  const handleClose = useCallback(() => {
    dispatch.settings.setSeenTermsUpdate2026(true);
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
          <Button variant="primary" onClick={handleClose}>Continue</Button>
        </ModalFooterRight>
      )}
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          We have made updates to our
          {' '}
          <Link href="https://tokens.studio/terms/plugin">Terms & Conditions</Link>
          {' '}
          and our
          {' '}
          <Link href="https://tokens.studio/privacy/plugin">Privacy Policy</Link>
          {', Please review these which will come into effect on '}
          <b>15 January 2026</b>
          .
        </p>
        <p>
          These updates add details about our subprocessors and their compliance, and incorporate a Data Processing Addendum (DPA) into our Terms & Conditions.
        </p>
      </div>
    </Modal>
  );
}
