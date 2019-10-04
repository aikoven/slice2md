/** @internal */
export function renderId(id: string): string {
  if (id.startsWith('::')) {
    id = id.slice(2);
  }

  return id.replace(/::/g, '.');
}

/**
 * @param id Fully-qualified type id.
 * @internal
 */
export function renderHeaderId(id: string): string {
  const parts = id.split('::').slice(1);

  return parts
    .map((part, i) => {
      const label = `\`${part}\``;

      if (i === parts.length - 1) {
        return label;
      }

      const linkPrefix =
        i === parts.length - 2 ? './' : '../'.repeat(parts.length - i - 2);

      return `[${label}](${linkPrefix}README.md)`;
    })
    .join('.');
}
