var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import "dotenv/config";
import express from "express";

// src/lib/firebase-admin.ts
import admin from "firebase-admin";
var app;
function initFirebase() {
  if (admin.apps.length > 0) {
    app = admin.app();
    return app;
  }
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const jsonCred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonCred) {
    try {
      const cred = JSON.parse(jsonCred);
      const bucket = process.env.FIREBASE_STORAGE_BUCKET;
      app = admin.initializeApp({
        credential: admin.credential.cert(cred),
        ...bucket && { storageBucket: bucket }
      });
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT_JSON inv\xE1lido:", e);
      throw new Error("Configuraci\xF3n de Firebase inv\xE1lida");
    }
  } else if (credPath) {
    const bucket = process.env.FIREBASE_STORAGE_BUCKET;
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      ...bucket && { storageBucket: bucket }
    });
  } else {
    throw new Error(
      "Firebase no configurado. Defin\xED GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON) o FIREBASE_SERVICE_ACCOUNT_JSON (contenido JSON)."
    );
  }
  return app;
}
function getFirebaseAdmin() {
  if (!app) initFirebase();
  return admin;
}
function getAuth() {
  return getFirebaseAdmin().auth();
}
function getFirestore() {
  return getFirebaseAdmin().firestore();
}
function getStorage() {
  return getFirebaseAdmin().storage();
}
function getMessaging() {
  return getFirebaseAdmin().messaging();
}

// src/index.ts
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// src/routes/auth.ts
import { Router } from "express";

// src/lib/firestore.ts
var db = () => getFirestore();
var COLLECTIONS = {
  USERS: "users",
  USER_ONBOARDING: "userOnboarding",
  KYC_VERIFICATIONS: "kycVerifications",
  TICKET_LISTINGS: "ticketListings",
  ORDERS: "orders",
  ORDER_RATINGS: "orderRatings",
  DISPUTES: "disputes",
  DISPUTE_MESSAGES: "disputeMessages",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  PLATFORM_SETTINGS: "platformSettings"
};

// ../../packages/shared/src/constants.ts
var HORAS_MAX_TRANSFERENCIA_VENDEDOR = 72;

// ../../node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// ../../node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// ../../node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// ../../node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// ../../node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// ../../node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path3, errorMaps, issueData } = params;
  const fullPath = [...path3, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// ../../node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// ../../node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path3, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path3;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;

// ../../packages/shared/src/schemas.ts
var registerBase = external_exports.object({
  email: external_exports.string().email("Email inv\xE1lido"),
  password: external_exports.string().min(8, "M\xEDnimo 8 caracteres").regex(/[A-Z]/, "Al menos una may\xFAscula").regex(/[0-9]/, "Al menos un n\xFAmero"),
  confirmPassword: external_exports.string(),
  firstName: external_exports.string().min(1, "Nombre requerido"),
  lastName: external_exports.string().min(1, "Apellido requerido"),
  username: external_exports.string().min(2).optional(),
  country: external_exports.string().optional(),
  tipoDocumento: external_exports.string().optional(),
  documentNumber: external_exports.string().optional(),
  sexo: external_exports.enum(["MASC", "FEM", "X"]).optional(),
  phone: external_exports.string().optional(),
  phoneAreaCode: external_exports.string().optional(),
  phonePrefix: external_exports.string().optional(),
  dateOfBirth: external_exports.string().optional(),
  city: external_exports.string().optional(),
  province: external_exports.string().optional(),
  postalCode: external_exports.string().optional(),
  agreeTerms: external_exports.boolean().refine((v) => v === true, "Debes aceptar la pol\xEDtica de privacidad")
});
var registerSchema = registerBase.refine((d) => d.password === d.confirmPassword, { message: "Las contrase\xF1as no coinciden", path: ["confirmPassword"] });
var registerBodySchema = registerBase.omit({ confirmPassword: true, agreeTerms: true });
var loginSchema = external_exports.object({
  email: external_exports.string().min(1, "Email o nombre de usuario requerido"),
  password: external_exports.string().min(1, "Contrase\xF1a requerida")
});
var onboardingSchema = external_exports.object({
  accion: external_exports.array(external_exports.enum(["VENTA", "INTERCAMBIO"])).min(1, "Elige al menos una acci\xF3n"),
  ticketeras: external_exports.array(external_exports.string()).min(1, "Elige al menos una ticketera"),
  appsBoletos: external_exports.array(external_exports.string()).min(1, "Elige al menos una app de boletos")
});
var ticketeraEnum = external_exports.enum(["TICKETEK", "ALLACCESS", "TICKET_PLUS", "OTRA"]);
var appBoletosEnum = external_exports.enum(["QUENTRO", "ENIGMA", "OTRA"]);
var tipoEntradaEnum = external_exports.enum(["GENERAL", "CAMPO", "PLATEA", "VIP", "OTRO"]);
var categoriaEventoEnum = external_exports.enum(["MUSICA", "DEPORTES", "TEATRO", "FESTIVALES", "OTRO"]);
var createTicketListingSchema = external_exports.object({
  eventName: external_exports.string().min(2, "Nombre del evento requerido"),
  eventDate: external_exports.string().regex(/^\d{4}-\d{2}-\d{2}/),
  eventPlace: external_exports.string().optional(),
  sector: external_exports.string().optional(),
  row: external_exports.string().optional(),
  seat: external_exports.string().optional(),
  quantityEntries: external_exports.union([external_exports.string(), external_exports.number()]).optional(),
  tipoEntrada: tipoEntradaEnum,
  price: external_exports.number().positive("Precio debe ser positivo"),
  currency: external_exports.string().length(3).default("ARS"),
  ticketera: ticketeraEnum,
  appBoletos: appBoletosEnum,
  orderRef: external_exports.string().optional(),
  category: categoriaEventoEnum.optional()
});
var createOrderSchema = external_exports.object({
  ticketListingId: external_exports.string().uuid(),
  paymentMethod: external_exports.enum(["mercadopago", "stripe"])
});
var confirmReceivedSchema = external_exports.object({
  orderId: external_exports.string().uuid(),
  received: external_exports.boolean()
});
var openDisputeSchema = external_exports.object({
  orderId: external_exports.string().uuid(),
  reason: external_exports.string().min(10, "Describe el motivo de la disputa")
});

// src/middleware/auth.ts
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userDoc.exists) {
      res.status(401).json({ error: "Usuario no encontrado" });
      return;
    }
    const data = userDoc.data();
    req.user = {
      id: decoded.uid,
      email: decoded.email || data.email || "",
      role: data.role || "user"
    };
    next();
  } catch {
    res.status(401).json({ error: "Token inv\xE1lido o expirado" });
  }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Acceso denegado" });
    return;
  }
  next();
}

// src/routes/auth.ts
var router = Router();
router.post("/register", async (req, res) => {
  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.flatten() });
    return;
  }
  const {
    email,
    password,
    firstName,
    lastName,
    username,
    country,
    tipoDocumento,
    documentNumber,
    sexo,
    phone,
    phoneAreaCode,
    phonePrefix,
    dateOfBirth,
    city,
    province,
    postalCode
  } = parsed.data;
  const auth = getAuth();
  const usersRef = db().collection(COLLECTIONS.USERS);
  const existingByEmail = await usersRef.where("email", "==", email).limit(1).get();
  if (!existingByEmail.empty) {
    res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    return;
  }
  if (username) {
    const existingByUsername = await usersRef.where("username", "==", username).limit(1).get();
    if (!existingByUsername.empty) {
      res.status(409).json({ error: "Ya existe un usuario con ese nombre de usuario" });
      return;
    }
  }
  const fullPhone = phone ? [phonePrefix || "+549", phoneAreaCode || "", phone].filter(Boolean).join(" ").trim() : null;
  const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
  let firebaseUser;
  try {
    firebaseUser = await auth.createUser({
      email,
      password,
      displayName: [firstName, lastName].filter(Boolean).join(" ").trim() || void 0
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear usuario";
    if (msg.includes("email-already-exists")) {
      res.status(409).json({ error: "Ya existe una cuenta con ese email" });
      return;
    }
    res.status(500).json({ error: msg });
    return;
  }
  const uid = firebaseUser.uid;
  const userData = {
    email,
    username: username || null,
    numeroId,
    firstName: firstName || null,
    lastName: lastName || null,
    country: country || null,
    tipoDocumento: tipoDocumento || null,
    documentNumber: documentNumber || null,
    sexo: sexo || null,
    phone: fullPhone || phone || null,
    phoneVerified: false,
    city: city || null,
    province: province || null,
    postalCode: postalCode || null,
    role: "user",
    emailVerified: false,
    reputationScore: 0,
    profileImageUrl: null,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  await db().collection(COLLECTIONS.USERS).doc(uid).set(userData);
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(uid).set({
    userId: uid,
    status: "PENDIENTE",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  const customToken = await auth.createCustomToken(uid);
  res.status(201).json({
    user: {
      id: uid,
      email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
    },
    customToken,
    accessToken: customToken
    // Alias para compatibilidad - cliente debe usar signInWithCustomToken
  });
});
router.get("/username/check", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: "M\xEDnimo 2 caracteres" });
    return;
  }
  const existing = await db().collection(COLLECTIONS.USERS).where("username", "==", q).limit(1).get();
  if (existing.empty) {
    return res.json({ available: true });
  }
  const base = q.replace(/\d+$/, "") || q;
  const suggestions = [];
  for (let i = 1; i <= 999 && suggestions.length < 3; i++) {
    const candidate = `${base}${i}`;
    if (candidate !== q) {
      const taken = await db().collection(COLLECTIONS.USERS).where("username", "==", candidate).limit(1).get();
      if (taken.empty) suggestions.push(candidate);
    }
  }
  res.json({ available: false, suggestions });
});
router.post("/login", async (_req, res) => {
  res.status(400).json({
    error: "Us\xE1 Firebase Auth en el cliente: signInWithEmailAndPassword(email, password). Luego envi\xE1 el idToken en Authorization."
  });
});
router.get("/me", requireAuth, async (req, res) => {
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
  if (!userDoc.exists) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  const data = userDoc.data();
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(req.user.id).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  res.json({
    id: req.user.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    country: data.country,
    tipoDocumento: data.tipoDocumento,
    sexo: data.sexo,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    role: data.role,
    reputationScore: data.reputationScore ?? 0,
    createdAt: data.createdAt,
    kyc: kyc ? { status: kyc.status } : { status: "PENDIENTE" }
  });
});
var authRouter = router;

// src/routes/users.ts
import { Router as Router2 } from "express";
import multer from "multer";

// src/lib/firebase-storage.ts
var BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || "";
function getStorageBucket() {
  const storage = getStorage();
  const bucketName = BUCKET_NAME || storage.app.options.storageBucket;
  if (!bucketName) {
    throw new Error("FIREBASE_STORAGE_BUCKET no configurado. Definilo en .env");
  }
  return storage.bucket(bucketName);
}
async function uploadFile(path3, buffer, contentType) {
  const bucket = getStorageBucket();
  const file = bucket.file(path3);
  await file.save(buffer, { metadata: { contentType } });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${path3}`;
}

// src/lib/didit.ts
var DIDIT_BASE = "https://verification.didit.me";
var DIDIT_API_KEY = process.env.DIDIT_API_KEY;
var DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;
async function createDiditSession(params) {
  if (!DIDIT_API_KEY) {
    throw new Error("DIDIT_API_KEY no configurado. Configur\xE1 en business.didit.me y en .env");
  }
  if (!DIDIT_WORKFLOW_ID) {
    throw new Error(
      "DIDIT_WORKFLOW_ID no configurado. Cre\xE1 un workflow en business.didit.me \u2192 Verifications \u2192 Workflows y copi\xE1 el ID."
    );
  }
  const body = {
    workflow_id: DIDIT_WORKFLOW_ID,
    callback: params.callback,
    vendor_data: params.vendor_data,
    ...params.features && { features: params.features }
  };
  const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": DIDIT_API_KEY
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data?.detail || JSON.stringify(data);
    throw new Error(`Didit: ${msg}`);
  }
  if (!data.url) {
    const url = data.session_url || (data.session_token ? `https://verify.didit.me/session/${data.session_token}` : null);
    if (!url) throw new Error("Didit no devolvi\xF3 URL de sesi\xF3n");
    return { ...data, url };
  }
  return data;
}
async function verifyDiditWebhookSignature(rawBody, signature, timestamp, secretKey) {
  if (!signature || !timestamp || !secretKey) return false;
  const WEBHOOK_MAX_AGE_SEC = 300;
  const currentTime = Math.floor(Date.now() / 1e3);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;
  const crypto2 = await import("crypto");
  const hmac = crypto2.createHmac("sha256", secretKey);
  const expectedSignature = hmac.update(rawBody).digest("hex");
  try {
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(signature, "utf8");
    return expectedBuf.length === providedBuf.length && crypto2.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

// src/lib/mercadopago.ts
import crypto from "crypto";
import { MercadoPagoConfig, Preference, Payment, Customer } from "mercadopago";

// src/lib/settings.ts
var DEFAULTS = {
  commissionPercentage: 6.5,
  mercadopago: {
    enabled: false,
    accessToken: "",
    publicKey: "",
    webhookSecret: "",
    sandboxMode: true,
    backUrlBase: ""
  },
  users: {},
  visual: {}
};
var SETTINGS_DOC_ID = "main";
var cachedSettings = null;
var cacheExpiry = 0;
var CACHE_TTL_MS = 3e4;
async function getPlatformSettings() {
  if (cachedSettings && Date.now() < cacheExpiry) {
    return cachedSettings;
  }
  const doc = await db().collection(COLLECTIONS.PLATFORM_SETTINGS).doc(SETTINGS_DOC_ID).get();
  if (!doc.exists) {
    cachedSettings = { ...DEFAULTS };
    return cachedSettings;
  }
  const d = doc.data();
  cachedSettings = {
    commissionPercentage: d.commissionPercentage ?? DEFAULTS.commissionPercentage,
    mercadopago: {
      enabled: d.mercadopago?.enabled ?? DEFAULTS.mercadopago.enabled,
      accessToken: d.mercadopago?.accessToken ?? "",
      publicKey: d.mercadopago?.publicKey ?? "",
      webhookSecret: d.mercadopago?.webhookSecret ?? "",
      sandboxMode: d.mercadopago?.sandboxMode ?? true,
      backUrlBase: d.mercadopago?.backUrlBase ?? ""
    },
    users: d.users ?? {},
    visual: d.visual ?? {},
    updatedAt: d.updatedAt?.toDate?.() ?? void 0
  };
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedSettings;
}
function invalidateSettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}
async function getCommissionPercentage() {
  const s = await getPlatformSettings();
  return s.commissionPercentage;
}

// src/lib/mercadopago.ts
var client = null;
var preferenceClient = null;
var paymentClient = null;
var customerClient = null;
var lastToken = "";
function getAccessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || "";
}
async function getMercadoPagoClient() {
  const settings = await getPlatformSettings();
  const fromFirestore = settings.mercadopago.enabled && settings.mercadopago.accessToken;
  const token = fromFirestore ? settings.mercadopago.accessToken : getAccessToken();
  if (!token) {
    throw new Error("Mercado Pago no configurado. Configur\xE1 el Access Token en Admin \u2192 Configuraci\xF3n \u2192 Pasarelas de Pago.");
  }
  if (settings.mercadopago.sandboxMode && !fromFirestore) {
    throw new Error(
      "Modo prueba activo: us\xE1 las credenciales desde Admin/Firestore (platformSettings/main). No uses variables de entorno con credenciales de producci\xF3n."
    );
  }
  if (!client || lastToken !== token) {
    lastToken = token;
    client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 5e3 }
    });
    preferenceClient = new Preference(client);
    paymentClient = new Payment(client);
    customerClient = new Customer(client);
  }
  if (!preferenceClient || !paymentClient || !customerClient) throw new Error("MP clients no inicializados");
  return { client, preference: preferenceClient, payment: paymentClient, customer: customerClient };
}
async function isMercadoPagoConfigured() {
  const settings = await getPlatformSettings();
  if (settings.mercadopago.enabled && settings.mercadopago.accessToken) return true;
  return !!getAccessToken();
}
async function getMercadoPagoWebhookSecret() {
  const settings = await getPlatformSettings();
  if (settings.mercadopago.webhookSecret) return settings.mercadopago.webhookSecret;
  return process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
}
async function createCheckoutPreference(params) {
  const { preference } = await getMercadoPagoClient();
  const settings = await getPlatformSettings();
  const backBase = settings.mercadopago.backUrlBase || process.env.WEB_URL || process.env.APP_DEEP_LINK_SCHEME || "http://localhost:5173";
  const basePath = backBase.replace(/\/$/, "");
  const isDeepLink = basePath.includes("://") && !basePath.startsWith("http");
  const success = isDeepLink ? `${basePath}orden/${params.orderId}/pago?status=success` : `${basePath}/orden/${params.orderId}/pago?status=success`;
  const failure = isDeepLink ? `${basePath}orden/${params.orderId}/pago?status=failure` : `${basePath}/orden/${params.orderId}/pago?status=failure`;
  const pending = isDeepLink ? `${basePath}orden/${params.orderId}/pago?status=pending` : `${basePath}/orden/${params.orderId}/pago?status=pending`;
  const pref = await preference.create({
    body: {
      items: [
        {
          id: params.orderId,
          title: params.title,
          quantity: params.quantity ?? 1,
          unit_price: params.unitPrice,
          currency_id: params.currency === "ARS" ? "ARS" : "ARS"
        }
      ],
      external_reference: params.orderId,
      back_urls: {
        success,
        failure,
        pending
      },
      auto_return: "approved",
      payer: params.payerEmail ? { email: params.payerEmail } : void 0
    }
  });
  const initPoint = pref.init_point;
  const preferenceId = pref.id;
  if (!initPoint || !preferenceId) {
    throw new Error("MercadoPago no devolvi\xF3 init_point");
  }
  return { initPoint, preferenceId };
}
async function getPaymentById(paymentId) {
  try {
    const { payment } = await getMercadoPagoClient();
    const result = await payment.get({ id: paymentId });
    return result;
  } catch {
    return null;
  }
}
function verifyMercadoPagoWebhookSignature(dataId, xRequestId, ts, secret, receivedHash) {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return hash === receivedHash;
}
async function getMercadoPagoPublicKey() {
  const settings = await getPlatformSettings();
  const pk = settings.mercadopago.publicKey || process.env.MERCADOPAGO_PUBLIC_KEY || "";
  if (!pk) throw new Error("Mercado Pago Public Key no configurado. Configur\xE1 en Admin \u2192 Pasarelas.");
  return pk;
}
function getCustomerEmailForMp(userId, email, sandboxMode) {
  if (!sandboxMode) return email;
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  return `test_${safe}@testuser.com`;
}
async function getOrCreateCustomer(userId, email, sandboxMode = false) {
  const { customer } = await getMercadoPagoClient();
  const mpEmail = getCustomerEmailForMp(userId, email, sandboxMode);
  const search = await customer.search({ options: { email: mpEmail } });
  const results = search.results;
  if (results && results.length > 0) return results[0].id;
  const created = await customer.create({ body: { email: mpEmail } });
  return created.id;
}
async function addCardToCustomer(customerId, token) {
  const { customer } = await getMercadoPagoClient();
  const card = await customer.createCard({ customerId, body: { token } });
  const c = card;
  return {
    id: c.id,
    last_four_digits: c.last_four_digits || c.last4 || "****",
    payment_method: c.payment_method || { id: "credit_card", name: "Tarjeta" }
  };
}
async function listCustomerCards(customerId) {
  const { customer } = await getMercadoPagoClient();
  const result = await customer.listCards({ customerId });
  const cards = result?.data || [];
  return cards.map((c) => ({
    id: String(c.id),
    last_four_digits: String(c.last_four_digits || c.last4 || "****"),
    payment_method: c.payment_method || { id: "credit_card", name: "Tarjeta" }
  }));
}
async function removeCustomerCard(customerId, cardId) {
  const { customer } = await getMercadoPagoClient();
  await customer.removeCard({ customerId, cardId });
}
async function createPaymentWithToken(params) {
  const { payment } = await getMercadoPagoClient();
  const body = {
    transaction_amount: params.amount,
    token: params.token,
    payment_method_id: params.paymentMethodId,
    payer: { email: params.payerEmail },
    external_reference: params.orderId,
    description: params.title,
    installments: 1
  };
  if (params.issuerId) body.issuer_id = params.issuerId;
  const result = await payment.create({ body });
  return result;
}

// src/routes/users.ts
var MSG_CREDENTIALES_TEST = "Us\xE1 credenciales de PRUEBA (Test) en Mercado Pago. Las credenciales de producci\xF3n no funcionan con tarjetas de test. Verific\xE1: 1) platformSettings/main en Firestore tiene accessToken y publicKey de prueba. 2) En Railway, elimin\xE1 MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_PUBLIC_KEY si existen (la API usa Firestore cuando est\xE1n en Admin).";
function isLiveCredentialsError(e) {
  const cause = e?.cause;
  const list = Array.isArray(cause) ? cause : cause?.body?.cause;
  if (!Array.isArray(list)) return false;
  return list.some(
    (c) => c?.code === "300" || c?.description?.toLowerCase().includes("live credentials")
  );
}
function extractMpError(e) {
  const err = e;
  const cause = err?.cause;
  const causeList = Array.isArray(cause) ? cause : cause?.body?.cause;
  if (Array.isArray(causeList)) {
    const code300 = causeList.find(
      (c) => c?.code === "300" || c?.description?.toLowerCase().includes("live credentials")
    );
    if (code300) return MSG_CREDENTIALES_TEST;
  }
  const body = cause?.body;
  const fromBody = body?.message;
  const fromCause = cause?.message;
  const fromMsg = err?.message;
  return (fromBody || fromCause || fromMsg) ?? null;
}
var router2 = Router2();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
router2.use(requireAuth);
router2.get("/profile", async (req, res) => {
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
  if (!userDoc.exists) return res.status(404).json({ error: "No encontrado" });
  let data = userDoc.data();
  if (!data.numeroId) {
    const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
    await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({ numeroId, updatedAt: /* @__PURE__ */ new Date() });
    data = { ...data, numeroId };
  }
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(req.user.id).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  const phone = data.phone?.replace(/\+549\s*\+549/, "+549") ?? data.phone;
  res.json({
    id: req.user.id,
    email: data.email,
    username: data.username ?? null,
    numeroId: data.numeroId ?? null,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    country: data.country ?? null,
    tipoDocumento: data.tipoDocumento ?? null,
    phone,
    phoneVerified: data.phoneVerified ?? false,
    dateOfBirth: data.dateOfBirth ?? null,
    city: data.city ?? null,
    province: data.province ?? null,
    postalCode: data.postalCode ?? null,
    address: data.address ?? null,
    reputationScore: data.reputationScore ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    kyc: kyc ? { status: kyc.status, rejectionReason: kyc.rejectionReason ?? null } : { status: "PENDIENTE", rejectionReason: null }
  });
});
router2.post("/phone/verify-request", async (req, res) => {
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : null;
  if (!phone || phone.length < 8) {
    res.status(400).json({ error: "N\xFAmero de tel\xE9fono requerido" });
    return;
  }
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
    phone,
    phoneVerified: false,
    phoneVerificationCode: code,
    phoneVerificationExpires: expiresAt,
    updatedAt: /* @__PURE__ */ new Date()
  });
  if (process.env.SMS_PROVIDER === "twilio" && process.env.TWILIO_ACCOUNT_SID) {
    console.log("[SMS] C\xF3digo para", phone, ":", code);
  } else {
    console.log("[DEV] C\xF3digo de verificaci\xF3n para", phone, ":", code);
  }
  res.json({ ok: true, message: "C\xF3digo enviado" });
});
router2.post("/phone/verify-confirm", async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : null;
  if (!code || code.length !== 6) {
    res.status(400).json({ error: "C\xF3digo de 6 d\xEDgitos requerido" });
    return;
  }
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
  const data = userDoc.data();
  if (!data?.phoneVerificationCode || !data?.phoneVerificationExpires) {
    res.status(400).json({ error: "Solicit\xE1 primero un c\xF3digo de verificaci\xF3n" });
    return;
  }
  if (/* @__PURE__ */ new Date() > data.phoneVerificationExpires.toDate()) {
    res.status(400).json({ error: "El c\xF3digo expir\xF3. Solicit\xE1 uno nuevo." });
    return;
  }
  if (data.phoneVerificationCode !== code) {
    res.status(400).json({ error: "C\xF3digo incorrecto" });
    return;
  }
  await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
    phoneVerified: true,
    phoneVerificationCode: null,
    phoneVerificationExpires: null,
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ ok: true, phoneVerified: true });
});
router2.post("/profile/avatar", upload.single("avatar"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No se envi\xF3 ninguna imagen" });
    return;
  }
  const ext = file.originalname.split(".").pop() || "jpg";
  const path3 = `avatars/${req.user.id}/${Date.now()}.${ext}`;
  const profileImageUrl = await uploadFile(path3, file.buffer, file.mimetype || "image/jpeg");
  await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
    profileImageUrl,
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ profileImageUrl });
});
router2.patch("/profile", async (req, res) => {
  const body = req.body || {};
  const { username, firstName, lastName, phone, city, province, postalCode, address, fcmToken } = body;
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (firstName !== void 0) updateData.firstName = firstName;
  if (lastName !== void 0) updateData.lastName = lastName;
  if (phone !== void 0) updateData.phone = phone;
  if (city !== void 0) updateData.city = city;
  if (province !== void 0) updateData.province = province;
  if (postalCode !== void 0) updateData.postalCode = postalCode;
  if (address !== void 0) updateData.address = typeof address === "string" ? address.trim() || null : null;
  if (fcmToken !== void 0) updateData.fcmToken = fcmToken;
  if (username !== void 0) {
    const usernameVal = typeof username === "string" ? username.trim() : "";
    if (usernameVal) {
      const existing = await db().collection(COLLECTIONS.USERS).where("username", "==", usernameVal).get();
      const takenByOther = existing.docs.some((d) => d.id !== req.user.id);
      if (takenByOther) {
        res.status(409).json({ error: "Ya existe un usuario con ese nombre de usuario" });
        return;
      }
    }
    updateData.username = usernameVal || null;
  }
  await db().collection(COLLECTIONS.USERS).doc(req.user.id).update(updateData);
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
  const data = userDoc.data();
  res.json({
    id: req.user.id,
    email: data.email,
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address ?? null
  });
});
router2.post("/onboarding", async (req, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.flatten() });
    return;
  }
  const { accion, ticketeras, appsBoletos } = parsed.data;
  const ref = db().collection(COLLECTIONS.USER_ONBOARDING).doc(req.user.id);
  const existing = await ref.get();
  await ref.set(
    {
      userId: req.user.id,
      accion,
      ticketeras,
      appsBoletos,
      ...existing.exists ? {} : { createdAt: /* @__PURE__ */ new Date() },
      updatedAt: /* @__PURE__ */ new Date()
    },
    { merge: true }
  );
  res.json({ ok: true });
});
router2.get("/onboarding", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.USER_ONBOARDING).doc(req.user.id).get();
  if (!doc.exists) return res.json(null);
  const data = doc.data();
  res.json({
    id: doc.id,
    userId: data.userId,
    accion: data.accion || [],
    ticketeras: data.ticketeras || [],
    appsBoletos: data.appsBoletos || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  });
});
router2.post(
  "/kyc/upload",
  upload.fields([
    { name: "dniFront", maxCount: 1 },
    { name: "dniBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]),
  async (req, res) => {
    const files = req.files;
    const uid = req.user.id;
    const updates = { status: "EN_REVISION", updatedAt: /* @__PURE__ */ new Date() };
    if (files.dniFront?.[0]) {
      const path3 = `kyc/${uid}/dni_front_${Date.now()}.jpg`;
      updates.dniFrontUrl = await uploadFile(path3, files.dniFront[0].buffer, files.dniFront[0].mimetype || "image/jpeg");
    }
    if (files.dniBack?.[0]) {
      const path3 = `kyc/${uid}/dni_back_${Date.now()}.jpg`;
      updates.dniBackUrl = await uploadFile(path3, files.dniBack[0].buffer, files.dniBack[0].mimetype || "image/jpeg");
    }
    if (files.selfie?.[0]) {
      const path3 = `kyc/${uid}/selfie_${Date.now()}.jpg`;
      updates.selfieUrl = await uploadFile(path3, files.selfie[0].buffer, files.selfie[0].mimetype || "image/jpeg");
    }
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(uid).set(updates, { merge: true });
    res.json({ ok: true, status: "EN_REVISION" });
  }
);
router2.get("/kyc", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(req.user.id).get();
  if (!doc.exists) return res.json({ status: "PENDIENTE" });
  const data = doc.data();
  res.json({ status: data.status || "PENDIENTE", rejectionReason: data.rejectionReason ?? null });
});
router2.post("/kyc/session", async (req, res) => {
  const userId = req.user.id;
  const webUrl = process.env.WEB_URL || process.env.APP_URL || "http://localhost:5173";
  const platform = req.body?.platform || "web";
  const callback = platform === "mobile" ? "ticketTransfer://kyc/callback" : `${webUrl.replace(/\/$/, "")}/kyc/callback`;
  try {
    const session = await createDiditSession({
      callback,
      vendor_data: userId,
      features: "OCR + FACE"
    });
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      { diditSessionId: session.session_id, updatedAt: /* @__PURE__ */ new Date() },
      { merge: true }
    );
    res.json({ url: session.url, sessionId: session.session_id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear sesi\xF3n Didit";
    res.status(500).json({ error: msg });
  }
});
router2.get("/cards", async (req, res) => {
  const doList = async () => {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
    const userData = userDoc.data();
    const email = userData?.email;
    if (!email || typeof email !== "string") {
      throw new Error("Usuario sin email");
    }
    const settings = await getPlatformSettings();
    const customerId = await getOrCreateCustomer(req.user.id, email, settings.mercadopago.sandboxMode);
    if (!userData?.mpCustomerId) {
      await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
        mpCustomerId: customerId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    return listCustomerCards(customerId);
  };
  try {
    const cards = await doList();
    res.json({ cards });
  } catch (e) {
    if (e instanceof Error && e.message === "Usuario sin email") {
      return res.status(400).json({ error: e.message });
    }
    if (isLiveCredentialsError(e)) {
      invalidateSettingsCache();
      try {
        const cards = await doList();
        return res.json({ cards });
      } catch (retryErr) {
        const msg2 = retryErr instanceof Error && retryErr.message === "Usuario sin email" ? retryErr.message : extractMpError(retryErr) || MSG_CREDENTIALES_TEST;
        if (retryErr instanceof Error && retryErr.message === "Usuario sin email") {
          return res.status(400).json({ error: msg2 });
        }
        console.error("[GET /cards] retry failed:", retryErr);
        return res.status(500).json({ error: msg2 });
      }
    }
    const msg = extractMpError(e) || (e instanceof Error ? e.message : "Error al listar tarjetas");
    console.error("[GET /cards]", e);
    res.status(500).json({ error: msg });
  }
});
router2.post("/cards", async (req, res) => {
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : null;
  if (!token) {
    return res.status(400).json({ error: "Token de tarjeta requerido" });
  }
  const doAdd = async () => {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
    const userData = userDoc.data();
    const email = userData?.email;
    if (!email || typeof email !== "string") {
      throw new Error("Usuario sin email");
    }
    const settings = await getPlatformSettings();
    const customerId = await getOrCreateCustomer(req.user.id, email, settings.mercadopago.sandboxMode);
    if (!userData?.mpCustomerId) {
      await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
        mpCustomerId: customerId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    return addCardToCustomer(customerId, token);
  };
  try {
    const card = await doAdd();
    res.status(201).json({ card });
  } catch (e) {
    if (e instanceof Error && e.message === "Usuario sin email") {
      return res.status(400).json({ error: e.message });
    }
    if (isLiveCredentialsError(e)) {
      invalidateSettingsCache();
      try {
        const card = await doAdd();
        return res.status(201).json({ card });
      } catch (retryErr) {
        if (retryErr instanceof Error && retryErr.message === "Usuario sin email") {
          return res.status(400).json({ error: retryErr.message });
        }
        const msg2 = extractMpError(retryErr) || MSG_CREDENTIALES_TEST;
        console.error("[POST /cards] retry failed:", retryErr);
        return res.status(500).json({ error: msg2 });
      }
    }
    const msg = extractMpError(e) || (e instanceof Error ? e.message : "Error al agregar tarjeta");
    console.error("[POST /cards]", e);
    res.status(500).json({ error: msg });
  }
});
router2.delete("/cards/:cardId", async (req, res) => {
  const cardId = req.params.cardId;
  if (!cardId) return res.status(400).json({ error: "ID de tarjeta requerido" });
  try {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
    const mpCustomerId = userDoc.data()?.mpCustomerId;
    if (!mpCustomerId) {
      return res.status(404).json({ error: "No ten\xE9s tarjetas guardadas" });
    }
    await removeCustomerCard(mpCustomerId, cardId);
    res.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar tarjeta";
    res.status(500).json({ error: msg });
  }
});
var usersRouter = router2;

// src/routes/tickets.ts
import { Router as Router3 } from "express";
import multer2 from "multer";
var router3 = Router3();
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
router3.get("/", async (_req, res) => {
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").orderBy("createdAt", "desc").limit(50).get();
  const listings = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const sellerData = sellerDoc.data();
      const kycDoc = sellerDoc.exists ? await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(d.sellerId).get() : null;
      return {
        id: doc.id,
        ...d,
        seller: sellerData ? {
          id: d.sellerId,
          reputationScore: sellerData.reputationScore ?? 0,
          kyc: kycDoc?.exists ? { status: kycDoc.data()?.status } : { status: "PENDIENTE" }
        } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        eventDate: d.eventDate?.toDate?.() ?? d.eventDate
      };
    })
  );
  res.json(listings);
});
router3.get("/eventos", async (req, res) => {
  const { q, categoria, fecha } = req.query;
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").orderBy("eventDate", "asc").limit(200).get();
  let eventos = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      eventName: d.eventName,
      eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
      eventPlace: d.eventPlace,
      sector: d.sector,
      tipoEntrada: d.tipoEntrada,
      price: d.price,
      currency: d.currency,
      category: d.category
    };
  });
  if (typeof q === "string" && q) {
    const ql = q.toLowerCase();
    eventos = eventos.filter((e) => (e.eventName || "").toLowerCase().includes(ql));
  }
  if (typeof categoria === "string" && categoria) {
    eventos = eventos.filter((e) => e.category === categoria);
  }
  if (typeof fecha === "string" && fecha) {
    const fd = new Date(fecha).getTime();
    eventos = eventos.filter((e) => {
      const ed = e.eventDate instanceof Date ? e.eventDate.getTime() : new Date(e.eventDate).getTime();
      return ed >= fd;
    });
  }
  res.json(eventos.slice(0, 100));
});
router3.get("/:id", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.status !== "DISPONIBLE") return res.status(404).json({ error: "No encontrado" });
  const password = req.query.password;
  const pubPassword = d.publicationPassword;
  const showFull = !pubPassword || password && password === pubPassword;
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const sellerData = sellerDoc.data();
  const kycDoc = sellerDoc.exists ? await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(d.sellerId).get() : null;
  const out = {
    id: doc.id,
    ...d,
    seller: sellerData ? {
      id: d.sellerId,
      firstName: sellerData.firstName,
      lastName: sellerData.lastName,
      username: sellerData.username,
      reputationScore: sellerData.reputationScore ?? 0,
      phoneVerified: sellerData.phoneVerified ?? false,
      emailVerified: sellerData.emailVerified ?? false,
      kyc: kycDoc?.exists ? { status: kycDoc.data()?.status } : { status: "PENDIENTE" }
    } : null,
    showFull,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate
  };
  if (!showFull) {
    delete out.captureTicketUrl;
    delete out.captureOwnershipUrl;
    delete out.orderRef;
  }
  res.json(out);
});
router3.post(
  "/",
  requireAuth,
  upload2.fields([
    { name: "captureTicket", maxCount: 1 },
    { name: "captureOwnership", maxCount: 1 }
  ]),
  async (req, res) => {
    const body = { ...req.body, price: req.body.price != null ? Number(req.body.price) : void 0 };
    const parsed = createTicketListingSchema.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.flatten() });
      return;
    }
    const files = req.files;
    const listingId = db().collection(COLLECTIONS.TICKET_LISTINGS).doc().id;
    let captureTicketUrl;
    let captureOwnershipUrl;
    if (files.captureTicket?.[0]) {
      captureTicketUrl = await uploadFile(
        `tickets/${listingId}/capture_${Date.now()}.jpg`,
        files.captureTicket[0].buffer,
        files.captureTicket[0].mimetype || "image/jpeg"
      );
    }
    if (files.captureOwnership?.[0]) {
      captureOwnershipUrl = await uploadFile(
        `tickets/${listingId}/ownership_${Date.now()}.jpg`,
        files.captureOwnership[0].buffer,
        files.captureOwnership[0].mimetype || "image/jpeg"
      );
    }
    const publicationPassword = req.body.publicationPassword || void 0;
    const ticketeraOtra = req.body.ticketeraOtra || void 0;
    const appBoletosOtra = req.body.appBoletosOtra || void 0;
    const tipoEntradaOtro = req.body.tipoEntradaOtro || void 0;
    const quantityEntries = parsed.data.quantityEntries != null ? String(parsed.data.quantityEntries) : void 0;
    const listingData = {
      sellerId: req.user.id,
      eventName: parsed.data.eventName,
      eventDate: new Date(parsed.data.eventDate),
      eventPlace: parsed.data.eventPlace,
      sector: parsed.data.sector,
      row: parsed.data.row,
      seat: parsed.data.seat,
      quantityEntries: quantityEntries ?? null,
      tipoEntrada: parsed.data.tipoEntrada,
      price: parsed.data.price,
      currency: parsed.data.currency ?? "ARS",
      ticketera: parsed.data.ticketera,
      appBoletos: parsed.data.appBoletos,
      orderRef: parsed.data.orderRef,
      category: parsed.data.category ?? "OTRO",
      status: "PENDIENTE_VERIFICACION",
      captureTicketUrl,
      captureOwnershipUrl,
      publicationPassword,
      ticketeraOtra,
      appBoletosOtra,
      tipoEntradaOtro,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).set(listingData);
    const listing = { id: listingId, ...listingData };
    res.status(201).json(listing);
  }
);
router3.get("/my/listings", requireAuth, async (req, res) => {
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).where("sellerId", "==", req.user.id).orderBy("createdAt", "desc").get();
  const listings = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,
      createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
      updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
      eventDate: d.eventDate?.toDate?.() ?? d.eventDate
    };
  });
  res.json(listings);
});
router3.patch("/:id/pause", requireAuth, async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).update({ status: "PAUSADO", updatedAt: /* @__PURE__ */ new Date() });
  res.json({ ok: true });
});
router3.patch("/:id/activate", requireAuth, async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).update({ status: "DISPONIBLE", updatedAt: /* @__PURE__ */ new Date() });
  res.json({ ok: true });
});
var ticketsRouter = router3;

// src/routes/orders.ts
import { Router as Router4 } from "express";
import multer3 from "multer";
var router4 = Router4();
var upload3 = multer3({
  storage: multer3.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
router4.use(requireAuth);
router4.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.flatten() });
    return;
  }
  const { ticketListingId, paymentMethod } = parsed.data;
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(ticketListingId).get();
  if (!listingDoc.exists) {
    res.status(404).json({ error: "Ticket no disponible" });
    return;
  }
  const listing = listingDoc.data();
  if (listing.status !== "DISPONIBLE") {
    res.status(404).json({ error: "Ticket no disponible" });
    return;
  }
  if (listing.sellerId === req.user.id) {
    res.status(400).json({ error: "No puedes comprar tu propio ticket" });
    return;
  }
  const commissionRate = await getCommissionPercentage() / 100;
  const commissionAmount = listing.price * commissionRate;
  const totalAmount = listing.price + commissionAmount;
  const transferDeadline = /* @__PURE__ */ new Date();
  transferDeadline.setHours(transferDeadline.getHours() + HORAS_MAX_TRANSFERENCIA_VENDEDOR);
  const orderId = db().collection(COLLECTIONS.ORDERS).doc().id;
  const orderData = {
    ticketListingId,
    buyerId: req.user.id,
    sellerId: listing.sellerId,
    status: "PENDIENTE_PAGO",
    totalAmount,
    commissionAmount,
    currency: listing.currency || "ARS",
    paymentMethod,
    transferDeadline,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  await db().collection(COLLECTIONS.ORDERS).doc(orderId).set(orderData);
  let checkoutUrl;
  if (paymentMethod === "mercadopago" && await isMercadoPagoConfigured()) {
    try {
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
      const { initPoint, preferenceId: prefId } = await createCheckoutPreference({
        orderId,
        title: listing.eventName || "Ticket",
        unitPrice: totalAmount,
        quantity: 1,
        currency: listing.currency || "ARS",
        payerEmail: buyerDoc.data()?.email
      });
      checkoutUrl = initPoint;
      await db().collection(COLLECTIONS.ORDERS).doc(orderId).update({
        mercadopagoPreferenceId: prefId,
        mercadopagoCheckoutUrl: initPoint,
        updatedAt: /* @__PURE__ */ new Date()
      });
    } catch (e) {
      console.error("Error creando preferencia MercadoPago:", e);
      res.status(500).json({ error: "No se pudo iniciar el checkout. Intent\xE1 de nuevo." });
      return;
    }
  } else if (paymentMethod === "stripe") {
    res.status(400).json({ error: "Stripe a\xFAn no est\xE1 disponible. Us\xE1 Mercado Pago." });
    return;
  } else if (paymentMethod === "mercadopago" && !await isMercadoPagoConfigured()) {
    res.status(503).json({ error: "Mercado Pago no est\xE1 configurado. Contact\xE1 al administrador." });
    return;
  }
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(listing.sellerId).get();
  const order = {
    id: orderId,
    ...orderData,
    ticketListing: { id: listingDoc.id, ...listing },
    seller: { id: listing.sellerId, email: sellerDoc.data()?.email }
  };
  res.status(201).json({
    order,
    paymentNeeded: !!checkoutUrl,
    checkoutUrl: checkoutUrl ?? void 0
  });
});
router4.get("/my/purchases", async (req, res) => {
  const snap = await db().collection(COLLECTIONS.ORDERS).where("buyerId", "==", req.user.id).orderBy("createdAt", "desc").get();
  const orders = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      return {
        id: doc.id,
        ...d,
        ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
        seller: sellerDoc.exists ? { id: d.sellerId, reputationScore: sellerDoc.data()?.reputationScore } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline
      };
    })
  );
  res.json(orders);
});
router4.get("/my/sales", async (req, res) => {
  const snap = await db().collection(COLLECTIONS.ORDERS).where("sellerId", "==", req.user.id).orderBy("createdAt", "desc").get();
  const orders = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
      return {
        id: doc.id,
        ...d,
        ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
        buyer: buyerDoc.exists ? { id: d.buyerId, email: buyerDoc.data()?.email } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline
      };
    })
  );
  res.json(orders);
});
router4.get("/:id/checkout-url", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  if (d.status !== "PENDIENTE_PAGO") return res.status(400).json({ error: "La orden ya no est\xE1 pendiente de pago" });
  if (d.paymentMethod !== "mercadopago") return res.status(400).json({ error: "Solo Mercado Pago soporta checkout URL" });
  let checkoutUrl = d.mercadopagoCheckoutUrl;
  if (!checkoutUrl && await isMercadoPagoConfigured()) {
    try {
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const listing = listingDoc.data();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
      const { initPoint, preferenceId: prefId } = await createCheckoutPreference({
        orderId: req.params.id,
        title: listing.eventName || "Ticket",
        unitPrice: d.totalAmount,
        quantity: 1,
        currency: d.currency || "ARS",
        payerEmail: buyerDoc.data()?.email
      });
      checkoutUrl = initPoint;
      await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({
        mercadopagoPreferenceId: prefId,
        mercadopagoCheckoutUrl: initPoint,
        updatedAt: /* @__PURE__ */ new Date()
      });
    } catch (e) {
      console.error("Error creando preferencia MercadoPago:", e);
      return res.status(500).json({ error: "No se pudo generar el link de pago" });
    }
  }
  if (!checkoutUrl) return res.status(503).json({ error: "Mercado Pago no configurado" });
  res.json({ checkoutUrl });
});
router4.get("/:id", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id && d.sellerId !== req.user.id) {
    return res.status(404).json({ error: "No encontrado" });
  }
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  res.json({
    id: doc.id,
    ...d,
    ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
    buyer: buyerDoc.exists ? { id: d.buyerId, email: buyerDoc.data()?.email } : null,
    seller: sellerDoc.exists ? { id: d.sellerId, email: sellerDoc.data()?.email } : null,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline,
    checkoutUrl: d.mercadopagoCheckoutUrl ?? void 0
  });
});
router4.post("/:id/pay", async (req, res) => {
  const orderId = req.params.id;
  const { token, paymentMethodId, issuerId } = req.body || {};
  if (!token || typeof token !== "string" || !paymentMethodId || typeof paymentMethodId !== "string") {
    return res.status(400).json({ error: "Se requieren token y paymentMethodId (ej: visa, master)" });
  }
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  if (d.status !== "PENDIENTE_PAGO") {
    return res.status(400).json({ error: "La orden ya no est\xE1 pendiente de pago" });
  }
  if (d.paymentMethod !== "mercadopago") {
    return res.status(400).json({ error: "Solo Mercado Pago soporta pago con tarjeta" });
  }
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
  const payerEmail = buyerDoc.data()?.email;
  if (!payerEmail) return res.status(400).json({ error: "Usuario sin email" });
  let title = "Orden";
  if (d.ticketListingId) {
    const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
    title = listingDoc.data()?.eventName || "Ticket";
  }
  try {
    const payment = await createPaymentWithToken({
      orderId,
      title,
      amount: d.totalAmount,
      payerEmail,
      token,
      paymentMethodId,
      issuerId: typeof issuerId === "number" ? issuerId : void 0
    });
    await db().collection(COLLECTIONS.ORDERS).doc(orderId).update({
      mercadopagoPaymentId: payment.id,
      status: payment.status === "approved" ? "ESPERANDO_TRANSFERENCIA" : d.status,
      updatedAt: /* @__PURE__ */ new Date()
    });
    res.json({
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      orderStatus: payment.status === "approved" ? "ESPERANDO_TRANSFERENCIA" : d.status
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al procesar el pago";
    res.status(500).json({ error: msg });
  }
});
router4.post("/:id/confirm-payment", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id || d.status !== "PENDIENTE_PAGO") return res.status(404).json({ error: "No encontrado" });
  if (d.paymentMethod === "mercadopago") {
    return res.status(400).json({
      error: 'El pago se confirma al completar el checkout de Mercado Pago. Us\xE1 el bot\xF3n "Pagar con Mercado Pago".'
    });
  }
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({ status: "ESPERANDO_TRANSFERENCIA", updatedAt: /* @__PURE__ */ new Date() });
  res.json({ ok: true, status: "ESPERANDO_TRANSFERENCIA" });
});
router4.post("/:id/transfer-done", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.sellerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  if (d.status !== "ESPERANDO_TRANSFERENCIA") {
    return res.status(400).json({ error: "Estado no permite marcar transferencia" });
  }
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({ status: "TRANSFERIDO_VENDEDOR", updatedAt: /* @__PURE__ */ new Date() });
  res.json({ ok: true });
});
router4.post("/:id/confirm-received", async (req, res) => {
  const parsed = confirmReceivedSchema.safeParse({
    orderId: req.params.id,
    received: req.body.received
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inv\xE1lidos" });
    return;
  }
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({
    status: parsed.data.received ? "ESPERANDO_CONFIRMACION_COMPRADOR" : d.status,
    buyerConfirmedAt: parsed.data.received ? /* @__PURE__ */ new Date() : null,
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ ok: true });
});
router4.post("/:id/evidence", upload3.single("evidence"), async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Archivo requerido" });
    return;
  }
  const evidenceUrl = await uploadFile(
    `evidence/${req.params.id}/${Date.now()}.jpg`,
    file.buffer,
    file.mimetype || "image/jpeg"
  );
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({
    evidenceUrl,
    status: "EVIDENCIA_SUBIDA",
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ ok: true, status: "EVIDENCIA_SUBIDA" });
});
var PUNTOS_POR_RATING_POSITIVO = 5;
router4.post("/:id/rate", async (req, res) => {
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!orderDoc.exists) return res.status(404).json({ error: "No encontrado" });
  const order = orderDoc.data();
  if (order.status !== "COMPLETADA") return res.status(404).json({ error: "No encontrado" });
  if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
    return res.status(404).json({ error: "No encontrado" });
  }
  const positive = req.body?.positive === true;
  const isBuyer = order.buyerId === req.user.id;
  const ratedUserId = isBuyer ? order.sellerId : order.buyerId;
  const existingRating = await db().collection(COLLECTIONS.ORDER_RATINGS).where("orderId", "==", req.params.id).where("raterId", "==", req.user.id).limit(1).get();
  if (!existingRating.empty) {
    return res.status(400).json({ error: "Ya puntuaste esta orden" });
  }
  const ratingId = db().collection(COLLECTIONS.ORDER_RATINGS).doc().id;
  await db().collection(COLLECTIONS.ORDER_RATINGS).doc(ratingId).set({
    orderId: req.params.id,
    raterId: req.user.id,
    ratedUserId,
    positive,
    points: positive ? PUNTOS_POR_RATING_POSITIVO : 0,
    createdAt: /* @__PURE__ */ new Date()
  });
  if (positive) {
    const ratedUserDoc = await db().collection(COLLECTIONS.USERS).doc(ratedUserId).get();
    const currentScore = ratedUserDoc.data()?.reputationScore ?? 0;
    await db().collection(COLLECTIONS.USERS).doc(ratedUserId).update({
      reputationScore: currentScore + PUNTOS_POR_RATING_POSITIVO,
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  res.json({ ok: true, points: positive ? PUNTOS_POR_RATING_POSITIVO : 0 });
});
var ordersRouter = router4;

// src/routes/disputes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.use(requireAuth);
router5.post("/", async (req, res) => {
  const parsed = openDisputeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.flatten() });
    return;
  }
  const { orderId, reason } = parsed.data;
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderDoc.exists) return res.status(404).json({ error: "Orden no encontrada" });
  const order = orderDoc.data();
  if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
    return res.status(404).json({ error: "Orden no encontrada" });
  }
  const existingDispute = await db().collection(COLLECTIONS.DISPUTES).where("orderId", "==", orderId).limit(1).get();
  if (!existingDispute.empty) return res.status(409).json({ error: "Ya existe una disputa para esta orden" });
  const disputeId = db().collection(COLLECTIONS.DISPUTES).doc().id;
  const disputeData = {
    orderId,
    reason,
    status: "ABIERTA",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  await db().collection(COLLECTIONS.DISPUTES).doc(disputeId).set(disputeData);
  await db().collection(COLLECTIONS.ORDERS).doc(orderId).update({ status: "EN_DISPUTA", updatedAt: /* @__PURE__ */ new Date() });
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
  res.status(201).json({
    id: disputeId,
    ...disputeData,
    order: { id: orderId, ...order, ticketListing: listingDoc.exists ? listingDoc.data() : null }
  });
});
router5.get("/my", async (req, res) => {
  const ordersSnap = await db().collection(COLLECTIONS.ORDERS).where("status", "==", "EN_DISPUTA").get();
  const orderIds = ordersSnap.docs.filter((d) => {
    const o = d.data();
    return o.buyerId === req.user.id || o.sellerId === req.user.id;
  }).map((d) => d.id);
  if (orderIds.length === 0) return res.json([]);
  const disputesSnap = await db().collection(COLLECTIONS.DISPUTES).where("orderId", "in", orderIds.slice(0, 10)).get();
  const disputes = await Promise.all(
    disputesSnap.docs.map(async (doc) => {
      const d = doc.data();
      const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
      const order = orderDoc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
      return {
        id: doc.id,
        ...d,
        order: { id: orderDoc.id, ...order, ticketListing: listingDoc.exists ? listingDoc.data() : null },
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
    })
  );
  res.json(disputes);
});
router5.get("/:id", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.DISPUTES).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
  const order = orderDoc.data();
  const isParty = order.buyerId === req.user.id || order.sellerId === req.user.id;
  if (!isParty && req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(order.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(order.sellerId).get();
  const messagesSnap = await db().collection(COLLECTIONS.DISPUTE_MESSAGES).where("disputeId", "==", req.params.id).orderBy("createdAt", "asc").get();
  const messages = await Promise.all(
    messagesSnap.docs.map(async (m) => {
      const md = m.data();
      const userDoc = await db().collection(COLLECTIONS.USERS).doc(md.userId).get();
      return {
        id: m.id,
        ...md,
        user: userDoc.exists ? { id: md.userId, email: userDoc.data()?.email } : null,
        createdAt: md.createdAt?.toDate?.() ?? md.createdAt
      };
    })
  );
  res.json({
    id: doc.id,
    ...d,
    order: {
      id: orderDoc.id,
      ...order,
      ticketListing: listingDoc.exists ? listingDoc.data() : null,
      buyer: buyerDoc.exists ? { id: order.buyerId, email: buyerDoc.data()?.email } : null,
      seller: sellerDoc.exists ? { id: order.sellerId, email: sellerDoc.data()?.email } : null
    },
    messages,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
  });
});
router5.post("/:id/messages", async (req, res) => {
  const { content } = req.body;
  const disputeDoc = await db().collection(COLLECTIONS.DISPUTES).doc(req.params.id).get();
  if (!disputeDoc.exists) return res.status(404).json({ error: "No encontrado" });
  const dispute = disputeDoc.data();
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(dispute.orderId).get();
  const order = orderDoc.data();
  const isParty = order.buyerId === req.user.id || order.sellerId === req.user.id;
  if (!isParty && req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  const messageId = db().collection(COLLECTIONS.DISPUTE_MESSAGES).doc().id;
  const messageData = {
    disputeId: req.params.id,
    userId: req.user.id,
    content: String(content || "").slice(0, 2e3),
    isModerator: req.user.role === "admin",
    createdAt: /* @__PURE__ */ new Date()
  };
  await db().collection(COLLECTIONS.DISPUTE_MESSAGES).doc(messageId).set(messageData);
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
  res.status(201).json({
    id: messageId,
    ...messageData,
    user: { id: req.user.id, email: userDoc.data()?.email }
  });
});
var disputesRouter = router5;

// src/routes/messages.ts
import { Router as Router6 } from "express";

// src/lib/firebase-messaging.ts
async function sendPushNotification(fcmToken, title, body, data) {
  if (!fcmToken || fcmToken.length < 10) return false;
  try {
    const messaging = getMessaging();
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } }
    };
    await messaging.send(message);
    return true;
  } catch (e) {
    console.error("Error enviando push:", e);
    return false;
  }
}

// src/routes/messages.ts
var router6 = Router6();
router6.use(requireAuth);
function normalizeUserIds(id1, id2) {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}
router6.get("/conversations", async (req, res) => {
  const userId = req.user.id;
  const conv1 = await db().collection(COLLECTIONS.CONVERSATIONS).where("user1Id", "==", userId).get();
  const conv2 = await db().collection(COLLECTIONS.CONVERSATIONS).where("user2Id", "==", userId).get();
  const allConvs = [...conv1.docs, ...conv2.docs];
  const seen = /* @__PURE__ */ new Set();
  const uniqueConvs = allConvs.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
  uniqueConvs.sort((a, b) => {
    const aTime = a.data().updatedAt?.toDate?.()?.getTime() ?? 0;
    const bTime = b.data().updatedAt?.toDate?.()?.getTime() ?? 0;
    return bTime - aTime;
  });
  const list = await Promise.all(
    uniqueConvs.slice(0, 50).map(async (doc) => {
      const c = doc.data();
      const otherId = c.user1Id === userId ? c.user2Id : c.user1Id;
      const otherDoc = await db().collection(COLLECTIONS.USERS).doc(otherId).get();
      const other = otherDoc.data();
      const lastMsgSnap = await db().collection(COLLECTIONS.MESSAGES).where("conversationId", "==", doc.id).orderBy("createdAt", "desc").limit(1).get();
      const lastMsg = lastMsgSnap.empty ? null : lastMsgSnap.docs[0].data();
      const isFromMe = lastMsg?.senderId === userId;
      const hasUnread = lastMsg && !isFromMe && !lastMsg.readAt;
      return {
        id: doc.id,
        otherUser: {
          id: otherId,
          email: other?.email,
          firstName: other?.firstName,
          lastName: other?.lastName,
          username: other?.username,
          numeroId: other?.numeroId
        },
        lastMessage: lastMsg ? {
          content: lastMsg.content,
          createdAt: lastMsg.createdAt?.toDate?.() ?? lastMsg.createdAt,
          isFromMe,
          readAt: lastMsg.readAt?.toDate?.() ?? lastMsg.readAt
        } : null,
        hasUnread: !!hasUnread,
        updatedAt: c.updatedAt?.toDate?.() ?? c.updatedAt
      };
    })
  );
  res.json(list);
});
router6.get("/users/search", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: "Ingres\xE1 al menos 2 caracteres (ID o email)" });
    return;
  }
  const userId = req.user.id;
  const byEmail = await db().collection(COLLECTIONS.USERS).where("email", ">=", q).where("email", "<=", q + "\uF8FF").limit(10).get();
  const byUsername = await db().collection(COLLECTIONS.USERS).where("username", ">=", q).where("username", "<=", q + "\uF8FF").limit(10).get();
  const byNumeroId = await db().collection(COLLECTIONS.USERS).where("numeroId", ">=", q).where("numeroId", "<=", q + "\uF8FF").limit(10).get();
  const seen = /* @__PURE__ */ new Set();
  const users = [];
  for (const snap of [byEmail, byUsername, byNumeroId]) {
    for (const doc of snap.docs) {
      if (doc.id === userId || seen.has(doc.id)) continue;
      const d = doc.data();
      const match = (d.email || "").toLowerCase().includes(q.toLowerCase()) || (d.username || "").toLowerCase().includes(q.toLowerCase()) || (d.numeroId || "").toUpperCase().includes(q.toUpperCase());
      if (match) {
        seen.add(doc.id);
        users.push({
          id: doc.id,
          email: d.email,
          firstName: d.firstName,
          lastName: d.lastName,
          username: d.username,
          numeroId: d.numeroId
        });
      }
      if (users.length >= 10) break;
    }
    if (users.length >= 10) break;
  }
  res.json(users.slice(0, 10));
});
router6.post("/conversations", async (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId || typeof otherUserId !== "string") {
    res.status(400).json({ error: "otherUserId requerido" });
    return;
  }
  const userId = req.user.id;
  if (otherUserId === userId) {
    res.status(400).json({ error: "No pod\xE9s iniciar conversaci\xF3n con vos mismo" });
    return;
  }
  const otherDoc = await db().collection(COLLECTIONS.USERS).doc(otherUserId).get();
  if (!otherDoc.exists) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  const other = otherDoc.data();
  const [u1, u2] = normalizeUserIds(userId, otherUserId);
  const existing = await db().collection(COLLECTIONS.CONVERSATIONS).where("user1Id", "==", u1).where("user2Id", "==", u2).limit(1).get();
  let convId;
  let convData;
  if (!existing.empty) {
    convId = existing.docs[0].id;
    convData = existing.docs[0].data();
  } else {
    convId = db().collection(COLLECTIONS.CONVERSATIONS).doc().id;
    convData = {
      user1Id: u1,
      user2Id: u2,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).set(convData);
  }
  const otherId = convData.user1Id === userId ? u2 : u1;
  const otherUserData = other;
  res.json({
    id: convId,
    otherUser: {
      id: otherId,
      email: otherUserData.email,
      firstName: otherUserData.firstName,
      lastName: otherUserData.lastName,
      username: otherUserData.username,
      numeroId: otherUserData.numeroId
    },
    createdAt: convData.createdAt?.toDate?.() ?? convData.createdAt
  });
});
router6.get("/conversations/:id/messages", async (req, res) => {
  const convId = req.params.id;
  const userId = req.user.id;
  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).get();
  if (!convDoc.exists) {
    res.status(404).json({ error: "Conversaci\xF3n no encontrada" });
    return;
  }
  const conv = convDoc.data();
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: "No ten\xE9s acceso a esta conversaci\xF3n" });
    return;
  }
  const messagesSnap = await db().collection(COLLECTIONS.MESSAGES).where("conversationId", "==", convId).orderBy("createdAt", "asc").get();
  await db().collection(COLLECTIONS.MESSAGES).where("conversationId", "==", convId).where("senderId", "!=", userId).get().then((snap) => {
    const batch = db().batch();
    snap.docs.forEach((d) => {
      if (!d.data().readAt) batch.update(d.ref, { readAt: /* @__PURE__ */ new Date() });
    });
    return batch.commit();
  }).catch(() => {
  });
  const messages = await Promise.all(
    messagesSnap.docs.map(async (doc) => {
      const m = doc.data();
      const senderDoc = await db().collection(COLLECTIONS.USERS).doc(m.senderId).get();
      const sender = senderDoc.data();
      return {
        id: doc.id,
        content: m.content,
        senderId: m.senderId,
        sender: sender ? { id: m.senderId, email: sender.email, firstName: sender.firstName, lastName: sender.lastName } : null,
        isFromMe: m.senderId === userId,
        createdAt: m.createdAt?.toDate?.() ?? m.createdAt
      };
    })
  );
  res.json(messages);
});
router6.post("/conversations/:id/messages", async (req, res) => {
  const convId = req.params.id;
  const { content } = req.body;
  const userId = req.user.id;
  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Mensaje requerido" });
    return;
  }
  if (content.length > 2e3) {
    res.status(400).json({ error: "Mensaje demasiado largo" });
    return;
  }
  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).get();
  if (!convDoc.exists) {
    res.status(404).json({ error: "Conversaci\xF3n no encontrada" });
    return;
  }
  const conv = convDoc.data();
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: "No ten\xE9s acceso a esta conversaci\xF3n" });
    return;
  }
  const recipientId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
  const messageId = db().collection(COLLECTIONS.MESSAGES).doc().id;
  const messageData = {
    conversationId: convId,
    senderId: userId,
    content: content.trim(),
    createdAt: /* @__PURE__ */ new Date()
  };
  await db().collection(COLLECTIONS.MESSAGES).doc(messageId).set(messageData);
  await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).update({ updatedAt: /* @__PURE__ */ new Date() });
  const senderDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  const sender = senderDoc.data();
  const recipientDoc = await db().collection(COLLECTIONS.USERS).doc(recipientId).get();
  const fcmToken = recipientDoc.data()?.fcmToken;
  if (fcmToken) {
    const senderName = [sender?.firstName, sender?.lastName].filter(Boolean).join(" ") || sender?.email || "Alguien";
    await sendPushNotification(fcmToken, "Nuevo mensaje", `${senderName}: ${content.trim().slice(0, 50)}`, {
      type: "new_message",
      conversationId: convId
    });
  }
  res.status(201).json({
    id: messageId,
    content: messageData.content,
    senderId: userId,
    sender: sender ? { id: userId, email: sender.email, firstName: sender.firstName, lastName: sender.lastName } : null,
    isFromMe: true,
    createdAt: messageData.createdAt
  });
});
var messagesRouter = router6;

// src/routes/admin.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.use(requireAuth);
router7.use(requireAdmin);
router7.get("/settings", async (_req, res) => {
  const settings = await getPlatformSettings();
  res.json({
    ...settings,
    mercadopago: {
      ...settings.mercadopago,
      accessToken: settings.mercadopago.accessToken ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + settings.mercadopago.accessToken.slice(-4) : "",
      publicKey: settings.mercadopago.publicKey ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + settings.mercadopago.publicKey.slice(-4) : "",
      webhookSecret: settings.mercadopago.webhookSecret ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    }
  });
});
router7.put("/settings", async (req, res) => {
  const body = req.body;
  const docRef = db().collection(COLLECTIONS.PLATFORM_SETTINGS).doc("main");
  const current = await getPlatformSettings();
  const updates = {
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (typeof body.commissionPercentage === "number" && body.commissionPercentage >= 0 && body.commissionPercentage <= 100) {
    updates.commissionPercentage = body.commissionPercentage;
  }
  if (body.mercadopago && typeof body.mercadopago === "object") {
    const mp = body.mercadopago;
    const useNew = (val, key) => typeof val === "string" && val.length > 0 && !val.startsWith("\u2022\u2022\u2022\u2022") ? val : current.mercadopago[key] || "";
    updates.mercadopago = {
      enabled: typeof mp.enabled === "boolean" ? mp.enabled : current.mercadopago.enabled,
      accessToken: useNew(mp.accessToken, "accessToken"),
      publicKey: useNew(mp.publicKey, "publicKey"),
      webhookSecret: useNew(mp.webhookSecret, "webhookSecret"),
      sandboxMode: typeof mp.sandboxMode === "boolean" ? mp.sandboxMode : current.mercadopago.sandboxMode,
      backUrlBase: typeof mp.backUrlBase === "string" ? mp.backUrlBase : current.mercadopago.backUrlBase ?? ""
    };
  }
  if (body.users && typeof body.users === "object") {
    updates.users = { ...current.users, ...body.users };
  }
  if (body.visual && typeof body.visual === "object") {
    updates.visual = { ...current.visual, ...body.visual };
  }
  await docRef.set(updates, { merge: true });
  invalidateSettingsCache();
  const updated = await getPlatformSettings();
  res.json({
    ...updated,
    mercadopago: {
      ...updated.mercadopago,
      accessToken: updated.mercadopago.accessToken ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + updated.mercadopago.accessToken.slice(-4) : "",
      publicKey: updated.mercadopago.publicKey ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + updated.mercadopago.publicKey.slice(-4) : "",
      webhookSecret: updated.mercadopago.webhookSecret ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""
    }
  });
});
router7.get("/stats", async (_req, res) => {
  const [usersSnap, ordersSnap, disputesSnap, kycSnap, listingsSnap, ordersCompletedSnap] = await Promise.all([
    db().collection(COLLECTIONS.USERS).get(),
    db().collection(COLLECTIONS.ORDERS).get(),
    db().collection(COLLECTIONS.DISPUTES).where("status", "in", ["ABIERTA", "EN_REVISION", "ESPERANDO_INFO"]).get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("status", "==", "EN_REVISION").get(),
    db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").get(),
    db().collection(COLLECTIONS.ORDERS).where("status", "==", "COMPLETADA").get()
  ]);
  res.json({
    usersCount: usersSnap.size,
    ordersCount: ordersSnap.size,
    ordersCompleted: ordersCompletedSnap.size,
    disputesOpen: disputesSnap.size,
    kycPending: kycSnap.size,
    listingsCount: listingsSnap.size
  });
});
router7.get("/users", async (req, res) => {
  const { q, page = "1", limit = "20", role, kycStatus } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  let query = db().collection(COLLECTIONS.USERS).orderBy("createdAt", "desc");
  if (typeof role === "string" && role) {
    query = query.where("role", "==", role);
  }
  const snap = await query.limit(limitNum * 3).get();
  let users = snap.docs.map((doc) => {
    const d = doc.data();
    return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.() ?? d.createdAt };
  });
  if (typeof q === "string" && q) {
    const ql = q.toLowerCase();
    users = users.filter(
      (u) => (u.email || "").toLowerCase().includes(ql) || (u.firstName || "").toLowerCase().includes(ql) || (u.lastName || "").toLowerCase().includes(ql)
    );
  }
  if (typeof kycStatus === "string" && kycStatus) {
    const kycIds = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("status", "==", kycStatus).get();
    const kycUserIds = new Set(kycIds.docs.map((d) => d.data().userId || d.id));
    users = users.filter((u) => kycUserIds.has(u.id));
  }
  const total = users.length;
  const skip = (pageNum - 1) * limitNum;
  const paginated = users.slice(skip, skip + limitNum);
  const withKyc = await Promise.all(
    paginated.map(async (u) => {
      const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(u.id).get();
      return { ...u, kyc: kycDoc.exists ? { status: kycDoc.data()?.status } : { status: "PENDIENTE" } };
    })
  );
  res.json({ users: withKyc, total });
});
router7.get("/users/:userId/cards", async (req, res) => {
  const { userId } = req.params;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: "Usuario no encontrado" });
  const userData = userDoc.data();
  const email = userData.email;
  if (!email || typeof email !== "string") {
    return res.json({ cards: [], user: { id: userId, email: null } });
  }
  try {
    const settings = await getPlatformSettings();
    const customerId = await getOrCreateCustomer(userId, email, settings.mercadopago.sandboxMode);
    if (!userData.mpCustomerId) {
      await db().collection(COLLECTIONS.USERS).doc(userId).update({
        mpCustomerId: customerId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    const cards = await listCustomerCards(customerId);
    res.json({
      cards,
      user: {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al listar tarjetas";
    res.status(500).json({ error: msg });
  }
});
router7.get("/kyc/pending", async (_req, res) => {
  const snap = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("status", "==", "EN_REVISION").get();
  const list = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const userDoc = await db().collection(COLLECTIONS.USERS).doc(d.userId || doc.id).get();
      const user = userDoc.data();
      return {
        id: doc.id,
        ...d,
        user: user ? { id: userDoc.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
    })
  );
  res.json(list);
});
router7.patch("/kyc/:userId", async (req, res) => {
  const { userId } = req.params;
  const { status, rejectionReason } = req.body;
  if (status !== "APROBADO" && status !== "RECHAZADO") {
    res.status(400).json({ error: "status debe ser APROBADO o RECHAZADO" });
    return;
  }
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
    {
      status,
      rejectionReason: status === "RECHAZADO" ? rejectionReason || "Rechazado por el administrador" : null,
      reviewedAt: /* @__PURE__ */ new Date(),
      reviewedBy: req.user.id,
      updatedAt: /* @__PURE__ */ new Date()
    },
    { merge: true }
  );
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  res.json({
    ...kycDoc.data(),
    user: userDoc.exists ? { id: userId, email: userDoc.data()?.email } : null
  });
});
router7.get("/disputes", async (req, res) => {
  let query = db().collection(COLLECTIONS.DISPUTES).orderBy("createdAt", "desc");
  if (typeof req.query.status === "string" && req.query.status) {
    query = query.where("status", "==", req.query.status);
  }
  const snap = await query.limit(100).get();
  const disputes = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
      const order = orderDoc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(order.ticketListingId).get();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(order.buyerId).get();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(order.sellerId).get();
      const messagesSnap = await db().collection(COLLECTIONS.DISPUTE_MESSAGES).where("disputeId", "==", doc.id).orderBy("createdAt", "desc").limit(1).get();
      return {
        id: doc.id,
        ...d,
        order: {
          ...order,
          ticketListing: listingDoc.exists ? listingDoc.data() : null,
          buyer: buyerDoc.exists ? { id: order.buyerId, email: buyerDoc.data()?.email } : null,
          seller: sellerDoc.exists ? { id: order.sellerId, email: sellerDoc.data()?.email } : null
        },
        messages: messagesSnap.empty ? [] : [messagesSnap.docs[0].data()],
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
    })
  );
  res.json(disputes);
});
router7.patch("/disputes/:id/resolve", async (req, res) => {
  const { id } = req.params;
  const { resolution } = req.body;
  if (resolution !== "RESUELTA_FAVOR_COMPRADOR" && resolution !== "RESUELTA_FAVOR_VENDEDOR") {
    res.status(400).json({ error: "resolution debe ser RESUELTA_FAVOR_COMPRADOR o RESUELTA_FAVOR_VENDEDOR" });
    return;
  }
  const disputeDoc = await db().collection(COLLECTIONS.DISPUTES).doc(id).get();
  if (!disputeDoc.exists) return res.status(404).json({ error: "Disputa no encontrada" });
  const dispute = disputeDoc.data();
  const orderStatus = resolution === "RESUELTA_FAVOR_COMPRADOR" ? "DISPUTA_RESUELTA_COMPRADOR" : "DISPUTA_RESUELTA_VENDEDOR";
  await db().collection(COLLECTIONS.DISPUTES).doc(id).update({
    status: resolution,
    resolvedAt: /* @__PURE__ */ new Date(),
    resolvedBy: req.user.id,
    updatedAt: /* @__PURE__ */ new Date()
  });
  await db().collection(COLLECTIONS.ORDERS).doc(dispute.orderId).update({ status: orderStatus, updatedAt: /* @__PURE__ */ new Date() });
  const updatedDoc = await db().collection(COLLECTIONS.DISPUTES).doc(id).get();
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(dispute.orderId).get();
  res.json({
    ...updatedDoc.data(),
    order: orderDoc.exists ? orderDoc.data() : null
  });
});
router7.get("/conversations", async (req, res) => {
  const { page = "1", limit = "30" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const snap = await db().collection(COLLECTIONS.CONVERSATIONS).orderBy("updatedAt", "desc").limit(Number(limit) + skip).get();
  const total = snap.size;
  const conversations = await Promise.all(
    snap.docs.slice(skip).map(async (doc) => {
      const c = doc.data();
      const user1Doc = await db().collection(COLLECTIONS.USERS).doc(c.user1Id).get();
      const user2Doc = await db().collection(COLLECTIONS.USERS).doc(c.user2Id).get();
      const lastMsgSnap = await db().collection(COLLECTIONS.MESSAGES).where("conversationId", "==", doc.id).orderBy("createdAt", "desc").limit(1).get();
      return {
        id: doc.id,
        ...c,
        user1: user1Doc.exists ? { id: c.user1Id, ...user1Doc.data() } : null,
        user2: user2Doc.exists ? { id: c.user2Id, ...user2Doc.data() } : null,
        messages: lastMsgSnap.empty ? [] : [lastMsgSnap.docs[0].data()],
        updatedAt: c.updatedAt?.toDate?.() ?? c.updatedAt
      };
    })
  );
  res.json({ conversations, total });
});
router7.get("/conversations/:id/messages", async (req, res) => {
  const { id } = req.params;
  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(id).get();
  if (!convDoc.exists) return res.status(404).json({ error: "Conversaci\xF3n no encontrada" });
  const conv = convDoc.data();
  const user1Doc = await db().collection(COLLECTIONS.USERS).doc(conv.user1Id).get();
  const user2Doc = await db().collection(COLLECTIONS.USERS).doc(conv.user2Id).get();
  const messagesSnap = await db().collection(COLLECTIONS.MESSAGES).where("conversationId", "==", id).orderBy("createdAt", "asc").get();
  const messages = await Promise.all(
    messagesSnap.docs.map(async (m) => {
      const md = m.data();
      const senderDoc = await db().collection(COLLECTIONS.USERS).doc(md.senderId).get();
      return {
        id: m.id,
        ...md,
        sender: senderDoc.exists ? { id: md.senderId, ...senderDoc.data() } : null,
        createdAt: md.createdAt?.toDate?.() ?? md.createdAt
      };
    })
  );
  res.json({
    id: convDoc.id,
    user1: user1Doc.exists ? { id: conv.user1Id, ...user1Doc.data() } : null,
    user2: user2Doc.exists ? { id: conv.user2Id, ...user2Doc.data() } : null,
    messages
  });
});
router7.get("/orders", async (req, res) => {
  const { page = "1", limit = "20", status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  let query = db().collection(COLLECTIONS.ORDERS).orderBy("createdAt", "desc");
  if (typeof status === "string" && status) {
    query = query.where("status", "==", status);
  }
  const snap = await query.limit(skip + Number(limit)).get();
  const orders = await Promise.all(
    snap.docs.slice(skip).map(async (doc) => {
      const d = doc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      return {
        id: doc.id,
        ...d,
        ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
        buyer: buyerDoc.exists ? { email: buyerDoc.data()?.email } : null,
        seller: sellerDoc.exists ? { email: sellerDoc.data()?.email } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
    })
  );
  res.json({ orders, total: snap.size });
});
var adminRouter = router7;

// src/routes/health.ts
import { Router as Router8 } from "express";
var healthRouter = Router8();
healthRouter.get("/", async (_req, res) => {
  try {
    getFirebaseAdmin();
    res.json({ status: "ok", db: "firestore" });
  } catch (e) {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// src/routes/webhooks.ts
import { Router as Router9 } from "express";
var router8 = Router9();
var WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET_KEY;
function mapDiditStatus(status) {
  switch (status) {
    case "Approved":
      return "APROBADO";
    case "Declined":
      return "RECHAZADO";
    case "In Review":
      return "EN_REVISION";
    case "Not Started":
    case "Kyc Expired":
    case "Abandoned":
    default:
      return status === "In Review" ? "EN_REVISION" : "PENDIENTE";
  }
}
router8.post("/didit", async (req, res) => {
  const rawBody = req.rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: "Raw body no disponible" });
  }
  const signature = req.get("x-signature") ?? req.get("X-Signature");
  const timestamp = req.get("x-timestamp") ?? req.get("X-Timestamp");
  if (!WEBHOOK_SECRET) {
    console.error("DIDIT_WEBHOOK_SECRET_KEY no configurado");
    return res.status(500).json({ error: "Webhook no configurado" });
  }
  const isValid2 = await verifyDiditWebhookSignature(rawBody, signature, timestamp, WEBHOOK_SECRET);
  if (!isValid2) {
    return res.status(401).json({ error: "Firma inv\xE1lida" });
  }
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "JSON inv\xE1lido" });
  }
  const { status, vendor_data } = body;
  const userId = vendor_data;
  if (!userId) {
    return res.status(400).json({ error: "vendor_data requerido" });
  }
  const ourStatus = mapDiditStatus(status || "");
  const rejectionReason = status === "Declined" && body.decision?.kyc ? "Verificaci\xF3n rechazada por Didit" : null;
  try {
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      {
        status: ourStatus,
        ...rejectionReason && { rejectionReason },
        ...ourStatus === "APROBADO" || ourStatus === "RECHAZADO" ? { reviewedAt: /* @__PURE__ */ new Date() } : {},
        updatedAt: /* @__PURE__ */ new Date()
      },
      { merge: true }
    );
    return res.json({ message: "Webhook procesado" });
  } catch (e) {
    console.error("Error actualizando KYC:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});
router8.post("/mercadopago", async (req, res) => {
  const rawBody = req.rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: "Raw body no disponible" });
  }
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "JSON inv\xE1lido" });
  }
  const { type, data } = body;
  if (type !== "payment" || !data?.id) {
    return res.status(200).json({ received: true });
  }
  const paymentId = String(data.id);
  const xSignature = req.get("x-signature") ?? req.get("X-Signature");
  const xRequestId = req.get("x-request-id") ?? req.get("X-Request-Id") ?? "";
  const webhookSecret = await getMercadoPagoWebhookSecret();
  if (webhookSecret && xSignature) {
    const parts = xSignature.split(",");
    let ts = "";
    let v1 = "";
    for (const part of parts) {
      const [key, val] = part.split("=").map((s) => s.trim());
      if (key === "ts") ts = val;
      if (key === "v1") v1 = val;
    }
    const dataId = paymentId.toLowerCase();
    const isValid2 = verifyMercadoPagoWebhookSignature(dataId, xRequestId, ts, webhookSecret, v1);
    if (!isValid2) {
      console.warn("Webhook MercadoPago: firma inv\xE1lida");
      return res.status(401).json({ error: "Firma inv\xE1lida" });
    }
  }
  if (!isMercadoPagoConfigured()) {
    return res.status(200).json({ received: true });
  }
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    return res.status(200).json({ received: true });
  }
  const orderId = payment.external_reference;
  if (!orderId) {
    return res.status(200).json({ received: true });
  }
  if (payment.status === "approved") {
    const orderRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
    const orderDoc = await orderRef.get();
    if (orderDoc.exists && orderDoc.data()?.status === "PENDIENTE_PAGO") {
      await orderRef.update({
        status: "ESPERANDO_TRANSFERENCIA",
        paymentIntentId: paymentId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
  }
  return res.status(200).json({ received: true });
});
var webhooksRouter = router8;

// src/routes/mercadopago.ts
import { Router as Router10 } from "express";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var router9 = Router10();
router9.get("/public-key", async (_req, res) => {
  try {
    const publicKey = await getMercadoPagoPublicKey();
    res.json({ publicKey });
  } catch (e) {
    res.status(503).json({ error: "Mercado Pago no configurado" });
  }
});
router9.get("/card-form", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "card-form.html"));
});
var mercadopagoRouter = router9;

// src/index.ts
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var app2 = express();
var PORT = process.env.PORT ?? 3001;
app2.set("trust proxy", 1);
var isProduction = process.env.NODE_ENV === "production";
var corsOrigin = isProduction ? true : [
  process.env.CORS_ORIGIN_WEB || "http://localhost:5173",
  process.env.CORS_ORIGIN_ADMIN || "http://localhost:5174"
].filter(Boolean);
app2.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "https://sdk.mercadopago.com", "'unsafe-inline'"],
        "connect-src": ["'self'", "https://api.mercadopago.com", "https://sdk.mercadopago.com"],
        "frame-src": ["'self'", "https://www.mercadopago.com", "https://sdk.mercadopago.com", "https://*.mercadopago.com"]
      }
    }
  })
);
app2.use(cors({ origin: corsOrigin, credentials: true }));
app2.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    }
  })
);
app2.use(
  rateLimit({
    windowMs: 15 * 60 * 1e3,
    max: 200,
    message: { error: "Demasiadas solicitudes" }
  })
);
invalidateSettingsCache();
try {
  getFirebaseAdmin();
  console.log("Firebase inicializado");
} catch (e) {
  console.warn("Firebase no configurado. Defin\xED GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON.");
}
app2.use("/api/health", healthRouter);
app2.use("/api/auth", authRouter);
app2.use("/api/webhooks", webhooksRouter);
app2.use("/api/mercadopago", mercadopagoRouter);
app2.use("/api/users", usersRouter);
app2.use("/api/tickets", ticketsRouter);
app2.use("/api/orders", ordersRouter);
app2.use("/api/disputes", disputesRouter);
app2.use("/api/messages", messagesRouter);
app2.use("/api/admin", adminRouter);
app2.use((_req, res) => {
  res.status(404).json({ error: "No encontrado" });
});
app2.use((err, _req, res) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
app2.listen(PORT, () => {
  console.log(`API Tickets Transfer v2 en http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map
