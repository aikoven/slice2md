import {InterfaceDeclaration} from 'slice2json';
import {MaybeString, joinStrings} from './utils';
import {ModuleScope, getTypeByName} from '../moduleScope';
import {renderOperations} from './renderOperations';
import {renderHeaderId} from './renderId';
import {renderTypeLink} from './renderType';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderInterface(
  scope: ModuleScope,
  id: string,
  declaration: InterfaceDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Interface ${renderHeaderId(id)}`,
    declaration.extends &&
      `*extends* ${declaration.extends
        .map(name => renderTypeLink(scope, name))
        .join(', ')}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    `## Operations`,
    renderOperations(scope, declaration.content),
    renderInheritedOperations(scope, declaration),
  ];

  return joinStrings(paragraphs, '\n\n');
}

function renderInheritedOperations(
  scope: ModuleScope,
  declaration: InterfaceDeclaration,
): string {
  const paragraphs: MaybeString[] = [];

  if (declaration.extends) {
    for (const parent of declaration.extends) {
      const member = getTypeByName(scope, parent);

      if (member == null) {
        break;
      }

      const {scope: parentScope, declaration: parentDeclaration} = member;

      if (parentDeclaration.type !== 'interface') {
        break;
      }

      paragraphs.push(
        `### Operations inherited from ${renderTypeLink(
          parentScope,
          parentDeclaration.name,
        )}`,
        renderOperations(parentScope, parentDeclaration.content),
        renderInheritedOperations(parentScope, parentDeclaration),
      );
    }
  }

  return joinStrings(paragraphs, '\n\n');
}
