/* eslint-disable @typescript-eslint/no-explicit-any */
export function stepProperties(assert: Assert, obj: unknown, properties: string[]) {
  if (typeof obj !== 'object') {
    assert.false(`object is of incorrect type, ${typeof obj}`);

    return;
  }

  if (obj === null) {
    assert.false(`object is null`);

    return;
  }

  properties.forEach(
    (prop) => (obj as any)[prop] !== undefined && assert.step(`${prop}: ${(obj as any)[prop]}`)
  );
}
