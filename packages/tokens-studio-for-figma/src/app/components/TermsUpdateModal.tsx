import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@tokens-studio/ui';
import { css } from '@stitches/react';
import { Modal } from './Modal/Modal';

const linkStyle = css({
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: 600,
  cursor: 'pointer',
});

export const TERMS_UPDATE_MODAL_KEY = 'seenTermsUpdate2026';

export default function TermsUpdateModal() {
  const dispatch = useDispatch();
  const seenFlag = useSelector((state: any) => state.settings?.seenTermsUpdate2026 ?? false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!seenFlag) {
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
      footer={
        (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleClose}>Continue</Button>
          </div>
        )
      }
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          We have made updates to our Terms & Conditions and Privacy Policy. Please review our
          {' '}
          <a
            href="https://tokens.studio/terms/plugin"
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyle()}
          >
            Terms & Conditions
          </a>
          {' '}
          and our
          {' '}
          <a
            href="https://tokens.studio/privacy/plugin"
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyle()}
          >
            Privacy Policy
          </a>
          , which will come into effect on
          {' '}
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
