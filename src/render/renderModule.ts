import markdownTable = require('markdown-table');
import {sortBy} from 'lodash';
import {
  ModuleScope,
  QualifiedDeclaration,
  TypeDeclaration,
} from '../moduleScope';
import {renderDoc} from './renderDoc';
import {joinStrings, MaybeString} from './utils';

/** @internal */
export function renderModule(scope: ModuleScope) {
  const paragraphs: MaybeString[] = [
    `# Module ${renderHeaderId(scope.id)}`,
    getModuleDoc(scope),
  ];

  const childModuleScopes = sortBy(
    Object.values(scope.names).filter(
      (child): child is ModuleScope => child != null && child.type === 'module',
    ),
    child => child.id,
  );

  if (childModuleScopes.length > 0) {
    paragraphs.push(
      `## Modules`,
      markdownTable([
        ['Module', 'Description'],
        ...childModuleScopes.map(moduleScope => {
          const {name} = moduleScope.moduleDeclarations[0];

          return [
            `[\`${name}\`](./${name}/README.md)`,
            renderDoc(
              moduleScope,
              getFirstParagraph(getModuleDoc(moduleScope) || ''),
            ),
          ];
        }),
      ]),
    );
  }

  function renderMembersOfType<T extends TypeDeclaration['type']>(
    type: T,
    plural: string,
    singular: string,
  ) {
    const members = getMembersByType(scope, type);

    if (members.length > 0) {
      paragraphs.push(
        `## ${plural}`,
        markdownTable([
          [singular, 'Description'],
          ...members.map(member => {
            const {name} = member.declaration;

            return [
              `[\`${name}\`](./${name}.md)`,
              renderDoc(
                member.scope,
                getFirstParagraph(member.declaration.doc || ''),
              ),
            ];
          }),
        ]),
      );
    }
  }

  renderMembersOfType('interface', 'Interfaces', 'Interface');
  renderMembersOfType('class', 'Classes', 'Class');
  renderMembersOfType('exception', 'Exceptions', 'Exception');
  renderMembersOfType('struct', 'Structures', 'Structure');
  renderMembersOfType('enum', 'Enums', 'Enum');
  renderMembersOfType('sequence', 'Sequences', 'Sequence');
  renderMembersOfType('dictionary', 'Dictionaries', 'Dictionary');
  renderMembersOfType('const', 'Constants', 'Constant');

  return joinStrings(paragraphs, '\n\n');
}

function renderHeaderId(id: string): string {
  const parts = id.split('::').slice(1);

  return parts
    .map((part, i) => {
      const label = `\`${part}\``;

      if (i === parts.length - 1) {
        return label;
      }

      return `[${label}](${'../'.repeat(parts.length - i - 1)}README.md)`;
    })
    .join('.');
}

function getModuleDoc(moduleScope: ModuleScope): string | undefined {
  return moduleScope.moduleDeclarations
    .map(declaration => declaration.doc)
    .find(doc => doc != null);
}

function getMembersByType<T extends TypeDeclaration['type']>(
  moduleScope: ModuleScope,
  type: T,
): Array<QualifiedDeclaration<Extract<TypeDeclaration, {type: T}>>> {
  return sortBy(
    Object.values(moduleScope.names).filter(
      (
        child,
      ): child is QualifiedDeclaration<Extract<TypeDeclaration, {type: T}>> =>
        child != null &&
        child.type === 'declaration' &&
        child.declaration.type === type,
    ),
    child => child.declaration.name,
  );
}

function getFirstParagraph(str: string): string {
  return str.split('\n\n')[0].replace(/\n/g, ' ');
}
