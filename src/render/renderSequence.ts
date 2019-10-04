import {SequenceDeclaration} from 'slice2json';
import {ModuleScope} from '../moduleScope';
import {joinStrings, MaybeString} from './utils';
import {renderType} from './renderType';
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderSequence(
  scope: ModuleScope,
  id: string,
  declaration: SequenceDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Sequence ${renderHeaderId(id)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    '## Item Type',
    renderType(scope, declaration.dataType),
  ];

  return joinStrings(paragraphs, '\n\n');
}
