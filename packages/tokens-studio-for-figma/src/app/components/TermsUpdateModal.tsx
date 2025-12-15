import React from 'react';
import { Button } from '@tokens-studio/ui';
import { Modal } from './Modal/Modal';

export const TERMS_UPDATE_MODAL_KEY = 'seenTermsUpdate2026';

export default function TermsUpdateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal
      title="Terms & Conditions Update"
      isOpen={isOpen}
      close={onClose}
      showClose={false}
      footer={<Button variant="primary" onClick={onClose}>Continue</Button>}
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          We have made updates to our Terms & Conditions and Privacy Policy. Please review our
          {' '}
          <a href="https://tokens.studio/terms/plugin" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
          {' '}
          and our
          {' '}
          <a href="https://tokens.studio/privacy/plugin" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
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
