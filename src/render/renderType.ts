import {ModuleScope, getTypeByName} from '../moduleScope';
import {primitiveTypes, getRelativePath} from './utils';
import {renderId} from './renderId';

/** @internal */
export function renderType(scope: ModuleScope, typeName: string) {
  if (!primitiveTypes.has(typeName)) {
    const match = typeName.match(complexTypeRegexp)!;

    const dataType = match[1];
    const isProxy = match[2] != null;

    const member = getTypeByName(scope, dataType);

    if (member != null) {
      let label = renderId(member.id);

      if (isProxy) {
        label += ' *';
      }

      return `[\`{ ${label} }\`](${getRelativePath(scope.id, member.id)})`;
    } else {
      warnResolution(scope.id, typeName);

      let label = renderId(dataType);

      if (isProxy) {
        label += ' *';
      }

      return `\`{ ${label} }\``;
    }
  } else {
    return `\`{ ${renderId(typeName)} }\``;
  }
}

/** @internal */
export function renderTypeLink(scope: ModuleScope, typeName: string) {
  if (!primitiveTypes.has(typeName)) {
    const match = typeName.match(complexTypeRegexp)!;

    const dataType = match[1];
    const isProxy = match[2] != null;

    let label = renderId(dataType);

    if (isProxy) {
      label += ' *';
    }

    const member = getTypeByName(scope, dataType);

    if (member != null) {
      return `[\`${label}\`](${getRelativePath(scope.id, member.id)})`;
    } else {
      warnResolution(scope.id, typeName);

      return `\`${label}\``;
    }
  } else {
    return `\`${renderId(typeName)}\``;
  }
}

const complexTypeRegexp = /^(.*?)(\s*\*)?$/;

function warnResolution(moduleId: string, typeName: string): void {
  const warnKey = `${moduleId}__${typeName}`;

  if (!warnedResolutions.has(warnKey)) {
    warnedResolutions.add(warnKey);

    console.warn(
      `Could not resolve name '${typeName}' relative to module '${moduleId}'`,
    );
  }
}

const warnedResolutions = new Set<string>();
