import React, { useState, useEffect } from "react";
import { Button, Text } from "@tokens-studio/ui";
import { useAuthStore } from "@/app/store/useAuthStore";
import clsx from "clsx";
import { styled } from "@/stitches.config";

const LoginRow = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
});

const LoginLabel = styled('span', {
    fontSize: '$small',
    fontWeight: '$sansBold',
    color: '$fgDefault',
});

const DeviceCodeContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '$4',
    gap: '$3',
    background: '$bgDefault',
    borderRadius: '$medium',
    border: '1px solid $borderSubtle',
    marginTop: '$4',
});

const UserCodeDisplay = styled('div', {
    padding: '$3',
    backgroundColor: '$bgSubtle',
    borderRadius: '$medium',
    border: '1px solid $borderSubtle',
    width: '100%',
    textAlign: 'center',
});

const ErrorContainer = styled('div', {
    marginTop: '$4',
    padding: '$3',
    borderRadius: '$small',
    backgroundColor: '$dangerBg',
    color: '$dangerFg',
    fontSize: '$small',
});

interface OAuthLoginProps {
    studioUrl?: string;
    onSuccess?: () => void;
}

export const OAuthLogin = ({ studioUrl, onSuccess }: OAuthLoginProps) => {
    const {
        loginWithOAuth,
        error: authError,
        isLoading,
        deviceCode,
        setError,
        isAuthenticated,
    } = useAuthStore();
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (isAuthenticated && onSuccess) {
            onSuccess();
        }
    }, [isAuthenticated, onSuccess]);

    // Update countdown timer for device code expiration
    useEffect(() => {
        if (!deviceCode) {
            setTimeRemaining(null);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, deviceCode.expiresAt - Date.now());
            setTimeRemaining(Math.floor(remaining / 1000)); // Convert to seconds

            if (remaining <= 0) {
                setTimeRemaining(null);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [deviceCode]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOAuthLogin = async () => {
        try {
            await loginWithOAuth();
        } catch (error) {
            // Error is already handled in the store
            console.error("OAuth login failed:", error);
        }
    };

    const handleRestartLogin = () => {
        setError(null);
    };

    const handleOpenVerificationUrl = () => {
        if (deviceCode?.verificationUri) {
            window.open(deviceCode.verificationUri, "_blank");
        }
    };

    const getErrorMessage = () => {
        if (authError && authError.includes("OAuthError")) {
            // Try to extract user-friendly message if it's an OAuthError
            try {
                const error = JSON.parse(authError);
                return error.userMessage || authError;
            } catch {
                return authError;
            }
        }
        return authError;
    };

    // Show device code display when we have device code info
    if (deviceCode) {
        return (
            <DeviceCodeContainer>
                <Text
                    bold
                    css={{ marginBottom: "$2", fontSize: "$medium" }}
                >
                    Authorization Required
                </Text>

                <Text
                    size="small"
                    muted
                    css={{ marginBottom: "$4", textAlign: 'center' }}
                >
                    Visit the link below and enter this code:
                </Text>

                {/* User Code Display */}
                <UserCodeDisplay>
                    <Text
                        bold
                        css={{
                            fontFamily: "monospace",
                            letterSpacing: "0.2em",
                            fontSize: "$large",
                        }}
                    >
                        {deviceCode.userCode}
                    </Text>
                </UserCodeDisplay>

                {/* Verification URL */}
                <Button
                    variant="primary"
                    onClick={handleOpenVerificationUrl}
                    css={{ width: '100%', marginTop: "$3" }}
                >
                    Open Authorization Page
                </Button>

                <Text
                    size="small"
                    muted
                    css={{
                        marginTop: "$2",
                        textAlign: "center",
                    }}
                >
                    <a
                        href={deviceCode.verificationUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--colors-interaction)" }}
                    >
                        {deviceCode.verificationUri}
                    </a>
                </Text>

                {/* Countdown Timer */}
                {timeRemaining !== null && (
                    <Text
                        size="small"
                        css={{
                            marginTop: "$3",
                            textAlign: "center",
                            color:
                                timeRemaining < 60
                                    ? "$dangerFg"
                                    : "$fgMuted",
                        }}
                    >
                        Code expires in: {formatTime(timeRemaining)}
                    </Text>
                )}

                {/* Status Message */}
                <Text
                    size="small"
                    muted
                    css={{
                        marginTop: "$3",
                        textAlign: "center",
                    }}
                >
                    Waiting for authorization...
                </Text>

                {/* Cancel Button */}
                <Button
                    variant="secondary"
                    onClick={handleRestartLogin}
                    css={{ width: '100%', marginTop: "$3" }}
                >
                    Cancel
                </Button>
            </DeviceCodeContainer>
        );
    }

    // Default login button view
    return (
        <div style={{ width: '100%' }}>
            <LoginRow>
                <LoginLabel>Already have an account?</LoginLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isLoading && !deviceCode && (
                        <Text muted css={{ fontSize: '$small' }}>Loading...</Text>
                    )}
                    <Button
                        variant="secondary"
                        onClick={handleOAuthLogin}
                        disabled={isLoading}
                    >
                        Log In
                    </Button>
                </div>
            </LoginRow>

            {authError && (
                <ErrorContainer>
                    {getErrorMessage()}
                    <Button variant="secondary" onClick={handleRestartLogin} css={{ marginTop: '$3', width: '100%' }}>
                        Try Again
                    </Button>
                </ErrorContainer>
            )}
        </div>
    );
};
