import {EnumDeclaration} from 'slice2json';
import {ModuleScope} from '../moduleScope';
import {joinStrings, MaybeString} from './utils';
import indentString = require('indent-string');
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderEnum(
  scope: ModuleScope,
  id: string,
  declaration: EnumDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Enum ${renderHeaderId(id)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    '## Elements',
    declaration.enums
      .map(element =>
        joinStrings(
          [
            joinStrings(
              [
                '-',
                `**\`${element.name}\`**`,
                element.value && `\`= ${element.value}\``,
              ],
              ' ',
            ),
            element.doc && indentString(renderDoc(scope, element.doc), 2),
          ],
          '\n',
        ),
      )
      .join('\n'),
  ];

  return joinStrings(paragraphs, '\n\n');
}
