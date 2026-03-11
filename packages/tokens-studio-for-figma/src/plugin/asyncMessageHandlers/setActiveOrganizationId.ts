import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { ActiveOrganizationIdProperty } from '@/figmaStorage/ActiveOrganizationIdProperty';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export const setActiveOrganizationId: AsyncMessageChannelHandlers[AsyncMessageTypes.SET_ACTIVE_ORGANIZATION_ID] = async (msg) => {
  await ActiveOrganizationIdProperty.write(msg.activeOrganizationId);
};
