import React, { useState, useEffect } from "react";
import { Button, Text, Stack, Box } from "@tokens-studio/ui";
import { useAuthStore } from "@/app/store/useAuthStore";
import Modal from "../Modal";
import { styled } from "@/stitches.config";

const UserCodeDisplay = styled('div', {
    padding: '$4',
    backgroundColor: '$bgSubtle',
    borderRadius: '$medium',
    border: '1px solid $borderSubtle',
    width: '100%',
    textAlign: 'center',
    margin: '$4 0',
});

export const OAuthDeviceCodeModal = () => {
    const {
        deviceCode,
        setError,
    } = useAuthStore();
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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

    const handleCancel = () => {
        setError(null);
    };

    const handleOpenVerificationUrl = () => {
        if (deviceCode?.verificationUri) {
            window.open(deviceCode.verificationUri, "_blank");
        }
    };

    if (!deviceCode) return null;

    return (
        <Modal
            isOpen={!!deviceCode}
            close={handleCancel}
            title="Authorization Required"
            size="large"
            showClose
        >
            <Stack direction="column" gap={4} css={{ padding: '$4', alignItems: 'center' }}>
                <Text size="small" muted css={{ textAlign: 'center' }}>
                    A new browser tab should have opened. If not, visit the link below and enter this code:
                </Text>

                <UserCodeDisplay>
                    <Text
                        bold
                        css={{
                            fontFamily: "monospace",
                            letterSpacing: "0.2em",
                            fontSize: "24px",
                        }}
                    >
                        {deviceCode.userCode}
                    </Text>
                </UserCodeDisplay>

                <Button
                    variant="primary"
                    onClick={handleOpenVerificationUrl}
                    css={{ width: '100%' }}
                >
                    Open Authorization Page
                </Button>

                <Box css={{ textAlign: 'center' }}>
                    <Text size="xsmall" muted>
                        Verification Link:
                    </Text>
                    <Box css={{ marginTop: '$1' }}>
                        <a
                            href={deviceCode.verificationUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--colors-interaction)", fontSize: '11px', wordBreak: 'break-all' }}
                        >
                            {deviceCode.verificationUri}
                        </a>
                    </Box>
                </Box>

                {timeRemaining !== null && (
                    <Text
                        size="small"
                        css={{
                            textAlign: "center",
                            color: timeRemaining < 60 ? "$dangerFg" : "$fgMuted",
                        }}
                    >
                        Code expires in: {formatTime(timeRemaining)}
                    </Text>
                )}

                <Stack direction="row" justify="center" align="center" gap={2} css={{ marginTop: '$2' }}>
                    <Box css={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '$interaction', animation: 'pulse 1.5s infinite' }} />
                    <Text size="small" muted>
                        Waiting for authorization...
                    </Text>
                </Stack>
            </Stack>
        </Modal>
    );
};
