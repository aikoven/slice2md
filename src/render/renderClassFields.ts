import {ClassFieldDeclaration} from 'slice2json';
import {joinStrings} from './utils';
import indentString = require('indent-string');
import {renderType} from './renderType';
import {ModuleScope} from '../moduleScope';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderClassFields(
  scope: ModuleScope,
  fields: ClassFieldDeclaration[],
): string {
  return fields
    .map(field =>
      joinStrings(
        [
          joinStrings(
            [
              '-',
              `**\`${field.name}\`**`,
              renderType(scope, field.dataType),
              ,
              field.optional != null && `*( optional )*`,
              field.defaultValue && `\`= ${field.defaultValue}\``,
            ],
            ' ',
          ),
          field.doc && indentString(renderDoc(scope, field.doc), 2),
        ],
        '\n',
      ),
    )
    .join('\n');
}
