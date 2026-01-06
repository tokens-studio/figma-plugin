import React, { ChangeEvent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Button, Label, Stack, TextInput, Link, Text,
} from '@tokens-studio/ui';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/context/AuthContext';
import Modal from '../Modal';
import { usedEmailSelector } from '@/selectors/usedEmailSelector';

enum AuthModes {
  LOGIN = 'login',
  SIGNUP = 'signup',
}

export default function AuthModal({ isOpen: isOpenProp }: { isOpen?: boolean } = {}) {
  const {
    authInProgress, logIn, signUp, authError, setAuthError,
  } = useAuth();
  const [mode, setMode] = useState<AuthModes>(AuthModes.LOGIN);
  const usedEmail = useSelector(usedEmailSelector);

  // Use prop if provided (for testing), otherwise default to closed
  // The modal should be explicitly opened when needed (e.g., when second screen requires auth)
  const isOpen = isOpenProp !== undefined ? isOpenProp : false;

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
      isOpen={isOpen}
      title={mode === AuthModes.LOGIN ? 'Log in' : 'Sign up'}
      showClose
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
