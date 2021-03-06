import _ from 'lodash';
import {
  Get as NestGet,
  Post as NestPost,
  Put as NestPut,
  Delete as NestDelete,
  Head as NestHead,
  Patch as NestPatch,
} from '@nestjs/common';
import * as O3TS from 'openapi3-ts';

import { OperationInfoArgs, SimpleResponseWithSchemaLike, Ctor, SchemaLike } from '../../types';
import { Operation } from './informational';
import { getAllParameterMetadata, inferSchema, appendArrayMetadata, parseSchemaLike, prepareResponsesFromSchemaLikes } from '../../utils';
import { OPENAPI_INTERNAL_MODELS_TO_PARSE, OPENAPI_OPERATION_INFO } from '../metadata-keys';
import { DefinitionError } from '../../errors';

type NestMethodDecorator = typeof NestGet;

function buildHandlerMethod(nestDecorator: NestMethodDecorator) {
  return (p1?: string | OperationInfoArgs, p2?: OperationInfoArgs): MethodDecorator => {
    const route: string | undefined = (typeof(p1) === 'string') ? p1 : undefined;
    const info: OperationInfoArgs | undefined = typeof(p1) !== 'object' ? p2 : p1;

    return <T>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
      try {
        const handlerMetadata = getAllParameterMetadata(target, propertyKey);
        const returnType = handlerMetadata['design:returntype'];

        if (info) {
          const op: Partial<O3TS.OperationObject> = {
            summary: info.summary,
            description: info.description,
            deprecated: info.deprecated,
            externalDocs: info.externalDocs,
          };

          const modelsToParse: Array<Ctor> = [];

          const responses: { [code: string]: SimpleResponseWithSchemaLike } = {
            ...(info.responses || {}),
          };
          if (info.response) {
            responses['200'] = info.response;
          }
          if (Object.keys(responses).length === 0) {
            responses['200'] = {
              description: 'No return information has been specified.',
              content: returnType,
            };
          }

          op.responses = prepareResponsesFromSchemaLikes(responses, returnType, modelsToParse);

          appendArrayMetadata(OPENAPI_INTERNAL_MODELS_TO_PARSE, modelsToParse, target, propertyKey);
          Operation(op)(target, null, descriptor);
        }

        return nestDecorator(route)(target, propertyKey, descriptor);
      } catch (err) {
        throw new DefinitionError(
          `Failed to build handler for '${target.constructor.name}` +
          `#${propertyKey.toString()}':\n\n${err}`);
      }
    };
  };
}

export const Get = buildHandlerMethod(NestGet);
export const Post = buildHandlerMethod(NestPost);
export const Put = buildHandlerMethod(NestPut);
export const Delete = buildHandlerMethod(NestDelete);
export const Head = buildHandlerMethod(NestHead);
export const Patch = buildHandlerMethod(NestPatch);
