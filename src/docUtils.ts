import {escapeRegExp} from 'lodash';

/** @internal */
export type DocComponent =
  | TextDocComponent
  | TagDocComponent
  | InlineTagDocComponent;

/** @internal */
export type TextDocComponent = {
  type: 'text';
  value: string;
};

/** @internal */
export type TagDocComponent = {
  type: 'tag';
  tag: string;
  value?: string;
};

/** @internal */
export type InlineTagDocComponent = {
  type: 'inline-tag';
  tag: string;
  value: string;
};

/** @internal */
export function parseDoc(doc: string): DocComponent[] {
  const [text, ...tags] = doc.split(/(?=^@\w+)/gm);

  const components: DocComponent[] = [];

  const inlineTagRegExp = /\s*{@(\w+)\s+([^}]+)}\s*/g;

  while (true) {
    const {lastIndex} = inlineTagRegExp;
    const match = inlineTagRegExp.exec(text);

    if (match != null) {
      components.push(
        {
          type: 'text',
          value: text.slice(lastIndex, match.index).trim(),
        },
        {
          type: 'inline-tag',
          tag: match[1],
          value: match[2],
        },
      );
    } else {
      components.push({
        type: 'text',
        value: text.slice(lastIndex, text.length).trim(),
      });
      break;
    }
  }

  for (const tag of tags) {
    const match = tag.match(/^@(\w+)(?:\s+(.*))?$/s);

    if (match) {
      const [, tag, value] = match;
      components.push({
        type: 'tag',
        tag,
        value: value == null ? value : value.trim(),
      });
    }
  }

  return components;
}

/** @internal */
export function findTag(
  tags: TagDocComponent[],
  name: string,
): string | undefined {
  for (const {value} of tags) {
    if (value != null) {
      const match = value.match(
        new RegExp(`^${escapeRegExp(name)}\\s+(.*)$`, 's'),
      );

      if (match) {
        return match[1].trim();
      }
    }
  }

  return undefined;
}
