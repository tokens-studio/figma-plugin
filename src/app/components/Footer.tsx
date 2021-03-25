import * as React from 'react';
import Icon from './Icon';
import * as pjs from '../../../package.json';

export default function Footer({active}) {
    return (
        <div className={`p-4 flex-shrink-0 flex items-center justify-between ${active === 'tokens' && 'mb-16'}`}>
            <div className="text-gray-600 text-xxs">Figma Tokens Version {pjs.version}</div>
            <div className="text-gray-600 text-xxs">
                <a
                    className="flex items-center"
                    href="https://github.com/six7/figma-tokens"
                    target="_blank"
                    rel="noreferrer"
                >
                    <span className="mr-1">Feedback / Issues</span>
                    <Icon name="github" />
                </a>
            </div>
        </div>
    );
}
