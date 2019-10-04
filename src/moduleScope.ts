import {
  ModuleDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
  ExceptionDeclaration,
  StructDeclaration,
  EnumDeclaration,
  SequenceDeclaration,
  DictionaryDeclaration,
  ConstDeclaration,
} from 'slice2json';
import {LoadedSlice} from './load';

/** @internal */
export type TypeDeclaration =
  | ClassDeclaration
  | InterfaceDeclaration
  | ExceptionDeclaration
  | StructDeclaration
  | EnumDeclaration
  | SequenceDeclaration
  | DictionaryDeclaration
  | ConstDeclaration;

/** @internal */
export interface QualifiedDeclaration<T extends TypeDeclaration> {
  type: 'declaration';
  scope: ModuleScope;
  /**
   * Fully-qualified type id starting with `::`
   */
  id: string;
  declaration: T;
}

/** @internal */
export interface ModuleScope {
  type: 'module';
  rootScope?: ModuleScope;
  parentScope?: ModuleScope;
  /**
   * Fully-qualified module id starting with `::`
   */
  id: string;
  moduleDeclarations: ModuleDeclaration[];
  names: {
    [name: string]:
      | ModuleScope
      | QualifiedDeclaration<TypeDeclaration>
      | undefined;
  };
}

/** @internal */
export function createModuleScope(slices: LoadedSlice[]): ModuleScope {
  const rootScope: ModuleScope = {
    type: 'module',
    id: '',
    names: {},
    moduleDeclarations: [],
  };

  const moduleScopes: Array<{
    moduleDeclaration: ModuleDeclaration;
    parentScope: ModuleScope;
  }> = [];

  for (const loadedSlice of slices) {
    for (const moduleDeclaration of loadedSlice.parsed.modules) {
      moduleScopes.push({moduleDeclaration, parentScope: rootScope});
    }
  }

  for (const {moduleDeclaration, parentScope} of moduleScopes) {
    const {name} = moduleDeclaration;
    const id = `${parentScope.id}::${name}`;

    let scope: ModuleScope;

    const existingModuleScope = parentScope.names[name] as
      | ModuleScope
      | undefined;

    if (existingModuleScope == null || existingModuleScope.id !== id) {
      scope = parentScope.names[name] = {
        type: 'module',
        rootScope,
        parentScope,
        id,
        moduleDeclarations: [],
        names: {},
      };
    } else {
      scope = existingModuleScope;
    }

    scope.moduleDeclarations.push(moduleDeclaration);

    for (const child of moduleDeclaration.content) {
      if (child.type === 'module') {
        moduleScopes.push({
          moduleDeclaration: child,
          parentScope: scope,
        });
      } else if (
        child.type !== 'classForward' &&
        child.type !== 'interfaceForward'
      ) {
        scope.names[child.name] = {
          type: 'declaration',
          scope: scope,
          id: `${scope.id}::${child.name}`,
          declaration: child,
        };
      }
    }
  }

  return rootScope;
}

/** @internal */
export function getTypeByName(
  scope: ModuleScope,
  typeName: string,
): QualifiedDeclaration<TypeDeclaration> | undefined {
  if (typeName.startsWith('::') && scope.rootScope != null) {
    return getTypeByName(scope.rootScope, typeName.slice(2));
  }

  const path = typeName.split('::');

  let qualDeclaration: QualifiedDeclaration<any> | undefined;

  while (true) {
    const child = getChildByPath(scope, path);

    if (child != null && child.type === 'declaration') {
      qualDeclaration = child;
      break;
    }

    if (scope.parentScope == null) {
      break;
    }

    scope = scope.parentScope;
  }

  return qualDeclaration;
}

function getChildByPath(
  scope: ModuleScope,
  path: string[],
): ModuleScope | QualifiedDeclaration<TypeDeclaration> | undefined {
  let current:
    | ModuleScope
    | QualifiedDeclaration<TypeDeclaration>
    | undefined = scope;

  for (const name of path) {
    if (current == null || current.type !== 'module') {
      return undefined;
    }
    current = current.names[name];
  }

  return current;
}

/** @internal */
export function getChildScope(scope: ModuleScope, module: string): ModuleScope {
  const childScope = scope.names[module] as ModuleScope;

  if (childScope == null) {
    throw new Error(`Child module not found: ${module}`);
  }

  return childScope;
}
