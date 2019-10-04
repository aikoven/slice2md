/** @internal */
export type MaybeString = string | false | null | undefined;

/** @internal */
export function joinStrings(strings: MaybeString[], separator: string) {
  return strings.filter(item => !!item).join(separator);
}

/** @internal */
export const primitiveTypes = new Set([
  'bool',
  'byte',
  'short',
  'int',
  'long',
  'float',
  'double',
  'string',
  'void',
]);

/**
 * @param fromModuleId Fully-qualified module id
 * @param toId Fully-qualified module or type id
 * @internal
 */
export function getRelativePath(fromModuleId: string, toId: string) {
  const fromParts = fromModuleId.split('::');
  const toParts = toId.split('::');

  let commonPrefixLength = 0;

  for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
    if (fromParts[i] === toParts[i]) {
      commonPrefixLength = i + 1;
    } else {
      break;
    }
  }

  return (
    [
      ...(fromParts.length === commonPrefixLength
        ? ['.']
        : new Array(fromParts.length - commonPrefixLength).fill('..')),
      ...toParts.slice(commonPrefixLength),
    ].join('/') + '.md'
  );
}
