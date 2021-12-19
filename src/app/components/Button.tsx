import * as React from 'react';
import { track } from '../../utils/analytics';

type ButtonProps = {
  type?: 'button' | 'submit';
  variant: 'secondary' | 'destructive' | 'primary' | 'ghost';
  onClick?: any;
  size?: 'large' | 'small';
  href?: string;
  download?: string;
  disabled?: boolean;
  id?: string;
  buttonRef?: any;
};

const Button: React.FunctionComponent<ButtonProps> = ({
  size = 'small',
  type = 'button',
  onClick,
  download,
  variant,
  children,
  href,
  disabled = false,
  id,
  buttonRef = null,
}): HTMLButtonElement => {
  const handleClick = () => {
    if (id) {
      track(`Clicked ${id}`);
    }
    if (onClick) {
      onClick();
    }
  };
  let variantClass;
  switch (variant) {
    case 'secondary':
      variantClass = 'button-secondary';
      break;
    case 'ghost':
      variantClass = 'button-ghost';
      break;
    default:
      variantClass = 'button-primary';
      break;
  }
  let sizeClass;
  switch (size) {
    case 'large':
      sizeClass = 'button-large';
      break;
    default:
      break;
  }
  if (href) {
    return (
      <a
        target="_blank"
        rel="noreferrer"
        download={download}
        className={`button ${[variantClass, sizeClass].join(' ')}`}
        href={href}
        data-cy={id}
        ref={buttonRef}
      >
        {children}
      </a>
    );
  }

  return (
  // eslint-disable-next-line react/button-has-type
    <button
      data-cy={id}
      disabled={disabled}
      type={type}
      className={`button ${[variantClass, sizeClass].join(' ')}`}
      onClick={handleClick}
      ref={buttonRef}
    >
      {children}
    </button>
  );
};

export default Button;
