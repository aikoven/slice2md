import {ConstDeclaration} from 'slice2json';
import {ModuleScope} from '../moduleScope';
import {joinStrings, MaybeString} from './utils';
import {renderType} from './renderType';
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderConst(
  scope: ModuleScope,
  id: string,
  declaration: ConstDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Constant ${renderHeaderId(id)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    '## Value',
    `${renderType(scope, declaration.dataType)} \`= ${declaration.value}\``,
  ];

  return joinStrings(paragraphs, '\n\n');
}
