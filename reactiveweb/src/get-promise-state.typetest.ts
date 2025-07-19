import { expectTypeOf } from 'expect-type';

import { getPromiseState } from './get-promise-state.ts';

// We accept 4 types of inputs
expectTypeOf(getPromiseState(2).resolved).toEqualTypeOf<undefined | number>();
expectTypeOf(getPromiseState(() => 2).resolved).toEqualTypeOf<undefined | number>();
expectTypeOf(getPromiseState(() => Promise.resolve(2)).resolved).toEqualTypeOf<
  undefined | number
>();
expectTypeOf(getPromiseState(Promise.resolve(2)).resolved).toEqualTypeOf<undefined | number>();

// Other Properties
expectTypeOf(getPromiseState(2).isLoading).toEqualTypeOf<boolean>();
expectTypeOf(getPromiseState(2).error).toEqualTypeOf<undefined | string | null | Error>();
