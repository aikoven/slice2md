import {
  ClassDeclaration,
  OperationDeclaration,
  ClassFieldDeclaration,
} from 'slice2json';
import {ModuleScope, getTypeByName} from '../moduleScope';
import {renderOperations} from './renderOperations';
import {joinStrings, MaybeString} from './utils';
import {renderClassFields} from './renderClassFields';
import {renderTypeLink} from './renderType';
import {renderHeaderId} from './renderId';
import {renderDoc} from './renderDoc';

/** @internal */
export function renderClass(
  scope: ModuleScope,
  id: string,
  declaration: ClassDeclaration,
) {
  const paragraphs: MaybeString[] = [
    `# Class ${renderHeaderId(id)}`,
    declaration.extends &&
      `*extends* ${renderTypeLink(scope, declaration.extends)}`,
    declaration.doc && renderDoc(scope, declaration.doc),
  ];

  const operations = declaration.content.filter(
    (child): child is OperationDeclaration => child.type === 'operation',
  );

  if (operations.length > 0) {
    paragraphs.push(
      `## Operations`,
      renderOperations(scope, operations),
      renderInheritedOperations(scope, declaration),
    );
  }

  const fields = declaration.content.filter(
    (child): child is ClassFieldDeclaration => child.type === 'field',
  );

  if (fields.length > 0) {
    paragraphs.push(
      `## Fields`,
      renderClassFields(scope, fields),
      renderInheritedFields(scope, declaration),
    );
  }

  return joinStrings(paragraphs, '\n\n');
}

function renderInheritedOperations(
  scope: ModuleScope,
  declaration: ClassDeclaration,
): string {
  const paragraphs: MaybeString[] = [];

  if (declaration.extends) {
    const member = getTypeByName(scope, declaration.extends);

    if (member == null) {
      return '';
    }

    const {declaration: parentDeclaration} = member;

    if (parentDeclaration.type !== 'class') {
      return '';
    }

    paragraphs.push(
      `### Operations inherited from ${renderTypeLink(
        member.scope,
        parentDeclaration.name,
      )}`,
      renderOperations(
        member.scope,
        parentDeclaration.content.filter(
          (child): child is OperationDeclaration => child.type === 'operation',
        ),
      ),
      renderInheritedOperations(member.scope, parentDeclaration),
    );
  }

  return joinStrings(paragraphs, '\n\n');
}

function renderInheritedFields(
  scope: ModuleScope,
  declaration: ClassDeclaration,
): string {
  const paragraphs: MaybeString[] = [];

  if (declaration.extends) {
    const member = getTypeByName(scope, declaration.extends);

    if (member == null) {
      return '';
    }

    const {declaration: parentDeclaration} = member;

    if (parentDeclaration.type !== 'class') {
      return '';
    }

    paragraphs.push(
      `### Fields inherited from ${renderTypeLink(
        member.scope,
        parentDeclaration.name,
      )}`,
      renderClassFields(
        member.scope,
        parentDeclaration.content.filter(
          (child): child is ClassFieldDeclaration => child.type === 'field',
        ),
      ),
      renderInheritedFields(member.scope, parentDeclaration),
    );
  }

  return joinStrings(paragraphs, '\n\n');
}
