// evaluates start of alias tokens such as $foo or {foo
export const checkAliasStartRegex = /(\$[^\s,]+\w)|({([^]*))/g;

// evaluates tokens such as $foo or {foo}
export const AliasRegex = /\{((?:[^{}]|{[^{}]*})*)\}|(\$[a-zA-Z0-9_.]+)/g;

export const AliasDollarRegex = /(?:\$([^\s,]+\w))/g;
