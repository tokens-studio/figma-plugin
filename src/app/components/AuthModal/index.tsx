import React, { ChangeEvent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/context/AuthContext';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';
import Input from '../Input';
import Box from '../Box';
import Button from '../Button';
import Text from '../Text';
import Spinner from '../Spinner';
import Link from '../Link';

enum AuthModes {
  LOGIN = 'login',
  SIGNUP = 'signup',
}

export default function AuthModal() {
  const {
    user, authInProgress, logIn, signUp, authError, setAuthError,
  } = useAuth();
  const dispatch = useDispatch<Dispatch>();
  const [mode, setMode] = useState<AuthModes>(AuthModes.LOGIN);
  const secondScreenEnabled = useSelector(secondScreenSelector);

  const [values, setValues] = React.useState({
    email: '',
    password: '',
  });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues({
        ...values,
        [name]: value,
      });
    },
    [setValues, values],
  );

  const onCtaClick = useCallback(() => {
    setMode(mode === AuthModes.LOGIN ? AuthModes.SIGNUP : AuthModes.LOGIN);
    setValues({ email: '', password: '' });
    setAuthError('');
  }, [mode, setAuthError]);

  const onSubmitButtonClick = useCallback(() => {
    if (mode === 'login') {
      logIn(values);
    } else {
      signUp(values);
    }
  }, [mode, logIn, signUp, values]);

  const getSubmitButtonContent = () => {
    if (authInProgress) {
      return (
        <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </Box>
      );
    }
    return mode === AuthModes.LOGIN ? 'Log in' : 'Sign up';
  };

  const getInfo = () => {
    const text = mode === AuthModes.LOGIN ? 'Do not have an account ?' : 'Already have an account';
    const cta = mode === AuthModes.LOGIN ? 'Sign up here' : 'Log in here';

    return (
      <>
        <Text>{text}</Text>
        <Text css={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={onCtaClick}>
          {cta}
        </Text>
      </>
    );
  };

  return (
    <Modal close={dispatch.uiState.toggleSecondScreen} isOpen={secondScreenEnabled && !user}>
      <Box css={{ display: 'flex', flexDirection: 'column', gap: '$5' }}>
        <Input name="email" type="email" value={values.email} onChange={handleChange} label="Email" />
        <Input name="password" type="password" value={values.password} onChange={handleChange} label="Password" />
        <Button variant="primary" onClick={onSubmitButtonClick}>
          {getSubmitButtonContent()}
        </Button>
        <Box css={{ display: 'flex', gap: '$3', alignItems: 'center' }}>{getInfo()}</Box>
        <Box css={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link href={`${process.env.SECOND_SCREEN_APP_URL}/password-recovery`}>Forgot password ?</Link>
        </Box>

        <Box
          css={{
            display: 'flex',
            color: '$fgDanger',
            fontSize: '$xsmall',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {authError}
        </Box>
      </Box>
    </Modal>
  );
}
