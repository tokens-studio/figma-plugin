import React from 'react';
import { CaretDownIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from '@tokens-studio/ui';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { useAuthStore } from '@/app/store/useAuthStore';
import { storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useStorage from '@/app/store/useStorage';
import useRemoteTokens from '@/app/store/remoteTokens';
import { Dispatch } from '@/app/store';

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

const ProjectDropdownItem = React.memo(({
  project,
  onSelect,
}: {
  project: { id: string; name: string };
  onSelect: (id: string) => void;
}) => {
  const handleClick = React.useCallback(() => {
    onSelect(project.id);
  }, [onSelect, project.id]);

  return (
    <StyledDropdownItem onClick={handleClick}>
      {project.name}
    </StyledDropdownItem>
  );
});

export interface StudioProjectSelectorProps {
  orgId?: string;
  value?: string;
  onChange?: (projectId: string) => void;
}

export const StudioProjectSelector = ({ orgId, value, onChange }: StudioProjectSelectorProps) => {
  const {
    organizations, activeProject, setActiveProject, loadProjectTokens,
  } = useAuthStore();
  const storageType = useSelector(storageTypeSelector);
  const dispatch = useDispatch<Dispatch>();
  const { setStorageType } = useStorage();
  const { fetchBranches } = useRemoteTokens();

  const handleProjectSelect = React.useCallback(async (projectId: string) => {
    if (onChange) {
      onChange(projectId);
    }

    const isCurrentlyActiveOrg = !orgId || orgId === useAuthStore.getState().activeOrganizationId;

    if (isCurrentlyActiveOrg && !onChange) {
      setActiveProject(projectId);
    }

    // Auto-load tokens if Provider is currently active AND this is the active org
    if (
      isCurrentlyActiveOrg
      && storageType.provider === StorageProviderType.TOKENS_STUDIO_OAUTH
      && (storageType as any).internalId?.startsWith('tokens-studio-')
    ) {
      try {
        await loadProjectTokens(projectId, 'main');
        const newProviderData = {
          ...storageType,
          id: projectId,
          branch: 'main',
        };
        dispatch.uiState.setLocalApiState(newProviderData as any);
        dispatch.uiState.setApiData(newProviderData as any);
        setStorageType({ provider: newProviderData as any, shouldSetInDocument: true });

        const branches = await fetchBranches(newProviderData as any);
        if (branches) {
          dispatch.branchState.setBranches(branches);
        }
      } catch (e) {
        console.error('Failed to load project tokens for active provider', e);
      }
    }
  }, [onChange, orgId, setActiveProject, storageType, loadProjectTokens, dispatch, setStorageType, fetchBranches]);

  const activeOrganization = React.useMemo(() => {
    if (orgId) {
      return organizations.find((o) => o.id === orgId) || null;
    }
    return useAuthStore.getState().activeOrganization;
  }, [orgId, organizations]);

  const projectsData = React.useMemo(
    () => activeOrganization?.projects?.data ?? [],
    [activeOrganization],
  );

  const hasProjects = projectsData.length > 0;

  const activeProjectToUse = React.useMemo(() => {
    // 1. If explicitly controlled by parent (e.g. inactive state setting override)
    if (value && projectsData.length > 0) {
      const found = projectsData.find((p) => p.id === value) || null;
      if (found) {
        return found;
      }
    }

    // 2. If this organization is the globally ACTIVE storage type, its project comes directly from storageType state
    const isOrgActiveInStorage = storageType.provider === StorageProviderType.TOKENS_STUDIO_OAUTH && (storageType as any).internalId === `tokens-studio-${orgId || useAuthStore.getState().activeOrganizationId}`;

    if (isOrgActiveInStorage && projectsData.length > 0) {
      const storedProject = projectsData.find((p) => p.id === (storageType as any).id);
      if (storedProject) {
        return storedProject;
      }
    }

    // 3. Fallback to the purely local activeProject in useAuthStore if it aligns
    const isCurrentlyActiveOrg = !orgId || orgId === useAuthStore.getState().activeOrganizationId;
    if (isCurrentlyActiveOrg && activeProject) {
      return activeProject;
    }

    // 4. Fallback to the first project in the organization
    return projectsData[0] || null;
  }, [value, projectsData, orgId, activeProject, storageType]);

  if (!activeOrganization) return null;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild disabled={!hasProjects}>
        <OrgDropdownTriggerBtn disabled={!hasProjects}>
          <AvatarFallback>
            {activeProjectToUse?.name[0] || 'P'}
          </AvatarFallback>
          {activeProjectToUse?.name || (!hasProjects ? 'No projects' : 'Select Project')}
          <CaretDownIcon style={{ marginLeft: '4px', color: 'var(--colors-fgMuted)' }} />
        </OrgDropdownTriggerBtn>
      </DropdownMenu.Trigger>
      {hasProjects && (
        <StyledDropdownContent>
          {projectsData.map((project) => (
            <ProjectDropdownItem
              key={project.id}
              project={project}
              onSelect={handleProjectSelect}
            />
          ))}
        </StyledDropdownContent>
      )}
    </DropdownMenu>
  );
};
