import {MaybeString, joinStrings} from './utils';
import {OperationDeclaration} from 'slice2json';
import {parseDoc, TagDocComponent, findTag} from '../docUtils';
import {remove} from 'lodash';
import indentString = require('indent-string');
import {renderType} from './renderType';
import {ModuleScope} from '../moduleScope';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderOperations(
  scope: ModuleScope,
  operations: OperationDeclaration[],
): string {
  const paragraphs: MaybeString[] = [];

  for (const operation of operations) {
    const docComponents = parseDoc(operation.doc || '');

    const paramTags = remove(
      docComponents,
      component => component.type === 'tag' && component.tag === 'param',
    ) as TagDocComponent[];

    const throwsTags = remove(
      docComponents,
      component => component.type === 'tag' && component.tag === 'throws',
    ) as TagDocComponent[];

    const returnTag = remove(
      docComponents,
      component => component.type === 'tag' && component.tag === 'return',
    )[0] as TagDocComponent | undefined;

    paragraphs.push(
      `#### \`${operation.name}(${operation.parameters
        .map(p => p.name)
        .join(', ')})\``,
      renderDoc(scope, docComponents),
    );

    if (operation.parameters.length > 0) {
      paragraphs.push(
        `##### Parameters`,
        operation.parameters
          .map(parameter => {
            const paramDoc = findTag(paramTags, parameter.name);

            return joinStrings(
              [
                joinStrings(
                  [
                    '-',
                    parameter.out && '*out*',
                    `**\`${parameter.name}\`**`,
                    renderType(scope, parameter.dataType),
                    parameter.optional != null && `*( optional )*`,
                  ],
                  ' ',
                ),
                paramDoc && indentString(renderDoc(scope, paramDoc), 2),
              ],
              '\n',
            );
          })
          .join('\n'),
      );
    }

    paragraphs.push(
      `##### Returns`,
      joinStrings(
        [
          `- ${renderType(scope, operation.returnType)}`,
          operation.returnOptional != null && `*( optional )*`,
          returnTag &&
            returnTag.value &&
            indentString(renderDoc(scope, returnTag.value), 2),
        ],
        ' ',
      ),
    );

    if (operation.throws) {
      paragraphs.push(
        `##### Throws`,
        operation.throws
          .map(name => {
            const throwsDoc = findTag(throwsTags, name);

            return joinStrings(
              [
                `- ${renderType(scope, name)}`,
                throwsDoc && indentString(renderDoc(scope, throwsDoc), 2),
              ],
              '\n',
            );
          })
          .join('\n'),
      );
    }
  }

  return joinStrings(paragraphs, '\n\n');
}
