import {ExceptionDeclaration} from 'slice2json';
import {ModuleScope, getTypeByName} from '../moduleScope';
import {renderClassFields} from './renderClassFields';
import {joinStrings, MaybeString} from './utils';
import {renderTypeLink} from './renderType';
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderException(
  scope: ModuleScope,
  id: string,
  declaration: ExceptionDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Exception ${renderHeaderId(id)}`,
    declaration.extends &&
      `extends ${renderTypeLink(scope, declaration.extends)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
    `## Fields`,
    renderClassFields(scope, declaration.content),
    renderInheritedFields(scope, declaration),
  ];

  return joinStrings(paragraphs, '\n\n');
}

function renderInheritedFields(
  scope: ModuleScope,
  declaration: ExceptionDeclaration,
): string {
  const paragraphs: MaybeString[] = [];

  if (declaration.extends) {
    const member = getTypeByName(scope, declaration.extends);

    if (member == null) {
      return '';
    }

    const {declaration: parentDeclaration} = member;

    if (parentDeclaration.type !== 'exception') {
      return '';
    }

    paragraphs.push(
      `### Fields inherited from ${renderTypeLink(
        member.scope,
        parentDeclaration.name,
      )}`,
      renderClassFields(member.scope, parentDeclaration.content),
      renderInheritedFields(member.scope, parentDeclaration),
    );
  }

  return joinStrings(paragraphs, '\n\n');
}
