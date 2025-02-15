const singleton = Symbol.for('singleton');

export function getService<T>(
  ctor: (new () => T) & {
    [singleton]?: T;
  },
): T {
  if (!ctor[singleton]) {
    ctor[singleton] = new ctor();
  }

  return ctor[singleton];
}
