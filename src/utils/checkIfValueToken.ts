import {SingleToken} from '@types/tokens';

export default function checkIfValueToken(token: SingleToken): token is {value: string | number} {
    return typeof token === 'object' && 'value' in token;
}
