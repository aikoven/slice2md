import * as fs from 'fs';
import {promisify} from 'util';
import * as path from 'path';
import mkdirpCb = require('mkdirp');
import {assertNever} from 'assert-never';
import {loadSlices} from './load';
import {
  createModuleScope,
  ModuleScope,
  QualifiedDeclaration,
  TypeDeclaration,
} from './moduleScope';
import {renderModule} from './render/renderModule';
import {renderInterface} from './render/renderInterface';
import {renderClass} from './render/renderClass';
import {renderException} from './render/renderException';
import {renderStruct} from './render/renderStruct';
import {renderEnum} from './render/renderEnum';
import {renderSequence} from './render/renderSequence';
import {renderDictionary} from './render/renderDictionary';
import {renderConst} from './render/renderConst';
import {resolveGlobs} from './utils/resolveGlobs';

export type Slice2MdOptions = {
  /**
   * Array of slice file paths or globs.
   */
  files: string[];
  /**
   * Array of file paths or globs to exclude.
   */
  exclude?: string[];
  /**
   * Directory where to put generated files.
   */
  outDir: string;
};

export async function slice2md(options: Slice2MdOptions): Promise<void> {
  const files = await resolveGlobs(options.files, options.exclude);

  const loadedSlices = await loadSlices(files);

  const rootScope = createModuleScope(loadedSlices);

  await processModule(rootScope, options.outDir);
}

const writeFile = promisify(fs.writeFile);
const mkdirp = promisify(mkdirpCb);

async function processModule(moduleScope: ModuleScope, outDir: string) {
  const promises: Promise<void>[] = [];

  for (const child of Object.values(moduleScope.names)) {
    if (child == null) {
      continue;
    }

    if (child.type === 'module') {
      promises.push(processModule(child, outDir));
    } else if (child.type === 'declaration') {
      const content = renderMember(child);
      if (content != null) {
        promises.push(write(getOutputFilePath(child.id, outDir), content));
      }
    } else {
      return assertNever(child);
    }
  }

  await write(
    getOutputFilePath(moduleScope.id + '::README', outDir),
    renderModule(moduleScope),
  );

  await Promise.all(promises);
}

function getOutputFilePath(id: string, outDir: string) {
  return path.join(outDir, ...id.split(/::/g).slice(1)) + '.md';
}

function renderMember(
  member: QualifiedDeclaration<TypeDeclaration>,
): string | void {
  const {scope: parentScope, id, declaration} = member;

  switch (declaration.type) {
    case 'interface':
      return renderInterface(parentScope, id, declaration);
    case 'class':
      return renderClass(parentScope, id, declaration);
    case 'exception':
      return renderException(parentScope, id, declaration);
    case 'struct':
      return renderStruct(parentScope, id, declaration);
    case 'enum':
      return renderEnum(parentScope, id, declaration);
    case 'sequence':
      return renderSequence(parentScope, id, declaration);
    case 'dictionary':
      return renderDictionary(parentScope, id, declaration);
    case 'const':
      return renderConst(parentScope, id, declaration);
  }

  return;
}

async function write(filePath: string, content: string): Promise<void> {
  await mkdirp(path.dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}
