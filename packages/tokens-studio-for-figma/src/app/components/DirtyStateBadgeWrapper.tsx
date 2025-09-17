import React from 'react';
import { StyledDirtyStateBadge } from './StyledDirtyStateBadge';
import styles from './DirtyStateBadgeWrapper.module.css';

export function DirtyStateBadgeWrapper({ badge, children }: { badge: boolean, children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      {badge && <StyledDirtyStateBadge />}
      {children}
    </div>
  );
}
