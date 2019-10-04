import {ModuleScope} from '../moduleScope';
import {DocComponent, parseDoc} from '../docUtils';
import {joinStrings} from './utils';
import { renderTypeLink } from './renderType';

/** @internal */
export function renderDoc(
  scope: ModuleScope,
  docOrComponents: string | DocComponent[],
): string {
  const components =
    typeof docOrComponents === 'string'
      ? parseDoc(docOrComponents)
      : docOrComponents;

  return joinStrings(
    components.map(component => {
      switch (component.type) {
        case 'text':
          return component.value;
        case 'inline-tag':
          if (component.tag === 'link') {
            return renderTypeLink(scope, component.value);
          }

          return `{@${component.tag} ${component.value}}`;
        case 'tag':
          return `\n@${component.tag} ${component.value}`;
      }
    }),
    ' ',
  );
}
