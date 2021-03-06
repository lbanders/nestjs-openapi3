import * as O3TS from 'openapi3-ts';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export type ValidationFailedResponseBuilder =
  (request: ExpressRequest, response: ExpressResponse, statusCode: number, failures: Array<string>) => {};

export type NoArgCtor<T = any> = new() => T;
export type Ctor<T = any> = new(...args: Array<any>) => T;

export type SchemaLikeSchemaObject =
  & O3TS.SchemaObject
  & {
    allOf: Array<O3TS.SchemaObject | O3TS.ReferenceObject | Ctor | SchemaLikeSchemaObject>;
    anyOf: Array<O3TS.SchemaObject | O3TS.ReferenceObject | Ctor | SchemaLikeSchemaObject>;
    oneOf: Array<O3TS.SchemaObject | O3TS.ReferenceObject | Ctor | SchemaLikeSchemaObject>;

    items: O3TS.SchemaObject | O3TS.ReferenceObject | Ctor | SchemaLikeSchemaObject;
  };

/**
 * In most places where OpenAPI expects a `SchemaObject` or a
 * `ReferenceObject`, this library attempts to accept a constructor
 * of a class tagged with `@OAS.Model`. These constructors will be
 * unwound into reference objects and the `OpenapiBuilder` will
 * record the type as one that needs to be processed later.
 */
export type SchemaLike =
  SchemaLikeSchemaObject | O3TS.SchemaObject | O3TS.ReferenceObject | Ctor |
  [SchemaLikeSchemaObject | O3TS.SchemaObject | O3TS.ReferenceObject | Ctor];
export type AllPropProperties =
  | 'nullable'
  | 'example'
  | 'description';

export type ScalarPropProperties =
  | 'type'
  | 'format'
  | 'allOf'
  | 'anyOf'
  | 'oneOf'
  | 'not'
  | 'pattern'
  | 'multipleOf'
  | 'maximum'
  | 'minimum'
  | 'exclusiveMaximum'
  | 'exclusiveMinimum'
  | 'enum'
  | 'properties'
  | 'additionalProperties'
  | 'default';
export type ScalarPropArgs =
  Pick<O3TS.SchemaObject, AllPropProperties> &
  Pick<O3TS.SchemaObject, ScalarPropProperties> &
  {
    oneOf?: Array<SchemaLike>,
    anyOf?: Array<SchemaLike>,
    allOf?: Array<SchemaLike>,
  };

export type ArrayPropProperties =
  | 'uniqueItems'
  | 'minItems'
  | 'maxItems';
export type ArrayPropArgs =
  & Pick<O3TS.SchemaObject, AllPropProperties>
  & Pick<O3TS.SchemaObject, ArrayPropProperties>
  & { items: SchemaLike };

export interface SimpleContentWithSchemaLike {
  content?: SchemaLike;
  multiContent?: { [mediaType: string]: SchemaLike };
}

export interface RequestBodyWithSchemaLike extends SimpleContentWithSchemaLike {
  description?: string;
  required?: boolean;
}

export type HeaderWithSchemaLike =
  O3TS.HeaderObject | { schema: SchemaLike };

export type MediaTypeWithSchemaLike =
  O3TS.MediaTypeObject | { schema: SchemaLike };

// tslint:disable-next-line: interface-over-type-literal
export type ContentsWithSchemaLike = { [mediatype: string]: MediaTypeWithSchemaLike };

export interface SimpleResponseWithSchemaLike extends SimpleContentWithSchemaLike {
  description?: string;
}

export interface OperationInfoArgs {
  summary?: string;
  deprecated?: boolean;
  description?: string;
  externalDocs?: O3TS.ExternalDocumentationObject;
  response?: SimpleResponseWithSchemaLike;
  responses?: { [statusCode: string]: SimpleResponseWithSchemaLike };
}
