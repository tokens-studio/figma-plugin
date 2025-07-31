import React, { ChangeEvent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Label, Stack, TextInput, Link, Text,
} from '@tokens-studio/ui';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/context/AuthContext';
import { secondScreenSelector } from '@/selectors/secondScreenSelector';
import Modal from '../Modal';
import { Dispatch } from '@/app/store';
import { usedEmailSelector } from '@/selectors/usedEmailSelector';

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
  const usedEmail = useSelector(usedEmailSelector);

  const [values, setValues] = React.useState({
    email: usedEmail || '',
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

  return (
    <Modal
      title={mode === AuthModes.LOGIN ? 'Log in' : 'Sign up'}
      showClose
      close={dispatch.uiState.toggleSecondScreen}
      isOpen={secondScreenEnabled && !user}
    >
      <Stack direction="column" align="start" gap={5}>
        <Label css={{ width: '100%' }}>
          Email
          <TextInput name="email" type="email" value={values.email} onChange={handleChange} />
        </Label>
        <Label css={{ width: '100%' }}>
          Password
          <TextInput name="password" type="password" value={values.password} onChange={handleChange} />
        </Label>
        <Button loading={authInProgress} variant="primary" onClick={onSubmitButtonClick}>
          {mode === AuthModes.LOGIN ? 'Log in' : 'Sign up'}
        </Button>
        {mode === AuthModes.LOGIN && (
          <>
            <Box css={{ display: 'flex', gap: '$3', alignItems: 'center' }}>
              <Text>Do not have an account ?</Text>
              <Button size="small" onClick={onCtaClick}>
                Sign up here
              </Button>

            </Box>
            <Box css={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link target="_blank" href={`${process.env.SECOND_SCREEN_APP_URL}/password-recovery`} rel="noreferrer">Forgot password ?</Link>
            </Box>
          </>
        )}
        {mode === AuthModes.SIGNUP && (
        <Button icon={<ChevronLeftIcon />} size="small" variant="invisible" onClick={onCtaClick}>
          Back to login
        </Button>
        )}

        <Box
          css={{
            display: 'flex',
            color: '$dangerFg',
            fontSize: '$xsmall',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {authError}
        </Box>
      </Stack>
    </Modal>
  );
}
