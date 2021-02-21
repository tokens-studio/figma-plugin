import * as React from 'react';

type ButtonProps = {
    type?: 'button' | 'submit';
    variant: 'secondary' | 'destructive' | 'primary' | 'ghost';
    onClick?: any;
    size?: 'large' | 'small';
    href?: string;
    download?: string;
};

const Button: React.FunctionComponent<ButtonProps> = ({
    size = 'small',
    type = 'button',
    onClick,
    download,
    variant,
    children,
    href,
}) => {
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
                download={download}
                rel="noreferrer"
                className={`button ${[variantClass, sizeClass].join(' ')}`}
                href={href}
            >
                {children}
            </a>
        );
    }

    return (
        // eslint-disable-next-line react/button-has-type
        <button type={type} className={`button ${[variantClass, sizeClass].join(' ')}`} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;
