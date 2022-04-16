import React from 'react';
import { styled } from '@/stitches.config';
import { track } from '../../utils/analytics';

type ClassMap<K extends string = string> = Record<K, string>;
type ButtonProps = {
  type?: 'button' | 'submit';
  form?: string
  variant: 'secondary' | 'destructive' | 'primary' | 'ghost';
  onClick?: () => void;
  size?: 'large' | 'small';
  href?: string;
  download?: string;
  disabled?: boolean;
  id?: string;
  icon?: React.ReactNode;
  buttonRef?: React.MutableRefObject<HTMLAnchorElement | HTMLButtonElement | null>;
};

const StyledButtonIconContainer = styled('span', {
  display: 'inline-block',
  marginRight: '$3',
  height: 0,
  verticalAlign: 'middle',
  svg: {
    display: 'flex',
    alignItems: 'center',
    transform: 'translateY(-50%)',
  },
});

const Button: React.FC<ButtonProps> = ({
  size = 'small',
  type = 'button',
  onClick,
  download,
  variant,
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

  const variantClass = React.useMemo(() => (
    ({
      secondary: 'button-secondary',
      ghost: 'button-ghost',
    } as ClassMap)[variant] ?? 'button-primary'
  ), [variant]);

  const sizeClass = React.useMemo(() => (
    ({
      large: 'button-large',
    } as ClassMap)[size] ?? ''
  ), [size]);

  const buttonClass = React.useMemo(() => (
    [variantClass, sizeClass].filter(Boolean).join(' ')
  ), [variantClass, sizeClass]);

  if (href) {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        download={download}
        className={`button ${buttonClass}`}
        href={href}
        data-cy={id}
        ref={buttonRef}
      >
        {(!!icon) && (
          <StyledButtonIconContainer>
            {icon}
          </StyledButtonIconContainer>
        )}
        {children}
      </a>
    );
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button
      data-cy={id}
      disabled={disabled}
      type={type === 'button' ? 'button' : 'submit'}
      form={form}
      className={`button ${buttonClass}}`}
      onClick={handleClick}
      ref={buttonRef}
    >
      {(!!icon) && (
        <StyledButtonIconContainer>
          {icon}
        </StyledButtonIconContainer>
      )}
      {children}
    </button>
  );
};

export default Button;
