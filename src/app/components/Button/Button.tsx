import React from 'react';
import { track } from '@/utils/analytics';
import { StyledButtonIconContainer } from './StyledButtonIconContainer';
import { StyledButton } from './StyledButton';

export interface ButtonProps {
  type?: 'button' | 'submit';
  form?: string;
  variant: 'secondary' | 'primary' | 'ghost';
  onClick?: () => void;
  size?: 'large' | 'small';
  href?: string;
  download?: string;
  disabled?: boolean;
  id?: string;
  icon?: React.ReactNode;
  buttonRef?: React.MutableRefObject<HTMLButtonElement | null>;
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
      >
        <StyledButton
          ref={buttonRef}
          disabled={disabled}
          type={type === 'button' ? 'button' : 'submit'}
          size={size}
          variant={variant}
          form={form}
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
      ref={buttonRef}
      disabled={disabled}
      type={type === 'button' ? 'button' : 'submit'}
      size={size}
      variant={variant}
      form={form}
      onClick={handleClick}
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
