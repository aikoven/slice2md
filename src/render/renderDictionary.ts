import {DictionaryDeclaration} from 'slice2json';
import {ModuleScope} from '../moduleScope';
import {joinStrings, MaybeString} from './utils';
import {renderType} from './renderType';
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderDictionary(
  scope: ModuleScope,
  id: string,
  declaration: DictionaryDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Dictionary ${renderHeaderId(id)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    '## Key Type',
    renderType(scope, declaration.keyType),
    '## Value Type',
    renderType(scope, declaration.valueType),
  ];

  return joinStrings(paragraphs, '\n\n');
}
