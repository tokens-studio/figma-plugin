import React from 'react';
import { track } from '@/utils/analytics';
import { StyledButtonIconContainer } from './StyledButtonIconContainer';
import { StyledButton } from './StyledButton';
import type { StitchesCSS } from '@/types';

export interface ButtonProps {
  type?: 'button' | 'submit';
  form?: string;
  variant: 'secondary' | 'primary' | 'ghost' | 'danger';
  onClick?: () => void;
  size?: 'large' | 'small';
  href?: string;
  download?: string;
  disabled?: boolean;
  id?: string;
  icon?: React.ReactNode;
  buttonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  css?: StitchesCSS
}

const Button: React.FC<ButtonProps> = ({
  size = 'small',
  type = 'button',
  variant = 'primary',
  onClick,
  download,
  form,
  children,
  href,
  id,
  icon,
  disabled = false,
  buttonRef = null,
  css,
}) => {
  const handleClick = React.useCallback(() => {
    if (id) {
      track(`Clicked ${id}`);
    }
    if (onClick) {
      onClick();
    }
  }, [id, onClick]);

  if (href) {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        download={download}
        href={href}
        data-cy={id}
        data-testid={id}
      >
        <StyledButton
          ref={buttonRef}
          disabled={disabled}
          type={type === 'button' ? 'button' : 'submit'}
          size={size}
          variant={variant}
          form={form}
          css={css}
        >
          {(!!icon) && (
            <StyledButtonIconContainer>
              {icon}
            </StyledButtonIconContainer>
          )}
          {children}
        </StyledButton>
      </a>
    );
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <StyledButton
      data-cy={id}
      data-testid={id}
      ref={buttonRef}
      disabled={disabled}
      type={type === 'button' ? 'button' : 'submit'}
      size={size}
      variant={variant}
      form={form}
      onClick={handleClick}
      css={css}
    >
      {(!!icon) && (
        <StyledButtonIconContainer>
          {icon}
        </StyledButtonIconContainer>
      )}
      {children}
    </StyledButton>
  );
};

export default Button;
