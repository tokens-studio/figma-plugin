import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Heading,
  IconButton,
  Stack,
  Tabs,
  Text,
} from "@tokens-studio/ui";
import { XIcon } from "@primer/octicons-react";
import { useForm } from "react-hook-form";

// import { figmaAPI } from "../lib/figmaAPI";
import GitHubSync from "../sync/GitHubSync.js";
import WindowResizer from "./WindowResizer.js";
import { useFigmaTheme } from "../hooks/useFigmaTheme.js";
import { darkThemeMode, lightThemeMode, styled } from "../stitches.config.js";

export type FormValues = {
  id: string;
  secret?: string;
  branch?: string;
  filePath?: string;
};

function rgbToHex({
  r,
  g,
  b,
  a,
}: {
  r: number;
  g: number;
  b: number;
  a: number;
}) {
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(", ")}, ${a.toFixed(4)})`;
  }
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}

const StyledDialogContent = styled(Dialog.Content, {
  "&:focus-visible": {
    outline: "none",
  },
  variants: {
    size: {
      large: {
        width: "calc(100vw - $7)",
        maxWidth: "480px",
        padding: 0,
        boxShadow: "$contextMenu",
        borderColor: "$borderSubtle",
      },
      fullscreen: {
        width: "100vw",
        maxWidth: "100vw",
        padding: 0,
        height: "100vh",
        maxHeight: "100vh",
        borderRadius: 0,
        border: "none",
        boxShadow: "none",
      },
      regular: {
        padding: "0",
      },
    },
  },
  defaultVariants: {
    size: "regular",
  },
});

const StyledBody = styled("div", {
  position: "relative",
  padding: "$4",
  variants: {
    full: {
      true: {
        padding: 0,
      },
    },
    compact: {
      true: {
        padding: "$4",
      },
    },
  },
});

export default function App() {
  const { isDarkTheme } = useFigmaTheme();
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const showClose = true;
  const backArrow = false;
  const title = "GitHub Sync";

  const handleClose = () => {
    setIsGitHubModalOpen(false);
  };

  const { register, handleSubmit, control, resetField } = useForm<FormValues>({
    defaultValues: {
      id: "user/repo",
      secret: "",
      branch: "add-variables",
      filePath: "variables",
    },
  });

  const onSubmit = () => {};

  useEffect(() => {
    if (isDarkTheme) {
      document.body.className = darkThemeMode;
    } else {
      document.body.className = lightThemeMode;
    }
  }, [isDarkTheme]);

  return (
    <Stack direction="column" css={{ width: "100%" }} gap={2}>
      <Tabs defaultValue="1">
        <Tabs.List>
          <Tabs.Trigger value="1">Variables</Tabs.Trigger>
          <Tabs.Trigger value="2">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="1">
          <Box css={{ padding: "$3" }}>
            <Stack direction="column" gap={2}>
              {/* <Button id="refreshButton">Refresh</Button> */}
              <GitHubSync />
            </Stack>
          </Box>
        </Tabs.Content>
        <Tabs.Content value="2">
          <Box css={{ padding: "$3" }}>
            <Stack direction="column" gap={2}>
              <Button
                onClick={() => {
                  setIsGitHubModalOpen(true);
                }}
              >
                Edit GitHub Settings
              </Button>
              <Dialog
                open={isGitHubModalOpen}
                onOpenChange={() => {}}
                modal={true}
              >
                <Dialog.Portal>
                  <Dialog.Overlay />
                  <Box
                    css={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "$modalBackdrop",
                    }}
                  />
                  <StyledDialogContent
                    size="regular"
                    onInteractOutside={() => {}}
                  >
                    <Box
                      css={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      {showClose && (
                        <Stack
                          direction="row"
                          justify={backArrow ? "start" : "between"}
                          align="center"
                          css={{
                            borderBottomColor: "$borderSubtle",
                            borderBottomWidth: "1px",
                            borderTopLeftRadius: "$medium",
                            borderTopRightRadius: "$medium",
                            padding: "$4",
                            position: "sticky",
                            backgroundColor: "$bgDefault",
                            top: 0,
                            zIndex: 10,
                            gap: "$3",
                          }}
                        >
                          <Box
                            css={{
                              display: "flex",
                              alignItems: "center",
                              gap: "$3",
                            }}
                          >
                            {title && (
                              <Dialog.Title asChild>
                                <Heading as="h6" size="small">
                                  {title}
                                </Heading>
                              </Dialog.Title>
                            )}
                          </Box>
                          {showClose && (
                            <IconButton
                              onClick={handleClose || null}
                              data-testid="close-button"
                              icon={<XIcon />}
                              size="small"
                              variant="invisible"
                            />
                          )}
                        </Stack>
                      )}
                      <StyledBody>
                        <form onSubmit={handleSubmit(onSubmit)}>
                          <Stack direction="column">
                            <input
                              // full
                              {...register("id", { required: true })}
                              placeholder="username/repo"
                              style={{ marginBottom: 12 }}
                            />
                            <input
                              // full
                              {...register("secret", { required: true })}
                              type="password"
                              placeholder="Secret"
                              style={{ marginBottom: 12 }}
                            />
                            <input
                              // full
                              {...register("branch", { required: true })}
                              placeholder="Branch"
                              style={{ marginBottom: 12 }}
                            />
                            <input
                              // full
                              {...register("filePath", { required: true })}
                              placeholder="Filepath"
                              style={{ marginBottom: 12 }}
                            />
                          </Stack>
                        </form>
                      </StyledBody>
                    </Box>
                  </StyledDialogContent>
                </Dialog.Portal>
              </Dialog>
              {/* <Modal title={t('editCredentials') as string} id="modal-edit-storage-item" isOpen={isOpen} close={onClose}>
                <Stack direction="column" gap={4}>
                  <StorageItemForm
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    values={formFields as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.URL }>}
                    hasErrored={hasErrored}
                    errorMessage={errorMessage}
                  />
                </Stack>
              </Modal> */}
              {/* <Text> Tab 2 content</Text>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.{" "}
              </Text> */}
            </Stack>
          </Box>
        </Tabs.Content>
      </Tabs>
      <WindowResizer />
    </Stack>
  );
}
