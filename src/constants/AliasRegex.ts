// evaluates start of alias tokens such as $foo or {foo
export const checkAliasStartRegex = /(\$[^\s,]+\w)|({([^]*))/g;

// evaluates tokens such as $foo or {foo}
export const AliasRegex = /(\$[^\s,]+\w)|({([^}]*)})/g;

// evaluate whether string contains {
export const checkAlias = /({([^]*))/g;
