import {StructDeclaration} from 'slice2json';
import {ModuleScope} from '../moduleScope';
import {joinStrings, MaybeString} from './utils';
import indentString = require('indent-string');
import {renderType} from './renderType';
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderStruct(
  scope: ModuleScope,
  id: string,
  declaration: StructDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Structure ${renderHeaderId(id)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    '## Fields',
    declaration.fields
      .map(field =>
        joinStrings(
          [
            joinStrings(
              [
                '-',
                `**\`${field.name}\`**`,
                renderType(scope, field.dataType),
                field.defaultValue && `\`= ${field.defaultValue}\``,
              ],
              ' ',
            ),
            field.doc && indentString(renderDoc(scope, field.doc), 2),
          ],
          '\n',
        ),
      )
      .join('\n'),
  ];

  return joinStrings(paragraphs, '\n\n');
}
