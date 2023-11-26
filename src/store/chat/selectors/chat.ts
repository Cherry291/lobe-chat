import { LobePluginType } from '@lobehub/chat-plugin-sdk';
import { t } from 'i18next';

import { DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { DB_Message } from '@/database/schemas/message';
import { chatHelpers } from '@/store/chat/helpers';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/chatMessage';

import type { ChatStore } from '../store';

const getMeta = (message: ChatMessage) => {
  switch (message.role) {
    case 'user': {
      return {
        avatar: useGlobalStore.getState().settings.avatar || DEFAULT_USER_AVATAR,
      };
    }

    case 'system': {
      return message.meta;
    }

    case 'assistant': {
      return agentSelectors.currentAgentMeta(useSessionStore.getState());
    }

    case 'function': {
      return {
        avatar: '🧩',
        title: 'plugin-unknown',
      };
    }
  }
};

// 当前激活的消息列表
export const currentChats = (s: ChatStore): ChatMessage[] => {
  if (!s.activeId) return [];

  return s.messages.map((i) => {
    const message = i as unknown as DB_Message;

    return {
      ...i,
      extra: {
        fromModel: message.fromModel,
        translate: message.translate,
        tts: message.tts,
      },
      meta: getMeta(i),
    } as ChatMessage;
  });
};

const initTime = Date.now();
// 针对新助手添加初始化时的自定义消息
export const currentChatsWithGuideMessage = (s: ChatStore): ChatMessage[] => {
  const data = currentChats(s);

  const isBrandNewChat = data.length === 0;

  if (!isBrandNewChat) return data;

  const [activeId, isInbox] = [s.activeId, s.activeId === INBOX_SESSION_ID];
  const meta = agentSelectors.currentAgentMeta(useSessionStore.getState());

  const inboxMsg = t('inbox.defaultMessage', { ns: 'chat' });
  const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
    name: meta.title || t('defaultAgent'),
    ns: 'chat',
    systemRole: meta.description,
  });
  const agentMsg = t('agentDefaultMessage', {
    id: activeId,
    name: meta.title || t('defaultAgent'),
    ns: 'chat',
  });

  const emptyInboxGuideMessage = {
    content: isInbox ? inboxMsg : !!meta.description ? agentSystemRoleMsg : agentMsg,
    createdAt: initTime,
    extra: {},
    id: 'default',
    meta: meta || {
      avatar: DEFAULT_INBOX_AVATAR,
    },
    role: 'assistant',
    updatedAt: initTime,
  } as ChatMessage;

  return [emptyInboxGuideMessage];
};

export const currentChatsWithHistoryConfig = (s: ChatStore): ChatMessage[] => {
  const chats = currentChats(s);
  const config = agentSelectors.currentAgentConfig(useSessionStore.getState());

  return chatHelpers.getSlicedMessagesWithConfig(chats, config);
};

export const chatsMessageString = (s: ChatStore): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

export const getFunctionMessageProps =
  ({ plugin, content, id }: Pick<ChatMessage, 'plugin' | 'content' | 'id'>) =>
  (s: ChatStore) => ({
    arguments: plugin?.arguments,
    command: plugin,
    content,
    id: plugin?.identifier,
    loading: id === s.chatLoadingId,
    type: plugin?.type as LobePluginType,
  });

export const getMessageById = (id: string) => (s: ChatStore) => {
  return s.messages.find((m) => m.id === id);
};
