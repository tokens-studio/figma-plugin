import React from 'react';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useDispatch, useSelector } from 'react-redux';
import { storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokensStudioStorageType } from '@/types/StorageType';
import useStorage from '@/app/store/useStorage';
import useRemoteTokens from '@/app/store/remoteTokens';
import { Dispatch } from '@/app/store';

const Avatar = styled('img', {
    width: 16,
    height: 16,
    borderRadius: '2px',
    objectFit: 'cover',
});

const AvatarFallback = styled('div', {
    width: 24,
    height: 24,
    borderRadius: '4px',
    backgroundColor: '$bgSubtle',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '$fgMuted',
    fontSize: '12px',
});

const OrgDropdownTriggerBtn = styled('button', {
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '$small',
    backgroundColor: '$bgDefault',
    padding: '4px 12px 4px 4px',
    borderRadius: '$medium',
    border: '1px solid $borderSubtle',
    color: '$fgDefault',
    '&:hover': {
        backgroundColor: '$bgSubtle',
    },
    '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
});

const StyledDropdownContent = styled(DropdownMenu.Content, {
    minWidth: 200,
    backgroundColor: '$bgDefault',
    borderRadius: '$medium',
    padding: '$2',
    boxShadow: '$default',
    border: '1px solid $borderSubtle',
    zIndex: 10,
});

const StyledDropdownItem = styled(DropdownMenu.Item, {
    fontSize: '$small',
    padding: '$2 $3',
    borderRadius: '$small',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '$2',
    color: '$fgDefault',
    '&:hover, &:focus': {
        backgroundColor: '$interaction',
        color: '$onInteraction',
    },
});

export const StudioProjectSelector = () => {
    const { activeOrganization, activeProject, setActiveProject, loadProjectTokens } = useAuthStore();
    const storageType = useSelector(storageTypeSelector);
    const dispatch = useDispatch<Dispatch>();
    const { setStorageType } = useStorage();
    const { fetchBranches } = useRemoteTokens();

    if (!activeOrganization) return null;

    const hasProjects = activeOrganization.projects?.data?.length > 0;

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger asChild disabled={!hasProjects}>
                <OrgDropdownTriggerBtn disabled={!hasProjects}>
                    <AvatarFallback>
                        {activeProject?.name[0] || 'P'}
                    </AvatarFallback>
                    {activeProject?.name || (!hasProjects ? 'No projects' : 'Select Project')}
                    <CaretDownIcon style={{ marginLeft: '4px', color: 'var(--colors-fgMuted)' }} />
                </OrgDropdownTriggerBtn>
            </DropdownMenu.Trigger>
            {hasProjects && (
                <StyledDropdownContent>
                    {activeOrganization.projects.data.map((project) => (
                        <StyledDropdownItem
                            key={project.id}
                            onClick={async () => {
                                setActiveProject(project.id);

                                // Auto-load tokens if Provider is currently active
                                if (
                                    storageType.provider === StorageProviderType.TOKENS_STUDIO_OAUTH &&
                                    (storageType as any).internalId?.startsWith('tokens-studio-')
                                ) {
                                    try {
                                        await loadProjectTokens(project.id);
                                        const newProviderData = {
                                            ...storageType,
                                            id: project.id,
                                        };
                                        dispatch.uiState.setLocalApiState(newProviderData as any);
                                        setStorageType({ provider: newProviderData as any, shouldSetInDocument: true });

                                        const branches = await fetchBranches(newProviderData as any);
                                        if (branches) {
                                            dispatch.branchState.setBranches(branches);
                                        }
                                    } catch (e) {
                                        console.error('Failed to load project tokens for active provider', e);
                                    }
                                }
                            }}
                        >
                            {project.name}
                        </StyledDropdownItem>
                    ))}
                </StyledDropdownContent>
            )}
        </DropdownMenu>
    );
};
