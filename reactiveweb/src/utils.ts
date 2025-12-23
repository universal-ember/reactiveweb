import type { ArgsWrapper, Thunk } from './resource/types.ts';

export const DEFAULT_THUNK = () => [];

export function normalizeThunk(thunk?: Thunk): ArgsWrapper {
  if (!thunk) {
    return { named: {}, positional: [] };
  }

  const args = thunk();

  if (Array.isArray(args)) {
    return { named: {}, positional: args };
  }

  if (!args) {
    return { named: {}, positional: [] };
  }

  /**
   * Hopefully people aren't using args named "named"
   */
  if ('positional' in args || 'named' in args) {
    return args;
  }

  return { named: args as Record<string, unknown>, positional: [] };
}
