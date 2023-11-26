import type { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { initLobeSession } from '../initialState';
import { currentSession, currentSessionSafe, getSessionById, getSessionMetaById } from './list';

describe('currentSession', () => {
  const s = {
    activeId: '1',
    sessions: [
      {
        id: '1',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
      {
        id: '2',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
    ],
  } as unknown as SessionStore;

  it('should return undefined when s.activeId is not defined', () => {
    expect(currentSession({ sessions: {} } as any)).toBeUndefined();
  });

  it('should return s.sessions[s.activeId] when s.activeId is not equal to INBOX_SESSION_ID', () => {
    expect(currentSession(s)).toEqual(s.sessions[0]);
  });
});

describe('currentSessionSafe', () => {
  const s = {
    activeId: '1',
    sessions: [
      {
        id: '1',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
      {
        id: '2',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
    ],
  } as unknown as SessionStore;

  it('should return initLobeSession when currentSession(s) returns undefined', () => {
    expect(currentSessionSafe({ sessions: {} } as any)).toEqual(initLobeSession);
  });

  it('should return the result of currentSession(s) when it returns a non-undefined value', () => {
    expect(currentSessionSafe(s)).toEqual(s.sessions[0]);
  });
});

describe('getSessionById', () => {
  const s = {
    activeId: '1',
    sessions: [
      {
        id: '1',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
      {
        id: '2',
        config: {
          model: LanguageModel.GPT3_5,
          params: {},
          systemRole: 'system-role',
        },
        type: LobeSessionType.Agent,
      } as LobeAgentSession,
    ],
  } as unknown as SessionStore;

  it('should return the session with the specified id when id is not equal to INBOX_SESSION_ID', () => {
    expect(getSessionById('1')(s)).toEqual(s.sessions[0]);
  });

  it('should return initLobeSession when the session with the specified id does not exist', () => {
    expect(getSessionById('3')(s)).toEqual(initLobeSession);
  });
});

describe('getSessionMetaById', () => {
  const s: SessionStore = {
    sessions: [
      { id: '1', meta: { title: 'Session 1' } },
      { id: '2', meta: { title: 'Session 2' } },
    ],
  } as unknown as SessionStore;

  it('should return the meta data of the session with the specified id', () => {
    expect(getSessionMetaById('1')(s)).toEqual({ title: 'Session 1' });
  });

  it('should return an empty object when the session with the specified id does not exist', () => {
    expect(getSessionMetaById('3')(s)).toEqual({});
  });
});
