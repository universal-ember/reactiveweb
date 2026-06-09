import { expectTypeOf } from 'expect-type';
import { getPromiseState } from './get-promise-state.js';

// We accept 4 types of inputs
expectTypeOf(getPromiseState(2).resolved).toEqualTypeOf();
expectTypeOf(getPromiseState(() => 2).resolved).toEqualTypeOf();
expectTypeOf(getPromiseState(() => Promise.resolve(2)).resolved).toEqualTypeOf();
expectTypeOf(getPromiseState(Promise.resolve(2)).resolved).toEqualTypeOf();

// Other Properties
expectTypeOf(getPromiseState(2).isLoading).toEqualTypeOf();
expectTypeOf(getPromiseState(2).error).toMatchTypeOf();
//# sourceMappingURL=get-promise-state.typetest.js.map
