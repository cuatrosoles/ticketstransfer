var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/firebase-admin.ts
var firebase_admin_exports = {};
__export(firebase_admin_exports, {
  getAuth: () => getAuth,
  getFirebaseAdmin: () => getFirebaseAdmin,
  getFirestore: () => getFirestore,
  getMessaging: () => getMessaging,
  getStorage: () => getStorage
});
import admin from "firebase-admin";
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
var app;
var init_firebase_admin = __esm({
  "src/lib/firebase-admin.ts"() {
    "use strict";
  }
});

// ../../node_modules/postal-mime/src/decode-strings.js
function decodeBase64(base64) {
  let bufferLength = Math.ceil(base64.length / 4) * 3;
  const len = base64.length;
  let p = 0;
  if (base64.length % 4 === 3) {
    bufferLength--;
  } else if (base64.length % 4 === 2) {
    bufferLength -= 2;
  } else if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i += 4) {
    let encoded1 = base64Lookup[base64.charCodeAt(i)];
    let encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    let encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    let encoded4 = base64Lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arrayBuffer;
}
function getDecoder(charset) {
  charset = charset || "utf8";
  let decoder;
  try {
    decoder = new TextDecoder(charset);
  } catch (err) {
    decoder = new TextDecoder("windows-1252");
  }
  return decoder;
}
async function blobToArrayBuffer(blob) {
  if ("arrayBuffer" in blob) {
    return await blob.arrayBuffer();
  }
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.onload = function(e) {
      resolve(e.target.result);
    };
    fr.onerror = function(e) {
      reject(fr.error);
    };
    fr.readAsArrayBuffer(blob);
  });
}
function getHex(c) {
  if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
    return String.fromCharCode(c);
  }
  return false;
}
function decodeWord(charset, encoding, str) {
  let splitPos = charset.indexOf("*");
  if (splitPos >= 0) {
    charset = charset.substr(0, splitPos);
  }
  encoding = encoding.toUpperCase();
  let byteStr;
  if (encoding === "Q") {
    str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
    let buf = textEncoder.encode(str);
    let encodedBytes = [];
    for (let i = 0, len = buf.length; i < len; i++) {
      let c = buf[i];
      if (i <= len - 2 && c === 61) {
        let c1 = getHex(buf[i + 1]);
        let c2 = getHex(buf[i + 2]);
        if (c1 && c2) {
          let c3 = parseInt(c1 + c2, 16);
          encodedBytes.push(c3);
          i += 2;
          continue;
        }
      }
      encodedBytes.push(c);
    }
    byteStr = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(byteStr);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, encodedBytes[i]);
    }
  } else if (encoding === "B") {
    byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
  } else {
    byteStr = textEncoder.encode(str);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeWords(str) {
  let joinString = true;
  let done = false;
  while (!done) {
    let result = (str || "").toString().replace(
      /(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g,
      (match, left, chLeft, encodedLeftStr, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(
      /(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g,
      (match, left, chLeft, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(
      /=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g,
      (m, charset, encoding, text) => decodeWord(charset, encoding, text)
    );
    if (joinString && result.indexOf("\uFFFD") >= 0) {
      joinString = false;
    } else {
      return result;
    }
  }
}
function decodeURIComponentWithCharset(encodedStr, charset) {
  charset = charset || "utf-8";
  let encodedBytes = [];
  for (let i = 0; i < encodedStr.length; i++) {
    let c = encodedStr.charAt(i);
    if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
      let byte = encodedStr.substr(i + 1, 2);
      i += 2;
      encodedBytes.push(parseInt(byte, 16));
    } else if (c.charCodeAt(0) > 126) {
      c = textEncoder.encode(c);
      for (let j = 0; j < c.length; j++) {
        encodedBytes.push(c[j]);
      }
    } else {
      encodedBytes.push(c.charCodeAt(0));
    }
  }
  const byteStr = new ArrayBuffer(encodedBytes.length);
  const dataView = new DataView(byteStr);
  for (let i = 0, len = encodedBytes.length; i < len; i++) {
    dataView.setUint8(i, encodedBytes[i]);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeParameterValueContinuations(header) {
  let paramKeys = /* @__PURE__ */ new Map();
  Object.keys(header.params).forEach((key) => {
    let match = key.match(/\*((\d+)\*?)?$/);
    if (!match) {
      return;
    }
    let actualKey = key.substr(0, match.index).toLowerCase();
    let nr = Number(match[2]) || 0;
    let paramVal;
    if (!paramKeys.has(actualKey)) {
      paramVal = {
        charset: false,
        values: []
      };
      paramKeys.set(actualKey, paramVal);
    } else {
      paramVal = paramKeys.get(actualKey);
    }
    let value = header.params[key];
    if (nr === 0 && match[0].charAt(match[0].length - 1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
      paramVal.charset = match[1] || "utf-8";
      value = match[2];
    }
    paramVal.values.push({ nr, value });
    delete header.params[key];
  });
  paramKeys.forEach((paramVal, key) => {
    header.params[key] = decodeURIComponentWithCharset(
      paramVal.values.sort((a, b) => a.nr - b.nr).map((a) => a.value).join(""),
      paramVal.charset
    );
  });
}
var textEncoder, base64Chars, base64Lookup, i;
var init_decode_strings = __esm({
  "../../node_modules/postal-mime/src/decode-strings.js"() {
    textEncoder = new TextEncoder();
    base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    base64Lookup = new Uint8Array(256);
    for (i = 0; i < base64Chars.length; i++) {
      base64Lookup[base64Chars.charCodeAt(i)] = i;
    }
  }
});

// ../../node_modules/postal-mime/src/pass-through-decoder.js
var PassThroughDecoder;
var init_pass_through_decoder = __esm({
  "../../node_modules/postal-mime/src/pass-through-decoder.js"() {
    init_decode_strings();
    PassThroughDecoder = class {
      constructor() {
        this.chunks = [];
      }
      update(line) {
        this.chunks.push(line);
        this.chunks.push("\n");
      }
      finalize() {
        return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
      }
    };
  }
});

// ../../node_modules/postal-mime/src/base64-decoder.js
var Base64Decoder;
var init_base64_decoder = __esm({
  "../../node_modules/postal-mime/src/base64-decoder.js"() {
    init_decode_strings();
    Base64Decoder = class {
      constructor(opts) {
        opts = opts || {};
        this.decoder = opts.decoder || new TextDecoder();
        this.maxChunkSize = 100 * 1024;
        this.chunks = [];
        this.remainder = "";
      }
      update(buffer) {
        let str = this.decoder.decode(buffer);
        if (/[^a-zA-Z0-9+\/]/.test(str)) {
          str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
        }
        this.remainder += str;
        if (this.remainder.length >= this.maxChunkSize) {
          let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
          let base64Str;
          if (allowedBytes === this.remainder.length) {
            base64Str = this.remainder;
            this.remainder = "";
          } else {
            base64Str = this.remainder.substr(0, allowedBytes);
            this.remainder = this.remainder.substr(allowedBytes);
          }
          if (base64Str.length) {
            this.chunks.push(decodeBase64(base64Str));
          }
        }
      }
      finalize() {
        if (this.remainder && !/^=+$/.test(this.remainder)) {
          this.chunks.push(decodeBase64(this.remainder));
        }
        return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
      }
    };
  }
});

// ../../node_modules/postal-mime/src/qp-decoder.js
var VALID_QP_REGEX, QP_SPLIT_REGEX, SOFT_LINE_BREAK_REGEX, PARTIAL_QP_ENDING_REGEX, QPDecoder;
var init_qp_decoder = __esm({
  "../../node_modules/postal-mime/src/qp-decoder.js"() {
    init_decode_strings();
    VALID_QP_REGEX = /^=[a-f0-9]{2}$/i;
    QP_SPLIT_REGEX = /(?==[a-f0-9]{2})/i;
    SOFT_LINE_BREAK_REGEX = /=\r?\n/g;
    PARTIAL_QP_ENDING_REGEX = /=[a-fA-F0-9]?$/;
    QPDecoder = class {
      constructor(opts) {
        opts = opts || {};
        this.decoder = opts.decoder || new TextDecoder();
        this.maxChunkSize = 100 * 1024;
        this.remainder = "";
        this.chunks = [];
      }
      decodeQPBytes(encodedBytes) {
        let buf = new ArrayBuffer(encodedBytes.length);
        let dataView = new DataView(buf);
        for (let i = 0, len = encodedBytes.length; i < len; i++) {
          dataView.setUint8(i, parseInt(encodedBytes[i], 16));
        }
        return buf;
      }
      decodeChunks(str) {
        str = str.replace(SOFT_LINE_BREAK_REGEX, "");
        let list = str.split(QP_SPLIT_REGEX);
        let encodedBytes = [];
        for (let part of list) {
          if (part.charAt(0) !== "=") {
            if (encodedBytes.length) {
              this.chunks.push(this.decodeQPBytes(encodedBytes));
              encodedBytes = [];
            }
            this.chunks.push(part);
            continue;
          }
          if (part.length === 3) {
            if (VALID_QP_REGEX.test(part)) {
              encodedBytes.push(part.substr(1));
            } else {
              if (encodedBytes.length) {
                this.chunks.push(this.decodeQPBytes(encodedBytes));
                encodedBytes = [];
              }
              this.chunks.push(part);
            }
            continue;
          }
          if (part.length > 3) {
            const firstThree = part.substr(0, 3);
            if (VALID_QP_REGEX.test(firstThree)) {
              encodedBytes.push(part.substr(1, 2));
              this.chunks.push(this.decodeQPBytes(encodedBytes));
              encodedBytes = [];
              part = part.substr(3);
              this.chunks.push(part);
            } else {
              if (encodedBytes.length) {
                this.chunks.push(this.decodeQPBytes(encodedBytes));
                encodedBytes = [];
              }
              this.chunks.push(part);
            }
          }
        }
        if (encodedBytes.length) {
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
        }
      }
      update(buffer) {
        let str = this.decoder.decode(buffer) + "\n";
        str = this.remainder + str;
        if (str.length < this.maxChunkSize) {
          this.remainder = str;
          return;
        }
        this.remainder = "";
        let partialEnding = str.match(PARTIAL_QP_ENDING_REGEX);
        if (partialEnding) {
          if (partialEnding.index === 0) {
            this.remainder = str;
            return;
          }
          this.remainder = str.substr(partialEnding.index);
          str = str.substr(0, partialEnding.index);
        }
        this.decodeChunks(str);
      }
      finalize() {
        if (this.remainder.length) {
          this.decodeChunks(this.remainder);
          this.remainder = "";
        }
        return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
      }
    };
  }
});

// ../../node_modules/postal-mime/src/mime-node.js
var MimeNode;
var init_mime_node = __esm({
  "../../node_modules/postal-mime/src/mime-node.js"() {
    init_decode_strings();
    init_pass_through_decoder();
    init_base64_decoder();
    init_qp_decoder();
    MimeNode = class {
      constructor(options) {
        this.options = options || {};
        this.postalMime = this.options.postalMime;
        this.root = !!this.options.parentNode;
        this.childNodes = [];
        if (this.options.parentNode) {
          this.parentNode = this.options.parentNode;
          this.depth = this.parentNode.depth + 1;
          if (this.depth > this.options.maxNestingDepth) {
            throw new Error(`Maximum MIME nesting depth of ${this.options.maxNestingDepth} levels exceeded`);
          }
          this.options.parentNode.childNodes.push(this);
        } else {
          this.depth = 0;
        }
        this.state = "header";
        this.headerLines = [];
        this.headerSize = 0;
        const parentMultipartType = this.options.parentMultipartType || null;
        const defaultContentType = parentMultipartType === "digest" ? "message/rfc822" : "text/plain";
        this.contentType = {
          value: defaultContentType,
          default: true
        };
        this.contentTransferEncoding = {
          value: "8bit"
        };
        this.contentDisposition = {
          value: ""
        };
        this.headers = [];
        this.contentDecoder = false;
      }
      setupContentDecoder(transferEncoding) {
        if (/base64/i.test(transferEncoding)) {
          this.contentDecoder = new Base64Decoder();
        } else if (/quoted-printable/i.test(transferEncoding)) {
          this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
        } else {
          this.contentDecoder = new PassThroughDecoder();
        }
      }
      async finalize() {
        if (this.state === "finished") {
          return;
        }
        if (this.state === "header") {
          this.processHeaders();
        }
        let boundaries = this.postalMime.boundaries;
        for (let i = boundaries.length - 1; i >= 0; i--) {
          let boundary = boundaries[i];
          if (boundary.node === this) {
            boundaries.splice(i, 1);
            break;
          }
        }
        await this.finalizeChildNodes();
        this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
        this.state = "finished";
      }
      async finalizeChildNodes() {
        for (let childNode of this.childNodes) {
          await childNode.finalize();
        }
      }
      // Strip RFC 822 comments (parenthesized text) from structured header values
      stripComments(str) {
        let result = "";
        let depth = 0;
        let escaped = false;
        let inQuote = false;
        for (let i = 0; i < str.length; i++) {
          const chr = str.charAt(i);
          if (escaped) {
            if (depth === 0) {
              result += chr;
            }
            escaped = false;
            continue;
          }
          if (chr === "\\") {
            escaped = true;
            if (depth === 0) {
              result += chr;
            }
            continue;
          }
          if (chr === '"' && depth === 0) {
            inQuote = !inQuote;
            result += chr;
            continue;
          }
          if (!inQuote) {
            if (chr === "(") {
              depth++;
              continue;
            }
            if (chr === ")" && depth > 0) {
              depth--;
              continue;
            }
          }
          if (depth === 0) {
            result += chr;
          }
        }
        return result;
      }
      parseStructuredHeader(str) {
        str = this.stripComments(str);
        let response = {
          value: false,
          params: {}
        };
        let key = false;
        let value = "";
        let stage = "value";
        let quote = false;
        let escaped = false;
        let chr;
        for (let i = 0, len = str.length; i < len; i++) {
          chr = str.charAt(i);
          switch (stage) {
            case "key":
              if (chr === "=") {
                key = value.trim().toLowerCase();
                stage = "value";
                value = "";
                break;
              }
              value += chr;
              break;
            case "value":
              if (escaped) {
                value += chr;
              } else if (chr === "\\") {
                escaped = true;
                continue;
              } else if (quote && chr === quote) {
                quote = false;
              } else if (!quote && chr === '"') {
                quote = chr;
              } else if (!quote && chr === ";") {
                if (key === false) {
                  response.value = value.trim();
                } else {
                  response.params[key] = value.trim();
                }
                stage = "key";
                value = "";
              } else {
                value += chr;
              }
              escaped = false;
              break;
          }
        }
        value = value.trim();
        if (stage === "value") {
          if (key === false) {
            response.value = value;
          } else {
            response.params[key] = value;
          }
        } else if (value) {
          response.params[value.toLowerCase()] = "";
        }
        if (response.value) {
          response.value = response.value.toLowerCase();
        }
        decodeParameterValueContinuations(response);
        return response;
      }
      decodeFlowedText(str, delSp) {
        return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
          if (/ $/.test(previousValue) && !/(^|\n)-- $/.test(previousValue)) {
            if (delSp) {
              return previousValue.slice(0, -1) + currentValue;
            } else {
              return previousValue + currentValue;
            }
          } else {
            return previousValue + "\n" + currentValue;
          }
        }).replace(/^ /gm, "");
      }
      getTextContent() {
        if (!this.content) {
          return "";
        }
        let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
        if (/^flowed$/i.test(this.contentType.parsed.params.format)) {
          str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
        }
        return str;
      }
      processHeaders() {
        for (let i = this.headerLines.length - 1; i >= 0; i--) {
          let line = this.headerLines[i];
          if (i && /^\s/.test(line)) {
            this.headerLines[i - 1] += "\n" + line;
            this.headerLines.splice(i, 1);
          }
        }
        this.rawHeaderLines = [];
        for (let i = this.headerLines.length - 1; i >= 0; i--) {
          let rawLine = this.headerLines[i];
          let sep = rawLine.indexOf(":");
          let rawKey = sep < 0 ? rawLine.trim() : rawLine.substr(0, sep).trim();
          this.rawHeaderLines.push({
            key: rawKey.toLowerCase(),
            line: rawLine
          });
          let normalizedLine = rawLine.replace(/\s+/g, " ");
          sep = normalizedLine.indexOf(":");
          let key = sep < 0 ? normalizedLine.trim() : normalizedLine.substr(0, sep).trim();
          let value = sep < 0 ? "" : normalizedLine.substr(sep + 1).trim();
          this.headers.push({ key: key.toLowerCase(), originalKey: key, value });
          switch (key.toLowerCase()) {
            case "content-type":
              if (this.contentType.default) {
                this.contentType = { value, parsed: {} };
              }
              break;
            case "content-transfer-encoding":
              this.contentTransferEncoding = { value, parsed: {} };
              break;
            case "content-disposition":
              this.contentDisposition = { value, parsed: {} };
              break;
            case "content-id":
              this.contentId = value;
              break;
            case "content-description":
              this.contentDescription = value;
              break;
          }
        }
        this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
        this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
        if (this.contentType.multipart && this.contentType.parsed.params.boundary) {
          this.postalMime.boundaries.push({
            value: textEncoder.encode(this.contentType.parsed.params.boundary),
            node: this
          });
        }
        this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
        this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
        this.setupContentDecoder(this.contentTransferEncoding.encoding);
      }
      feed(line) {
        switch (this.state) {
          case "header":
            if (!line.length) {
              this.state = "body";
              return this.processHeaders();
            }
            this.headerSize += line.length;
            if (this.headerSize > this.options.maxHeadersSize) {
              let error = new Error(`Maximum header size of ${this.options.maxHeadersSize} bytes exceeded`);
              throw error;
            }
            this.headerLines.push(getDecoder().decode(line));
            break;
          case "body": {
            this.contentDecoder.update(line);
          }
        }
      }
    };
  }
});

// ../../node_modules/postal-mime/src/html-entities.js
var htmlEntities, html_entities_default;
var init_html_entities = __esm({
  "../../node_modules/postal-mime/src/html-entities.js"() {
    htmlEntities = {
      "&AElig": "\xC6",
      "&AElig;": "\xC6",
      "&AMP": "&",
      "&AMP;": "&",
      "&Aacute": "\xC1",
      "&Aacute;": "\xC1",
      "&Abreve;": "\u0102",
      "&Acirc": "\xC2",
      "&Acirc;": "\xC2",
      "&Acy;": "\u0410",
      "&Afr;": "\u{1D504}",
      "&Agrave": "\xC0",
      "&Agrave;": "\xC0",
      "&Alpha;": "\u0391",
      "&Amacr;": "\u0100",
      "&And;": "\u2A53",
      "&Aogon;": "\u0104",
      "&Aopf;": "\u{1D538}",
      "&ApplyFunction;": "\u2061",
      "&Aring": "\xC5",
      "&Aring;": "\xC5",
      "&Ascr;": "\u{1D49C}",
      "&Assign;": "\u2254",
      "&Atilde": "\xC3",
      "&Atilde;": "\xC3",
      "&Auml": "\xC4",
      "&Auml;": "\xC4",
      "&Backslash;": "\u2216",
      "&Barv;": "\u2AE7",
      "&Barwed;": "\u2306",
      "&Bcy;": "\u0411",
      "&Because;": "\u2235",
      "&Bernoullis;": "\u212C",
      "&Beta;": "\u0392",
      "&Bfr;": "\u{1D505}",
      "&Bopf;": "\u{1D539}",
      "&Breve;": "\u02D8",
      "&Bscr;": "\u212C",
      "&Bumpeq;": "\u224E",
      "&CHcy;": "\u0427",
      "&COPY": "\xA9",
      "&COPY;": "\xA9",
      "&Cacute;": "\u0106",
      "&Cap;": "\u22D2",
      "&CapitalDifferentialD;": "\u2145",
      "&Cayleys;": "\u212D",
      "&Ccaron;": "\u010C",
      "&Ccedil": "\xC7",
      "&Ccedil;": "\xC7",
      "&Ccirc;": "\u0108",
      "&Cconint;": "\u2230",
      "&Cdot;": "\u010A",
      "&Cedilla;": "\xB8",
      "&CenterDot;": "\xB7",
      "&Cfr;": "\u212D",
      "&Chi;": "\u03A7",
      "&CircleDot;": "\u2299",
      "&CircleMinus;": "\u2296",
      "&CirclePlus;": "\u2295",
      "&CircleTimes;": "\u2297",
      "&ClockwiseContourIntegral;": "\u2232",
      "&CloseCurlyDoubleQuote;": "\u201D",
      "&CloseCurlyQuote;": "\u2019",
      "&Colon;": "\u2237",
      "&Colone;": "\u2A74",
      "&Congruent;": "\u2261",
      "&Conint;": "\u222F",
      "&ContourIntegral;": "\u222E",
      "&Copf;": "\u2102",
      "&Coproduct;": "\u2210",
      "&CounterClockwiseContourIntegral;": "\u2233",
      "&Cross;": "\u2A2F",
      "&Cscr;": "\u{1D49E}",
      "&Cup;": "\u22D3",
      "&CupCap;": "\u224D",
      "&DD;": "\u2145",
      "&DDotrahd;": "\u2911",
      "&DJcy;": "\u0402",
      "&DScy;": "\u0405",
      "&DZcy;": "\u040F",
      "&Dagger;": "\u2021",
      "&Darr;": "\u21A1",
      "&Dashv;": "\u2AE4",
      "&Dcaron;": "\u010E",
      "&Dcy;": "\u0414",
      "&Del;": "\u2207",
      "&Delta;": "\u0394",
      "&Dfr;": "\u{1D507}",
      "&DiacriticalAcute;": "\xB4",
      "&DiacriticalDot;": "\u02D9",
      "&DiacriticalDoubleAcute;": "\u02DD",
      "&DiacriticalGrave;": "`",
      "&DiacriticalTilde;": "\u02DC",
      "&Diamond;": "\u22C4",
      "&DifferentialD;": "\u2146",
      "&Dopf;": "\u{1D53B}",
      "&Dot;": "\xA8",
      "&DotDot;": "\u20DC",
      "&DotEqual;": "\u2250",
      "&DoubleContourIntegral;": "\u222F",
      "&DoubleDot;": "\xA8",
      "&DoubleDownArrow;": "\u21D3",
      "&DoubleLeftArrow;": "\u21D0",
      "&DoubleLeftRightArrow;": "\u21D4",
      "&DoubleLeftTee;": "\u2AE4",
      "&DoubleLongLeftArrow;": "\u27F8",
      "&DoubleLongLeftRightArrow;": "\u27FA",
      "&DoubleLongRightArrow;": "\u27F9",
      "&DoubleRightArrow;": "\u21D2",
      "&DoubleRightTee;": "\u22A8",
      "&DoubleUpArrow;": "\u21D1",
      "&DoubleUpDownArrow;": "\u21D5",
      "&DoubleVerticalBar;": "\u2225",
      "&DownArrow;": "\u2193",
      "&DownArrowBar;": "\u2913",
      "&DownArrowUpArrow;": "\u21F5",
      "&DownBreve;": "\u0311",
      "&DownLeftRightVector;": "\u2950",
      "&DownLeftTeeVector;": "\u295E",
      "&DownLeftVector;": "\u21BD",
      "&DownLeftVectorBar;": "\u2956",
      "&DownRightTeeVector;": "\u295F",
      "&DownRightVector;": "\u21C1",
      "&DownRightVectorBar;": "\u2957",
      "&DownTee;": "\u22A4",
      "&DownTeeArrow;": "\u21A7",
      "&Downarrow;": "\u21D3",
      "&Dscr;": "\u{1D49F}",
      "&Dstrok;": "\u0110",
      "&ENG;": "\u014A",
      "&ETH": "\xD0",
      "&ETH;": "\xD0",
      "&Eacute": "\xC9",
      "&Eacute;": "\xC9",
      "&Ecaron;": "\u011A",
      "&Ecirc": "\xCA",
      "&Ecirc;": "\xCA",
      "&Ecy;": "\u042D",
      "&Edot;": "\u0116",
      "&Efr;": "\u{1D508}",
      "&Egrave": "\xC8",
      "&Egrave;": "\xC8",
      "&Element;": "\u2208",
      "&Emacr;": "\u0112",
      "&EmptySmallSquare;": "\u25FB",
      "&EmptyVerySmallSquare;": "\u25AB",
      "&Eogon;": "\u0118",
      "&Eopf;": "\u{1D53C}",
      "&Epsilon;": "\u0395",
      "&Equal;": "\u2A75",
      "&EqualTilde;": "\u2242",
      "&Equilibrium;": "\u21CC",
      "&Escr;": "\u2130",
      "&Esim;": "\u2A73",
      "&Eta;": "\u0397",
      "&Euml": "\xCB",
      "&Euml;": "\xCB",
      "&Exists;": "\u2203",
      "&ExponentialE;": "\u2147",
      "&Fcy;": "\u0424",
      "&Ffr;": "\u{1D509}",
      "&FilledSmallSquare;": "\u25FC",
      "&FilledVerySmallSquare;": "\u25AA",
      "&Fopf;": "\u{1D53D}",
      "&ForAll;": "\u2200",
      "&Fouriertrf;": "\u2131",
      "&Fscr;": "\u2131",
      "&GJcy;": "\u0403",
      "&GT": ">",
      "&GT;": ">",
      "&Gamma;": "\u0393",
      "&Gammad;": "\u03DC",
      "&Gbreve;": "\u011E",
      "&Gcedil;": "\u0122",
      "&Gcirc;": "\u011C",
      "&Gcy;": "\u0413",
      "&Gdot;": "\u0120",
      "&Gfr;": "\u{1D50A}",
      "&Gg;": "\u22D9",
      "&Gopf;": "\u{1D53E}",
      "&GreaterEqual;": "\u2265",
      "&GreaterEqualLess;": "\u22DB",
      "&GreaterFullEqual;": "\u2267",
      "&GreaterGreater;": "\u2AA2",
      "&GreaterLess;": "\u2277",
      "&GreaterSlantEqual;": "\u2A7E",
      "&GreaterTilde;": "\u2273",
      "&Gscr;": "\u{1D4A2}",
      "&Gt;": "\u226B",
      "&HARDcy;": "\u042A",
      "&Hacek;": "\u02C7",
      "&Hat;": "^",
      "&Hcirc;": "\u0124",
      "&Hfr;": "\u210C",
      "&HilbertSpace;": "\u210B",
      "&Hopf;": "\u210D",
      "&HorizontalLine;": "\u2500",
      "&Hscr;": "\u210B",
      "&Hstrok;": "\u0126",
      "&HumpDownHump;": "\u224E",
      "&HumpEqual;": "\u224F",
      "&IEcy;": "\u0415",
      "&IJlig;": "\u0132",
      "&IOcy;": "\u0401",
      "&Iacute": "\xCD",
      "&Iacute;": "\xCD",
      "&Icirc": "\xCE",
      "&Icirc;": "\xCE",
      "&Icy;": "\u0418",
      "&Idot;": "\u0130",
      "&Ifr;": "\u2111",
      "&Igrave": "\xCC",
      "&Igrave;": "\xCC",
      "&Im;": "\u2111",
      "&Imacr;": "\u012A",
      "&ImaginaryI;": "\u2148",
      "&Implies;": "\u21D2",
      "&Int;": "\u222C",
      "&Integral;": "\u222B",
      "&Intersection;": "\u22C2",
      "&InvisibleComma;": "\u2063",
      "&InvisibleTimes;": "\u2062",
      "&Iogon;": "\u012E",
      "&Iopf;": "\u{1D540}",
      "&Iota;": "\u0399",
      "&Iscr;": "\u2110",
      "&Itilde;": "\u0128",
      "&Iukcy;": "\u0406",
      "&Iuml": "\xCF",
      "&Iuml;": "\xCF",
      "&Jcirc;": "\u0134",
      "&Jcy;": "\u0419",
      "&Jfr;": "\u{1D50D}",
      "&Jopf;": "\u{1D541}",
      "&Jscr;": "\u{1D4A5}",
      "&Jsercy;": "\u0408",
      "&Jukcy;": "\u0404",
      "&KHcy;": "\u0425",
      "&KJcy;": "\u040C",
      "&Kappa;": "\u039A",
      "&Kcedil;": "\u0136",
      "&Kcy;": "\u041A",
      "&Kfr;": "\u{1D50E}",
      "&Kopf;": "\u{1D542}",
      "&Kscr;": "\u{1D4A6}",
      "&LJcy;": "\u0409",
      "&LT": "<",
      "&LT;": "<",
      "&Lacute;": "\u0139",
      "&Lambda;": "\u039B",
      "&Lang;": "\u27EA",
      "&Laplacetrf;": "\u2112",
      "&Larr;": "\u219E",
      "&Lcaron;": "\u013D",
      "&Lcedil;": "\u013B",
      "&Lcy;": "\u041B",
      "&LeftAngleBracket;": "\u27E8",
      "&LeftArrow;": "\u2190",
      "&LeftArrowBar;": "\u21E4",
      "&LeftArrowRightArrow;": "\u21C6",
      "&LeftCeiling;": "\u2308",
      "&LeftDoubleBracket;": "\u27E6",
      "&LeftDownTeeVector;": "\u2961",
      "&LeftDownVector;": "\u21C3",
      "&LeftDownVectorBar;": "\u2959",
      "&LeftFloor;": "\u230A",
      "&LeftRightArrow;": "\u2194",
      "&LeftRightVector;": "\u294E",
      "&LeftTee;": "\u22A3",
      "&LeftTeeArrow;": "\u21A4",
      "&LeftTeeVector;": "\u295A",
      "&LeftTriangle;": "\u22B2",
      "&LeftTriangleBar;": "\u29CF",
      "&LeftTriangleEqual;": "\u22B4",
      "&LeftUpDownVector;": "\u2951",
      "&LeftUpTeeVector;": "\u2960",
      "&LeftUpVector;": "\u21BF",
      "&LeftUpVectorBar;": "\u2958",
      "&LeftVector;": "\u21BC",
      "&LeftVectorBar;": "\u2952",
      "&Leftarrow;": "\u21D0",
      "&Leftrightarrow;": "\u21D4",
      "&LessEqualGreater;": "\u22DA",
      "&LessFullEqual;": "\u2266",
      "&LessGreater;": "\u2276",
      "&LessLess;": "\u2AA1",
      "&LessSlantEqual;": "\u2A7D",
      "&LessTilde;": "\u2272",
      "&Lfr;": "\u{1D50F}",
      "&Ll;": "\u22D8",
      "&Lleftarrow;": "\u21DA",
      "&Lmidot;": "\u013F",
      "&LongLeftArrow;": "\u27F5",
      "&LongLeftRightArrow;": "\u27F7",
      "&LongRightArrow;": "\u27F6",
      "&Longleftarrow;": "\u27F8",
      "&Longleftrightarrow;": "\u27FA",
      "&Longrightarrow;": "\u27F9",
      "&Lopf;": "\u{1D543}",
      "&LowerLeftArrow;": "\u2199",
      "&LowerRightArrow;": "\u2198",
      "&Lscr;": "\u2112",
      "&Lsh;": "\u21B0",
      "&Lstrok;": "\u0141",
      "&Lt;": "\u226A",
      "&Map;": "\u2905",
      "&Mcy;": "\u041C",
      "&MediumSpace;": "\u205F",
      "&Mellintrf;": "\u2133",
      "&Mfr;": "\u{1D510}",
      "&MinusPlus;": "\u2213",
      "&Mopf;": "\u{1D544}",
      "&Mscr;": "\u2133",
      "&Mu;": "\u039C",
      "&NJcy;": "\u040A",
      "&Nacute;": "\u0143",
      "&Ncaron;": "\u0147",
      "&Ncedil;": "\u0145",
      "&Ncy;": "\u041D",
      "&NegativeMediumSpace;": "\u200B",
      "&NegativeThickSpace;": "\u200B",
      "&NegativeThinSpace;": "\u200B",
      "&NegativeVeryThinSpace;": "\u200B",
      "&NestedGreaterGreater;": "\u226B",
      "&NestedLessLess;": "\u226A",
      "&NewLine;": "\n",
      "&Nfr;": "\u{1D511}",
      "&NoBreak;": "\u2060",
      "&NonBreakingSpace;": "\xA0",
      "&Nopf;": "\u2115",
      "&Not;": "\u2AEC",
      "&NotCongruent;": "\u2262",
      "&NotCupCap;": "\u226D",
      "&NotDoubleVerticalBar;": "\u2226",
      "&NotElement;": "\u2209",
      "&NotEqual;": "\u2260",
      "&NotEqualTilde;": "\u2242\u0338",
      "&NotExists;": "\u2204",
      "&NotGreater;": "\u226F",
      "&NotGreaterEqual;": "\u2271",
      "&NotGreaterFullEqual;": "\u2267\u0338",
      "&NotGreaterGreater;": "\u226B\u0338",
      "&NotGreaterLess;": "\u2279",
      "&NotGreaterSlantEqual;": "\u2A7E\u0338",
      "&NotGreaterTilde;": "\u2275",
      "&NotHumpDownHump;": "\u224E\u0338",
      "&NotHumpEqual;": "\u224F\u0338",
      "&NotLeftTriangle;": "\u22EA",
      "&NotLeftTriangleBar;": "\u29CF\u0338",
      "&NotLeftTriangleEqual;": "\u22EC",
      "&NotLess;": "\u226E",
      "&NotLessEqual;": "\u2270",
      "&NotLessGreater;": "\u2278",
      "&NotLessLess;": "\u226A\u0338",
      "&NotLessSlantEqual;": "\u2A7D\u0338",
      "&NotLessTilde;": "\u2274",
      "&NotNestedGreaterGreater;": "\u2AA2\u0338",
      "&NotNestedLessLess;": "\u2AA1\u0338",
      "&NotPrecedes;": "\u2280",
      "&NotPrecedesEqual;": "\u2AAF\u0338",
      "&NotPrecedesSlantEqual;": "\u22E0",
      "&NotReverseElement;": "\u220C",
      "&NotRightTriangle;": "\u22EB",
      "&NotRightTriangleBar;": "\u29D0\u0338",
      "&NotRightTriangleEqual;": "\u22ED",
      "&NotSquareSubset;": "\u228F\u0338",
      "&NotSquareSubsetEqual;": "\u22E2",
      "&NotSquareSuperset;": "\u2290\u0338",
      "&NotSquareSupersetEqual;": "\u22E3",
      "&NotSubset;": "\u2282\u20D2",
      "&NotSubsetEqual;": "\u2288",
      "&NotSucceeds;": "\u2281",
      "&NotSucceedsEqual;": "\u2AB0\u0338",
      "&NotSucceedsSlantEqual;": "\u22E1",
      "&NotSucceedsTilde;": "\u227F\u0338",
      "&NotSuperset;": "\u2283\u20D2",
      "&NotSupersetEqual;": "\u2289",
      "&NotTilde;": "\u2241",
      "&NotTildeEqual;": "\u2244",
      "&NotTildeFullEqual;": "\u2247",
      "&NotTildeTilde;": "\u2249",
      "&NotVerticalBar;": "\u2224",
      "&Nscr;": "\u{1D4A9}",
      "&Ntilde": "\xD1",
      "&Ntilde;": "\xD1",
      "&Nu;": "\u039D",
      "&OElig;": "\u0152",
      "&Oacute": "\xD3",
      "&Oacute;": "\xD3",
      "&Ocirc": "\xD4",
      "&Ocirc;": "\xD4",
      "&Ocy;": "\u041E",
      "&Odblac;": "\u0150",
      "&Ofr;": "\u{1D512}",
      "&Ograve": "\xD2",
      "&Ograve;": "\xD2",
      "&Omacr;": "\u014C",
      "&Omega;": "\u03A9",
      "&Omicron;": "\u039F",
      "&Oopf;": "\u{1D546}",
      "&OpenCurlyDoubleQuote;": "\u201C",
      "&OpenCurlyQuote;": "\u2018",
      "&Or;": "\u2A54",
      "&Oscr;": "\u{1D4AA}",
      "&Oslash": "\xD8",
      "&Oslash;": "\xD8",
      "&Otilde": "\xD5",
      "&Otilde;": "\xD5",
      "&Otimes;": "\u2A37",
      "&Ouml": "\xD6",
      "&Ouml;": "\xD6",
      "&OverBar;": "\u203E",
      "&OverBrace;": "\u23DE",
      "&OverBracket;": "\u23B4",
      "&OverParenthesis;": "\u23DC",
      "&PartialD;": "\u2202",
      "&Pcy;": "\u041F",
      "&Pfr;": "\u{1D513}",
      "&Phi;": "\u03A6",
      "&Pi;": "\u03A0",
      "&PlusMinus;": "\xB1",
      "&Poincareplane;": "\u210C",
      "&Popf;": "\u2119",
      "&Pr;": "\u2ABB",
      "&Precedes;": "\u227A",
      "&PrecedesEqual;": "\u2AAF",
      "&PrecedesSlantEqual;": "\u227C",
      "&PrecedesTilde;": "\u227E",
      "&Prime;": "\u2033",
      "&Product;": "\u220F",
      "&Proportion;": "\u2237",
      "&Proportional;": "\u221D",
      "&Pscr;": "\u{1D4AB}",
      "&Psi;": "\u03A8",
      "&QUOT": '"',
      "&QUOT;": '"',
      "&Qfr;": "\u{1D514}",
      "&Qopf;": "\u211A",
      "&Qscr;": "\u{1D4AC}",
      "&RBarr;": "\u2910",
      "&REG": "\xAE",
      "&REG;": "\xAE",
      "&Racute;": "\u0154",
      "&Rang;": "\u27EB",
      "&Rarr;": "\u21A0",
      "&Rarrtl;": "\u2916",
      "&Rcaron;": "\u0158",
      "&Rcedil;": "\u0156",
      "&Rcy;": "\u0420",
      "&Re;": "\u211C",
      "&ReverseElement;": "\u220B",
      "&ReverseEquilibrium;": "\u21CB",
      "&ReverseUpEquilibrium;": "\u296F",
      "&Rfr;": "\u211C",
      "&Rho;": "\u03A1",
      "&RightAngleBracket;": "\u27E9",
      "&RightArrow;": "\u2192",
      "&RightArrowBar;": "\u21E5",
      "&RightArrowLeftArrow;": "\u21C4",
      "&RightCeiling;": "\u2309",
      "&RightDoubleBracket;": "\u27E7",
      "&RightDownTeeVector;": "\u295D",
      "&RightDownVector;": "\u21C2",
      "&RightDownVectorBar;": "\u2955",
      "&RightFloor;": "\u230B",
      "&RightTee;": "\u22A2",
      "&RightTeeArrow;": "\u21A6",
      "&RightTeeVector;": "\u295B",
      "&RightTriangle;": "\u22B3",
      "&RightTriangleBar;": "\u29D0",
      "&RightTriangleEqual;": "\u22B5",
      "&RightUpDownVector;": "\u294F",
      "&RightUpTeeVector;": "\u295C",
      "&RightUpVector;": "\u21BE",
      "&RightUpVectorBar;": "\u2954",
      "&RightVector;": "\u21C0",
      "&RightVectorBar;": "\u2953",
      "&Rightarrow;": "\u21D2",
      "&Ropf;": "\u211D",
      "&RoundImplies;": "\u2970",
      "&Rrightarrow;": "\u21DB",
      "&Rscr;": "\u211B",
      "&Rsh;": "\u21B1",
      "&RuleDelayed;": "\u29F4",
      "&SHCHcy;": "\u0429",
      "&SHcy;": "\u0428",
      "&SOFTcy;": "\u042C",
      "&Sacute;": "\u015A",
      "&Sc;": "\u2ABC",
      "&Scaron;": "\u0160",
      "&Scedil;": "\u015E",
      "&Scirc;": "\u015C",
      "&Scy;": "\u0421",
      "&Sfr;": "\u{1D516}",
      "&ShortDownArrow;": "\u2193",
      "&ShortLeftArrow;": "\u2190",
      "&ShortRightArrow;": "\u2192",
      "&ShortUpArrow;": "\u2191",
      "&Sigma;": "\u03A3",
      "&SmallCircle;": "\u2218",
      "&Sopf;": "\u{1D54A}",
      "&Sqrt;": "\u221A",
      "&Square;": "\u25A1",
      "&SquareIntersection;": "\u2293",
      "&SquareSubset;": "\u228F",
      "&SquareSubsetEqual;": "\u2291",
      "&SquareSuperset;": "\u2290",
      "&SquareSupersetEqual;": "\u2292",
      "&SquareUnion;": "\u2294",
      "&Sscr;": "\u{1D4AE}",
      "&Star;": "\u22C6",
      "&Sub;": "\u22D0",
      "&Subset;": "\u22D0",
      "&SubsetEqual;": "\u2286",
      "&Succeeds;": "\u227B",
      "&SucceedsEqual;": "\u2AB0",
      "&SucceedsSlantEqual;": "\u227D",
      "&SucceedsTilde;": "\u227F",
      "&SuchThat;": "\u220B",
      "&Sum;": "\u2211",
      "&Sup;": "\u22D1",
      "&Superset;": "\u2283",
      "&SupersetEqual;": "\u2287",
      "&Supset;": "\u22D1",
      "&THORN": "\xDE",
      "&THORN;": "\xDE",
      "&TRADE;": "\u2122",
      "&TSHcy;": "\u040B",
      "&TScy;": "\u0426",
      "&Tab;": "	",
      "&Tau;": "\u03A4",
      "&Tcaron;": "\u0164",
      "&Tcedil;": "\u0162",
      "&Tcy;": "\u0422",
      "&Tfr;": "\u{1D517}",
      "&Therefore;": "\u2234",
      "&Theta;": "\u0398",
      "&ThickSpace;": "\u205F\u200A",
      "&ThinSpace;": "\u2009",
      "&Tilde;": "\u223C",
      "&TildeEqual;": "\u2243",
      "&TildeFullEqual;": "\u2245",
      "&TildeTilde;": "\u2248",
      "&Topf;": "\u{1D54B}",
      "&TripleDot;": "\u20DB",
      "&Tscr;": "\u{1D4AF}",
      "&Tstrok;": "\u0166",
      "&Uacute": "\xDA",
      "&Uacute;": "\xDA",
      "&Uarr;": "\u219F",
      "&Uarrocir;": "\u2949",
      "&Ubrcy;": "\u040E",
      "&Ubreve;": "\u016C",
      "&Ucirc": "\xDB",
      "&Ucirc;": "\xDB",
      "&Ucy;": "\u0423",
      "&Udblac;": "\u0170",
      "&Ufr;": "\u{1D518}",
      "&Ugrave": "\xD9",
      "&Ugrave;": "\xD9",
      "&Umacr;": "\u016A",
      "&UnderBar;": "_",
      "&UnderBrace;": "\u23DF",
      "&UnderBracket;": "\u23B5",
      "&UnderParenthesis;": "\u23DD",
      "&Union;": "\u22C3",
      "&UnionPlus;": "\u228E",
      "&Uogon;": "\u0172",
      "&Uopf;": "\u{1D54C}",
      "&UpArrow;": "\u2191",
      "&UpArrowBar;": "\u2912",
      "&UpArrowDownArrow;": "\u21C5",
      "&UpDownArrow;": "\u2195",
      "&UpEquilibrium;": "\u296E",
      "&UpTee;": "\u22A5",
      "&UpTeeArrow;": "\u21A5",
      "&Uparrow;": "\u21D1",
      "&Updownarrow;": "\u21D5",
      "&UpperLeftArrow;": "\u2196",
      "&UpperRightArrow;": "\u2197",
      "&Upsi;": "\u03D2",
      "&Upsilon;": "\u03A5",
      "&Uring;": "\u016E",
      "&Uscr;": "\u{1D4B0}",
      "&Utilde;": "\u0168",
      "&Uuml": "\xDC",
      "&Uuml;": "\xDC",
      "&VDash;": "\u22AB",
      "&Vbar;": "\u2AEB",
      "&Vcy;": "\u0412",
      "&Vdash;": "\u22A9",
      "&Vdashl;": "\u2AE6",
      "&Vee;": "\u22C1",
      "&Verbar;": "\u2016",
      "&Vert;": "\u2016",
      "&VerticalBar;": "\u2223",
      "&VerticalLine;": "|",
      "&VerticalSeparator;": "\u2758",
      "&VerticalTilde;": "\u2240",
      "&VeryThinSpace;": "\u200A",
      "&Vfr;": "\u{1D519}",
      "&Vopf;": "\u{1D54D}",
      "&Vscr;": "\u{1D4B1}",
      "&Vvdash;": "\u22AA",
      "&Wcirc;": "\u0174",
      "&Wedge;": "\u22C0",
      "&Wfr;": "\u{1D51A}",
      "&Wopf;": "\u{1D54E}",
      "&Wscr;": "\u{1D4B2}",
      "&Xfr;": "\u{1D51B}",
      "&Xi;": "\u039E",
      "&Xopf;": "\u{1D54F}",
      "&Xscr;": "\u{1D4B3}",
      "&YAcy;": "\u042F",
      "&YIcy;": "\u0407",
      "&YUcy;": "\u042E",
      "&Yacute": "\xDD",
      "&Yacute;": "\xDD",
      "&Ycirc;": "\u0176",
      "&Ycy;": "\u042B",
      "&Yfr;": "\u{1D51C}",
      "&Yopf;": "\u{1D550}",
      "&Yscr;": "\u{1D4B4}",
      "&Yuml;": "\u0178",
      "&ZHcy;": "\u0416",
      "&Zacute;": "\u0179",
      "&Zcaron;": "\u017D",
      "&Zcy;": "\u0417",
      "&Zdot;": "\u017B",
      "&ZeroWidthSpace;": "\u200B",
      "&Zeta;": "\u0396",
      "&Zfr;": "\u2128",
      "&Zopf;": "\u2124",
      "&Zscr;": "\u{1D4B5}",
      "&aacute": "\xE1",
      "&aacute;": "\xE1",
      "&abreve;": "\u0103",
      "&ac;": "\u223E",
      "&acE;": "\u223E\u0333",
      "&acd;": "\u223F",
      "&acirc": "\xE2",
      "&acirc;": "\xE2",
      "&acute": "\xB4",
      "&acute;": "\xB4",
      "&acy;": "\u0430",
      "&aelig": "\xE6",
      "&aelig;": "\xE6",
      "&af;": "\u2061",
      "&afr;": "\u{1D51E}",
      "&agrave": "\xE0",
      "&agrave;": "\xE0",
      "&alefsym;": "\u2135",
      "&aleph;": "\u2135",
      "&alpha;": "\u03B1",
      "&amacr;": "\u0101",
      "&amalg;": "\u2A3F",
      "&amp": "&",
      "&amp;": "&",
      "&and;": "\u2227",
      "&andand;": "\u2A55",
      "&andd;": "\u2A5C",
      "&andslope;": "\u2A58",
      "&andv;": "\u2A5A",
      "&ang;": "\u2220",
      "&ange;": "\u29A4",
      "&angle;": "\u2220",
      "&angmsd;": "\u2221",
      "&angmsdaa;": "\u29A8",
      "&angmsdab;": "\u29A9",
      "&angmsdac;": "\u29AA",
      "&angmsdad;": "\u29AB",
      "&angmsdae;": "\u29AC",
      "&angmsdaf;": "\u29AD",
      "&angmsdag;": "\u29AE",
      "&angmsdah;": "\u29AF",
      "&angrt;": "\u221F",
      "&angrtvb;": "\u22BE",
      "&angrtvbd;": "\u299D",
      "&angsph;": "\u2222",
      "&angst;": "\xC5",
      "&angzarr;": "\u237C",
      "&aogon;": "\u0105",
      "&aopf;": "\u{1D552}",
      "&ap;": "\u2248",
      "&apE;": "\u2A70",
      "&apacir;": "\u2A6F",
      "&ape;": "\u224A",
      "&apid;": "\u224B",
      "&apos;": "'",
      "&approx;": "\u2248",
      "&approxeq;": "\u224A",
      "&aring": "\xE5",
      "&aring;": "\xE5",
      "&ascr;": "\u{1D4B6}",
      "&ast;": "*",
      "&asymp;": "\u2248",
      "&asympeq;": "\u224D",
      "&atilde": "\xE3",
      "&atilde;": "\xE3",
      "&auml": "\xE4",
      "&auml;": "\xE4",
      "&awconint;": "\u2233",
      "&awint;": "\u2A11",
      "&bNot;": "\u2AED",
      "&backcong;": "\u224C",
      "&backepsilon;": "\u03F6",
      "&backprime;": "\u2035",
      "&backsim;": "\u223D",
      "&backsimeq;": "\u22CD",
      "&barvee;": "\u22BD",
      "&barwed;": "\u2305",
      "&barwedge;": "\u2305",
      "&bbrk;": "\u23B5",
      "&bbrktbrk;": "\u23B6",
      "&bcong;": "\u224C",
      "&bcy;": "\u0431",
      "&bdquo;": "\u201E",
      "&becaus;": "\u2235",
      "&because;": "\u2235",
      "&bemptyv;": "\u29B0",
      "&bepsi;": "\u03F6",
      "&bernou;": "\u212C",
      "&beta;": "\u03B2",
      "&beth;": "\u2136",
      "&between;": "\u226C",
      "&bfr;": "\u{1D51F}",
      "&bigcap;": "\u22C2",
      "&bigcirc;": "\u25EF",
      "&bigcup;": "\u22C3",
      "&bigodot;": "\u2A00",
      "&bigoplus;": "\u2A01",
      "&bigotimes;": "\u2A02",
      "&bigsqcup;": "\u2A06",
      "&bigstar;": "\u2605",
      "&bigtriangledown;": "\u25BD",
      "&bigtriangleup;": "\u25B3",
      "&biguplus;": "\u2A04",
      "&bigvee;": "\u22C1",
      "&bigwedge;": "\u22C0",
      "&bkarow;": "\u290D",
      "&blacklozenge;": "\u29EB",
      "&blacksquare;": "\u25AA",
      "&blacktriangle;": "\u25B4",
      "&blacktriangledown;": "\u25BE",
      "&blacktriangleleft;": "\u25C2",
      "&blacktriangleright;": "\u25B8",
      "&blank;": "\u2423",
      "&blk12;": "\u2592",
      "&blk14;": "\u2591",
      "&blk34;": "\u2593",
      "&block;": "\u2588",
      "&bne;": "=\u20E5",
      "&bnequiv;": "\u2261\u20E5",
      "&bnot;": "\u2310",
      "&bopf;": "\u{1D553}",
      "&bot;": "\u22A5",
      "&bottom;": "\u22A5",
      "&bowtie;": "\u22C8",
      "&boxDL;": "\u2557",
      "&boxDR;": "\u2554",
      "&boxDl;": "\u2556",
      "&boxDr;": "\u2553",
      "&boxH;": "\u2550",
      "&boxHD;": "\u2566",
      "&boxHU;": "\u2569",
      "&boxHd;": "\u2564",
      "&boxHu;": "\u2567",
      "&boxUL;": "\u255D",
      "&boxUR;": "\u255A",
      "&boxUl;": "\u255C",
      "&boxUr;": "\u2559",
      "&boxV;": "\u2551",
      "&boxVH;": "\u256C",
      "&boxVL;": "\u2563",
      "&boxVR;": "\u2560",
      "&boxVh;": "\u256B",
      "&boxVl;": "\u2562",
      "&boxVr;": "\u255F",
      "&boxbox;": "\u29C9",
      "&boxdL;": "\u2555",
      "&boxdR;": "\u2552",
      "&boxdl;": "\u2510",
      "&boxdr;": "\u250C",
      "&boxh;": "\u2500",
      "&boxhD;": "\u2565",
      "&boxhU;": "\u2568",
      "&boxhd;": "\u252C",
      "&boxhu;": "\u2534",
      "&boxminus;": "\u229F",
      "&boxplus;": "\u229E",
      "&boxtimes;": "\u22A0",
      "&boxuL;": "\u255B",
      "&boxuR;": "\u2558",
      "&boxul;": "\u2518",
      "&boxur;": "\u2514",
      "&boxv;": "\u2502",
      "&boxvH;": "\u256A",
      "&boxvL;": "\u2561",
      "&boxvR;": "\u255E",
      "&boxvh;": "\u253C",
      "&boxvl;": "\u2524",
      "&boxvr;": "\u251C",
      "&bprime;": "\u2035",
      "&breve;": "\u02D8",
      "&brvbar": "\xA6",
      "&brvbar;": "\xA6",
      "&bscr;": "\u{1D4B7}",
      "&bsemi;": "\u204F",
      "&bsim;": "\u223D",
      "&bsime;": "\u22CD",
      "&bsol;": "\\",
      "&bsolb;": "\u29C5",
      "&bsolhsub;": "\u27C8",
      "&bull;": "\u2022",
      "&bullet;": "\u2022",
      "&bump;": "\u224E",
      "&bumpE;": "\u2AAE",
      "&bumpe;": "\u224F",
      "&bumpeq;": "\u224F",
      "&cacute;": "\u0107",
      "&cap;": "\u2229",
      "&capand;": "\u2A44",
      "&capbrcup;": "\u2A49",
      "&capcap;": "\u2A4B",
      "&capcup;": "\u2A47",
      "&capdot;": "\u2A40",
      "&caps;": "\u2229\uFE00",
      "&caret;": "\u2041",
      "&caron;": "\u02C7",
      "&ccaps;": "\u2A4D",
      "&ccaron;": "\u010D",
      "&ccedil": "\xE7",
      "&ccedil;": "\xE7",
      "&ccirc;": "\u0109",
      "&ccups;": "\u2A4C",
      "&ccupssm;": "\u2A50",
      "&cdot;": "\u010B",
      "&cedil": "\xB8",
      "&cedil;": "\xB8",
      "&cemptyv;": "\u29B2",
      "&cent": "\xA2",
      "&cent;": "\xA2",
      "&centerdot;": "\xB7",
      "&cfr;": "\u{1D520}",
      "&chcy;": "\u0447",
      "&check;": "\u2713",
      "&checkmark;": "\u2713",
      "&chi;": "\u03C7",
      "&cir;": "\u25CB",
      "&cirE;": "\u29C3",
      "&circ;": "\u02C6",
      "&circeq;": "\u2257",
      "&circlearrowleft;": "\u21BA",
      "&circlearrowright;": "\u21BB",
      "&circledR;": "\xAE",
      "&circledS;": "\u24C8",
      "&circledast;": "\u229B",
      "&circledcirc;": "\u229A",
      "&circleddash;": "\u229D",
      "&cire;": "\u2257",
      "&cirfnint;": "\u2A10",
      "&cirmid;": "\u2AEF",
      "&cirscir;": "\u29C2",
      "&clubs;": "\u2663",
      "&clubsuit;": "\u2663",
      "&colon;": ":",
      "&colone;": "\u2254",
      "&coloneq;": "\u2254",
      "&comma;": ",",
      "&commat;": "@",
      "&comp;": "\u2201",
      "&compfn;": "\u2218",
      "&complement;": "\u2201",
      "&complexes;": "\u2102",
      "&cong;": "\u2245",
      "&congdot;": "\u2A6D",
      "&conint;": "\u222E",
      "&copf;": "\u{1D554}",
      "&coprod;": "\u2210",
      "&copy": "\xA9",
      "&copy;": "\xA9",
      "&copysr;": "\u2117",
      "&crarr;": "\u21B5",
      "&cross;": "\u2717",
      "&cscr;": "\u{1D4B8}",
      "&csub;": "\u2ACF",
      "&csube;": "\u2AD1",
      "&csup;": "\u2AD0",
      "&csupe;": "\u2AD2",
      "&ctdot;": "\u22EF",
      "&cudarrl;": "\u2938",
      "&cudarrr;": "\u2935",
      "&cuepr;": "\u22DE",
      "&cuesc;": "\u22DF",
      "&cularr;": "\u21B6",
      "&cularrp;": "\u293D",
      "&cup;": "\u222A",
      "&cupbrcap;": "\u2A48",
      "&cupcap;": "\u2A46",
      "&cupcup;": "\u2A4A",
      "&cupdot;": "\u228D",
      "&cupor;": "\u2A45",
      "&cups;": "\u222A\uFE00",
      "&curarr;": "\u21B7",
      "&curarrm;": "\u293C",
      "&curlyeqprec;": "\u22DE",
      "&curlyeqsucc;": "\u22DF",
      "&curlyvee;": "\u22CE",
      "&curlywedge;": "\u22CF",
      "&curren": "\xA4",
      "&curren;": "\xA4",
      "&curvearrowleft;": "\u21B6",
      "&curvearrowright;": "\u21B7",
      "&cuvee;": "\u22CE",
      "&cuwed;": "\u22CF",
      "&cwconint;": "\u2232",
      "&cwint;": "\u2231",
      "&cylcty;": "\u232D",
      "&dArr;": "\u21D3",
      "&dHar;": "\u2965",
      "&dagger;": "\u2020",
      "&daleth;": "\u2138",
      "&darr;": "\u2193",
      "&dash;": "\u2010",
      "&dashv;": "\u22A3",
      "&dbkarow;": "\u290F",
      "&dblac;": "\u02DD",
      "&dcaron;": "\u010F",
      "&dcy;": "\u0434",
      "&dd;": "\u2146",
      "&ddagger;": "\u2021",
      "&ddarr;": "\u21CA",
      "&ddotseq;": "\u2A77",
      "&deg": "\xB0",
      "&deg;": "\xB0",
      "&delta;": "\u03B4",
      "&demptyv;": "\u29B1",
      "&dfisht;": "\u297F",
      "&dfr;": "\u{1D521}",
      "&dharl;": "\u21C3",
      "&dharr;": "\u21C2",
      "&diam;": "\u22C4",
      "&diamond;": "\u22C4",
      "&diamondsuit;": "\u2666",
      "&diams;": "\u2666",
      "&die;": "\xA8",
      "&digamma;": "\u03DD",
      "&disin;": "\u22F2",
      "&div;": "\xF7",
      "&divide": "\xF7",
      "&divide;": "\xF7",
      "&divideontimes;": "\u22C7",
      "&divonx;": "\u22C7",
      "&djcy;": "\u0452",
      "&dlcorn;": "\u231E",
      "&dlcrop;": "\u230D",
      "&dollar;": "$",
      "&dopf;": "\u{1D555}",
      "&dot;": "\u02D9",
      "&doteq;": "\u2250",
      "&doteqdot;": "\u2251",
      "&dotminus;": "\u2238",
      "&dotplus;": "\u2214",
      "&dotsquare;": "\u22A1",
      "&doublebarwedge;": "\u2306",
      "&downarrow;": "\u2193",
      "&downdownarrows;": "\u21CA",
      "&downharpoonleft;": "\u21C3",
      "&downharpoonright;": "\u21C2",
      "&drbkarow;": "\u2910",
      "&drcorn;": "\u231F",
      "&drcrop;": "\u230C",
      "&dscr;": "\u{1D4B9}",
      "&dscy;": "\u0455",
      "&dsol;": "\u29F6",
      "&dstrok;": "\u0111",
      "&dtdot;": "\u22F1",
      "&dtri;": "\u25BF",
      "&dtrif;": "\u25BE",
      "&duarr;": "\u21F5",
      "&duhar;": "\u296F",
      "&dwangle;": "\u29A6",
      "&dzcy;": "\u045F",
      "&dzigrarr;": "\u27FF",
      "&eDDot;": "\u2A77",
      "&eDot;": "\u2251",
      "&eacute": "\xE9",
      "&eacute;": "\xE9",
      "&easter;": "\u2A6E",
      "&ecaron;": "\u011B",
      "&ecir;": "\u2256",
      "&ecirc": "\xEA",
      "&ecirc;": "\xEA",
      "&ecolon;": "\u2255",
      "&ecy;": "\u044D",
      "&edot;": "\u0117",
      "&ee;": "\u2147",
      "&efDot;": "\u2252",
      "&efr;": "\u{1D522}",
      "&eg;": "\u2A9A",
      "&egrave": "\xE8",
      "&egrave;": "\xE8",
      "&egs;": "\u2A96",
      "&egsdot;": "\u2A98",
      "&el;": "\u2A99",
      "&elinters;": "\u23E7",
      "&ell;": "\u2113",
      "&els;": "\u2A95",
      "&elsdot;": "\u2A97",
      "&emacr;": "\u0113",
      "&empty;": "\u2205",
      "&emptyset;": "\u2205",
      "&emptyv;": "\u2205",
      "&emsp13;": "\u2004",
      "&emsp14;": "\u2005",
      "&emsp;": "\u2003",
      "&eng;": "\u014B",
      "&ensp;": "\u2002",
      "&eogon;": "\u0119",
      "&eopf;": "\u{1D556}",
      "&epar;": "\u22D5",
      "&eparsl;": "\u29E3",
      "&eplus;": "\u2A71",
      "&epsi;": "\u03B5",
      "&epsilon;": "\u03B5",
      "&epsiv;": "\u03F5",
      "&eqcirc;": "\u2256",
      "&eqcolon;": "\u2255",
      "&eqsim;": "\u2242",
      "&eqslantgtr;": "\u2A96",
      "&eqslantless;": "\u2A95",
      "&equals;": "=",
      "&equest;": "\u225F",
      "&equiv;": "\u2261",
      "&equivDD;": "\u2A78",
      "&eqvparsl;": "\u29E5",
      "&erDot;": "\u2253",
      "&erarr;": "\u2971",
      "&escr;": "\u212F",
      "&esdot;": "\u2250",
      "&esim;": "\u2242",
      "&eta;": "\u03B7",
      "&eth": "\xF0",
      "&eth;": "\xF0",
      "&euml": "\xEB",
      "&euml;": "\xEB",
      "&euro;": "\u20AC",
      "&excl;": "!",
      "&exist;": "\u2203",
      "&expectation;": "\u2130",
      "&exponentiale;": "\u2147",
      "&fallingdotseq;": "\u2252",
      "&fcy;": "\u0444",
      "&female;": "\u2640",
      "&ffilig;": "\uFB03",
      "&fflig;": "\uFB00",
      "&ffllig;": "\uFB04",
      "&ffr;": "\u{1D523}",
      "&filig;": "\uFB01",
      "&fjlig;": "fj",
      "&flat;": "\u266D",
      "&fllig;": "\uFB02",
      "&fltns;": "\u25B1",
      "&fnof;": "\u0192",
      "&fopf;": "\u{1D557}",
      "&forall;": "\u2200",
      "&fork;": "\u22D4",
      "&forkv;": "\u2AD9",
      "&fpartint;": "\u2A0D",
      "&frac12": "\xBD",
      "&frac12;": "\xBD",
      "&frac13;": "\u2153",
      "&frac14": "\xBC",
      "&frac14;": "\xBC",
      "&frac15;": "\u2155",
      "&frac16;": "\u2159",
      "&frac18;": "\u215B",
      "&frac23;": "\u2154",
      "&frac25;": "\u2156",
      "&frac34": "\xBE",
      "&frac34;": "\xBE",
      "&frac35;": "\u2157",
      "&frac38;": "\u215C",
      "&frac45;": "\u2158",
      "&frac56;": "\u215A",
      "&frac58;": "\u215D",
      "&frac78;": "\u215E",
      "&frasl;": "\u2044",
      "&frown;": "\u2322",
      "&fscr;": "\u{1D4BB}",
      "&gE;": "\u2267",
      "&gEl;": "\u2A8C",
      "&gacute;": "\u01F5",
      "&gamma;": "\u03B3",
      "&gammad;": "\u03DD",
      "&gap;": "\u2A86",
      "&gbreve;": "\u011F",
      "&gcirc;": "\u011D",
      "&gcy;": "\u0433",
      "&gdot;": "\u0121",
      "&ge;": "\u2265",
      "&gel;": "\u22DB",
      "&geq;": "\u2265",
      "&geqq;": "\u2267",
      "&geqslant;": "\u2A7E",
      "&ges;": "\u2A7E",
      "&gescc;": "\u2AA9",
      "&gesdot;": "\u2A80",
      "&gesdoto;": "\u2A82",
      "&gesdotol;": "\u2A84",
      "&gesl;": "\u22DB\uFE00",
      "&gesles;": "\u2A94",
      "&gfr;": "\u{1D524}",
      "&gg;": "\u226B",
      "&ggg;": "\u22D9",
      "&gimel;": "\u2137",
      "&gjcy;": "\u0453",
      "&gl;": "\u2277",
      "&glE;": "\u2A92",
      "&gla;": "\u2AA5",
      "&glj;": "\u2AA4",
      "&gnE;": "\u2269",
      "&gnap;": "\u2A8A",
      "&gnapprox;": "\u2A8A",
      "&gne;": "\u2A88",
      "&gneq;": "\u2A88",
      "&gneqq;": "\u2269",
      "&gnsim;": "\u22E7",
      "&gopf;": "\u{1D558}",
      "&grave;": "`",
      "&gscr;": "\u210A",
      "&gsim;": "\u2273",
      "&gsime;": "\u2A8E",
      "&gsiml;": "\u2A90",
      "&gt": ">",
      "&gt;": ">",
      "&gtcc;": "\u2AA7",
      "&gtcir;": "\u2A7A",
      "&gtdot;": "\u22D7",
      "&gtlPar;": "\u2995",
      "&gtquest;": "\u2A7C",
      "&gtrapprox;": "\u2A86",
      "&gtrarr;": "\u2978",
      "&gtrdot;": "\u22D7",
      "&gtreqless;": "\u22DB",
      "&gtreqqless;": "\u2A8C",
      "&gtrless;": "\u2277",
      "&gtrsim;": "\u2273",
      "&gvertneqq;": "\u2269\uFE00",
      "&gvnE;": "\u2269\uFE00",
      "&hArr;": "\u21D4",
      "&hairsp;": "\u200A",
      "&half;": "\xBD",
      "&hamilt;": "\u210B",
      "&hardcy;": "\u044A",
      "&harr;": "\u2194",
      "&harrcir;": "\u2948",
      "&harrw;": "\u21AD",
      "&hbar;": "\u210F",
      "&hcirc;": "\u0125",
      "&hearts;": "\u2665",
      "&heartsuit;": "\u2665",
      "&hellip;": "\u2026",
      "&hercon;": "\u22B9",
      "&hfr;": "\u{1D525}",
      "&hksearow;": "\u2925",
      "&hkswarow;": "\u2926",
      "&hoarr;": "\u21FF",
      "&homtht;": "\u223B",
      "&hookleftarrow;": "\u21A9",
      "&hookrightarrow;": "\u21AA",
      "&hopf;": "\u{1D559}",
      "&horbar;": "\u2015",
      "&hscr;": "\u{1D4BD}",
      "&hslash;": "\u210F",
      "&hstrok;": "\u0127",
      "&hybull;": "\u2043",
      "&hyphen;": "\u2010",
      "&iacute": "\xED",
      "&iacute;": "\xED",
      "&ic;": "\u2063",
      "&icirc": "\xEE",
      "&icirc;": "\xEE",
      "&icy;": "\u0438",
      "&iecy;": "\u0435",
      "&iexcl": "\xA1",
      "&iexcl;": "\xA1",
      "&iff;": "\u21D4",
      "&ifr;": "\u{1D526}",
      "&igrave": "\xEC",
      "&igrave;": "\xEC",
      "&ii;": "\u2148",
      "&iiiint;": "\u2A0C",
      "&iiint;": "\u222D",
      "&iinfin;": "\u29DC",
      "&iiota;": "\u2129",
      "&ijlig;": "\u0133",
      "&imacr;": "\u012B",
      "&image;": "\u2111",
      "&imagline;": "\u2110",
      "&imagpart;": "\u2111",
      "&imath;": "\u0131",
      "&imof;": "\u22B7",
      "&imped;": "\u01B5",
      "&in;": "\u2208",
      "&incare;": "\u2105",
      "&infin;": "\u221E",
      "&infintie;": "\u29DD",
      "&inodot;": "\u0131",
      "&int;": "\u222B",
      "&intcal;": "\u22BA",
      "&integers;": "\u2124",
      "&intercal;": "\u22BA",
      "&intlarhk;": "\u2A17",
      "&intprod;": "\u2A3C",
      "&iocy;": "\u0451",
      "&iogon;": "\u012F",
      "&iopf;": "\u{1D55A}",
      "&iota;": "\u03B9",
      "&iprod;": "\u2A3C",
      "&iquest": "\xBF",
      "&iquest;": "\xBF",
      "&iscr;": "\u{1D4BE}",
      "&isin;": "\u2208",
      "&isinE;": "\u22F9",
      "&isindot;": "\u22F5",
      "&isins;": "\u22F4",
      "&isinsv;": "\u22F3",
      "&isinv;": "\u2208",
      "&it;": "\u2062",
      "&itilde;": "\u0129",
      "&iukcy;": "\u0456",
      "&iuml": "\xEF",
      "&iuml;": "\xEF",
      "&jcirc;": "\u0135",
      "&jcy;": "\u0439",
      "&jfr;": "\u{1D527}",
      "&jmath;": "\u0237",
      "&jopf;": "\u{1D55B}",
      "&jscr;": "\u{1D4BF}",
      "&jsercy;": "\u0458",
      "&jukcy;": "\u0454",
      "&kappa;": "\u03BA",
      "&kappav;": "\u03F0",
      "&kcedil;": "\u0137",
      "&kcy;": "\u043A",
      "&kfr;": "\u{1D528}",
      "&kgreen;": "\u0138",
      "&khcy;": "\u0445",
      "&kjcy;": "\u045C",
      "&kopf;": "\u{1D55C}",
      "&kscr;": "\u{1D4C0}",
      "&lAarr;": "\u21DA",
      "&lArr;": "\u21D0",
      "&lAtail;": "\u291B",
      "&lBarr;": "\u290E",
      "&lE;": "\u2266",
      "&lEg;": "\u2A8B",
      "&lHar;": "\u2962",
      "&lacute;": "\u013A",
      "&laemptyv;": "\u29B4",
      "&lagran;": "\u2112",
      "&lambda;": "\u03BB",
      "&lang;": "\u27E8",
      "&langd;": "\u2991",
      "&langle;": "\u27E8",
      "&lap;": "\u2A85",
      "&laquo": "\xAB",
      "&laquo;": "\xAB",
      "&larr;": "\u2190",
      "&larrb;": "\u21E4",
      "&larrbfs;": "\u291F",
      "&larrfs;": "\u291D",
      "&larrhk;": "\u21A9",
      "&larrlp;": "\u21AB",
      "&larrpl;": "\u2939",
      "&larrsim;": "\u2973",
      "&larrtl;": "\u21A2",
      "&lat;": "\u2AAB",
      "&latail;": "\u2919",
      "&late;": "\u2AAD",
      "&lates;": "\u2AAD\uFE00",
      "&lbarr;": "\u290C",
      "&lbbrk;": "\u2772",
      "&lbrace;": "{",
      "&lbrack;": "[",
      "&lbrke;": "\u298B",
      "&lbrksld;": "\u298F",
      "&lbrkslu;": "\u298D",
      "&lcaron;": "\u013E",
      "&lcedil;": "\u013C",
      "&lceil;": "\u2308",
      "&lcub;": "{",
      "&lcy;": "\u043B",
      "&ldca;": "\u2936",
      "&ldquo;": "\u201C",
      "&ldquor;": "\u201E",
      "&ldrdhar;": "\u2967",
      "&ldrushar;": "\u294B",
      "&ldsh;": "\u21B2",
      "&le;": "\u2264",
      "&leftarrow;": "\u2190",
      "&leftarrowtail;": "\u21A2",
      "&leftharpoondown;": "\u21BD",
      "&leftharpoonup;": "\u21BC",
      "&leftleftarrows;": "\u21C7",
      "&leftrightarrow;": "\u2194",
      "&leftrightarrows;": "\u21C6",
      "&leftrightharpoons;": "\u21CB",
      "&leftrightsquigarrow;": "\u21AD",
      "&leftthreetimes;": "\u22CB",
      "&leg;": "\u22DA",
      "&leq;": "\u2264",
      "&leqq;": "\u2266",
      "&leqslant;": "\u2A7D",
      "&les;": "\u2A7D",
      "&lescc;": "\u2AA8",
      "&lesdot;": "\u2A7F",
      "&lesdoto;": "\u2A81",
      "&lesdotor;": "\u2A83",
      "&lesg;": "\u22DA\uFE00",
      "&lesges;": "\u2A93",
      "&lessapprox;": "\u2A85",
      "&lessdot;": "\u22D6",
      "&lesseqgtr;": "\u22DA",
      "&lesseqqgtr;": "\u2A8B",
      "&lessgtr;": "\u2276",
      "&lesssim;": "\u2272",
      "&lfisht;": "\u297C",
      "&lfloor;": "\u230A",
      "&lfr;": "\u{1D529}",
      "&lg;": "\u2276",
      "&lgE;": "\u2A91",
      "&lhard;": "\u21BD",
      "&lharu;": "\u21BC",
      "&lharul;": "\u296A",
      "&lhblk;": "\u2584",
      "&ljcy;": "\u0459",
      "&ll;": "\u226A",
      "&llarr;": "\u21C7",
      "&llcorner;": "\u231E",
      "&llhard;": "\u296B",
      "&lltri;": "\u25FA",
      "&lmidot;": "\u0140",
      "&lmoust;": "\u23B0",
      "&lmoustache;": "\u23B0",
      "&lnE;": "\u2268",
      "&lnap;": "\u2A89",
      "&lnapprox;": "\u2A89",
      "&lne;": "\u2A87",
      "&lneq;": "\u2A87",
      "&lneqq;": "\u2268",
      "&lnsim;": "\u22E6",
      "&loang;": "\u27EC",
      "&loarr;": "\u21FD",
      "&lobrk;": "\u27E6",
      "&longleftarrow;": "\u27F5",
      "&longleftrightarrow;": "\u27F7",
      "&longmapsto;": "\u27FC",
      "&longrightarrow;": "\u27F6",
      "&looparrowleft;": "\u21AB",
      "&looparrowright;": "\u21AC",
      "&lopar;": "\u2985",
      "&lopf;": "\u{1D55D}",
      "&loplus;": "\u2A2D",
      "&lotimes;": "\u2A34",
      "&lowast;": "\u2217",
      "&lowbar;": "_",
      "&loz;": "\u25CA",
      "&lozenge;": "\u25CA",
      "&lozf;": "\u29EB",
      "&lpar;": "(",
      "&lparlt;": "\u2993",
      "&lrarr;": "\u21C6",
      "&lrcorner;": "\u231F",
      "&lrhar;": "\u21CB",
      "&lrhard;": "\u296D",
      "&lrm;": "\u200E",
      "&lrtri;": "\u22BF",
      "&lsaquo;": "\u2039",
      "&lscr;": "\u{1D4C1}",
      "&lsh;": "\u21B0",
      "&lsim;": "\u2272",
      "&lsime;": "\u2A8D",
      "&lsimg;": "\u2A8F",
      "&lsqb;": "[",
      "&lsquo;": "\u2018",
      "&lsquor;": "\u201A",
      "&lstrok;": "\u0142",
      "&lt": "<",
      "&lt;": "<",
      "&ltcc;": "\u2AA6",
      "&ltcir;": "\u2A79",
      "&ltdot;": "\u22D6",
      "&lthree;": "\u22CB",
      "&ltimes;": "\u22C9",
      "&ltlarr;": "\u2976",
      "&ltquest;": "\u2A7B",
      "&ltrPar;": "\u2996",
      "&ltri;": "\u25C3",
      "&ltrie;": "\u22B4",
      "&ltrif;": "\u25C2",
      "&lurdshar;": "\u294A",
      "&luruhar;": "\u2966",
      "&lvertneqq;": "\u2268\uFE00",
      "&lvnE;": "\u2268\uFE00",
      "&mDDot;": "\u223A",
      "&macr": "\xAF",
      "&macr;": "\xAF",
      "&male;": "\u2642",
      "&malt;": "\u2720",
      "&maltese;": "\u2720",
      "&map;": "\u21A6",
      "&mapsto;": "\u21A6",
      "&mapstodown;": "\u21A7",
      "&mapstoleft;": "\u21A4",
      "&mapstoup;": "\u21A5",
      "&marker;": "\u25AE",
      "&mcomma;": "\u2A29",
      "&mcy;": "\u043C",
      "&mdash;": "\u2014",
      "&measuredangle;": "\u2221",
      "&mfr;": "\u{1D52A}",
      "&mho;": "\u2127",
      "&micro": "\xB5",
      "&micro;": "\xB5",
      "&mid;": "\u2223",
      "&midast;": "*",
      "&midcir;": "\u2AF0",
      "&middot": "\xB7",
      "&middot;": "\xB7",
      "&minus;": "\u2212",
      "&minusb;": "\u229F",
      "&minusd;": "\u2238",
      "&minusdu;": "\u2A2A",
      "&mlcp;": "\u2ADB",
      "&mldr;": "\u2026",
      "&mnplus;": "\u2213",
      "&models;": "\u22A7",
      "&mopf;": "\u{1D55E}",
      "&mp;": "\u2213",
      "&mscr;": "\u{1D4C2}",
      "&mstpos;": "\u223E",
      "&mu;": "\u03BC",
      "&multimap;": "\u22B8",
      "&mumap;": "\u22B8",
      "&nGg;": "\u22D9\u0338",
      "&nGt;": "\u226B\u20D2",
      "&nGtv;": "\u226B\u0338",
      "&nLeftarrow;": "\u21CD",
      "&nLeftrightarrow;": "\u21CE",
      "&nLl;": "\u22D8\u0338",
      "&nLt;": "\u226A\u20D2",
      "&nLtv;": "\u226A\u0338",
      "&nRightarrow;": "\u21CF",
      "&nVDash;": "\u22AF",
      "&nVdash;": "\u22AE",
      "&nabla;": "\u2207",
      "&nacute;": "\u0144",
      "&nang;": "\u2220\u20D2",
      "&nap;": "\u2249",
      "&napE;": "\u2A70\u0338",
      "&napid;": "\u224B\u0338",
      "&napos;": "\u0149",
      "&napprox;": "\u2249",
      "&natur;": "\u266E",
      "&natural;": "\u266E",
      "&naturals;": "\u2115",
      "&nbsp": "\xA0",
      "&nbsp;": "\xA0",
      "&nbump;": "\u224E\u0338",
      "&nbumpe;": "\u224F\u0338",
      "&ncap;": "\u2A43",
      "&ncaron;": "\u0148",
      "&ncedil;": "\u0146",
      "&ncong;": "\u2247",
      "&ncongdot;": "\u2A6D\u0338",
      "&ncup;": "\u2A42",
      "&ncy;": "\u043D",
      "&ndash;": "\u2013",
      "&ne;": "\u2260",
      "&neArr;": "\u21D7",
      "&nearhk;": "\u2924",
      "&nearr;": "\u2197",
      "&nearrow;": "\u2197",
      "&nedot;": "\u2250\u0338",
      "&nequiv;": "\u2262",
      "&nesear;": "\u2928",
      "&nesim;": "\u2242\u0338",
      "&nexist;": "\u2204",
      "&nexists;": "\u2204",
      "&nfr;": "\u{1D52B}",
      "&ngE;": "\u2267\u0338",
      "&nge;": "\u2271",
      "&ngeq;": "\u2271",
      "&ngeqq;": "\u2267\u0338",
      "&ngeqslant;": "\u2A7E\u0338",
      "&nges;": "\u2A7E\u0338",
      "&ngsim;": "\u2275",
      "&ngt;": "\u226F",
      "&ngtr;": "\u226F",
      "&nhArr;": "\u21CE",
      "&nharr;": "\u21AE",
      "&nhpar;": "\u2AF2",
      "&ni;": "\u220B",
      "&nis;": "\u22FC",
      "&nisd;": "\u22FA",
      "&niv;": "\u220B",
      "&njcy;": "\u045A",
      "&nlArr;": "\u21CD",
      "&nlE;": "\u2266\u0338",
      "&nlarr;": "\u219A",
      "&nldr;": "\u2025",
      "&nle;": "\u2270",
      "&nleftarrow;": "\u219A",
      "&nleftrightarrow;": "\u21AE",
      "&nleq;": "\u2270",
      "&nleqq;": "\u2266\u0338",
      "&nleqslant;": "\u2A7D\u0338",
      "&nles;": "\u2A7D\u0338",
      "&nless;": "\u226E",
      "&nlsim;": "\u2274",
      "&nlt;": "\u226E",
      "&nltri;": "\u22EA",
      "&nltrie;": "\u22EC",
      "&nmid;": "\u2224",
      "&nopf;": "\u{1D55F}",
      "&not": "\xAC",
      "&not;": "\xAC",
      "&notin;": "\u2209",
      "&notinE;": "\u22F9\u0338",
      "&notindot;": "\u22F5\u0338",
      "&notinva;": "\u2209",
      "&notinvb;": "\u22F7",
      "&notinvc;": "\u22F6",
      "&notni;": "\u220C",
      "&notniva;": "\u220C",
      "&notnivb;": "\u22FE",
      "&notnivc;": "\u22FD",
      "&npar;": "\u2226",
      "&nparallel;": "\u2226",
      "&nparsl;": "\u2AFD\u20E5",
      "&npart;": "\u2202\u0338",
      "&npolint;": "\u2A14",
      "&npr;": "\u2280",
      "&nprcue;": "\u22E0",
      "&npre;": "\u2AAF\u0338",
      "&nprec;": "\u2280",
      "&npreceq;": "\u2AAF\u0338",
      "&nrArr;": "\u21CF",
      "&nrarr;": "\u219B",
      "&nrarrc;": "\u2933\u0338",
      "&nrarrw;": "\u219D\u0338",
      "&nrightarrow;": "\u219B",
      "&nrtri;": "\u22EB",
      "&nrtrie;": "\u22ED",
      "&nsc;": "\u2281",
      "&nsccue;": "\u22E1",
      "&nsce;": "\u2AB0\u0338",
      "&nscr;": "\u{1D4C3}",
      "&nshortmid;": "\u2224",
      "&nshortparallel;": "\u2226",
      "&nsim;": "\u2241",
      "&nsime;": "\u2244",
      "&nsimeq;": "\u2244",
      "&nsmid;": "\u2224",
      "&nspar;": "\u2226",
      "&nsqsube;": "\u22E2",
      "&nsqsupe;": "\u22E3",
      "&nsub;": "\u2284",
      "&nsubE;": "\u2AC5\u0338",
      "&nsube;": "\u2288",
      "&nsubset;": "\u2282\u20D2",
      "&nsubseteq;": "\u2288",
      "&nsubseteqq;": "\u2AC5\u0338",
      "&nsucc;": "\u2281",
      "&nsucceq;": "\u2AB0\u0338",
      "&nsup;": "\u2285",
      "&nsupE;": "\u2AC6\u0338",
      "&nsupe;": "\u2289",
      "&nsupset;": "\u2283\u20D2",
      "&nsupseteq;": "\u2289",
      "&nsupseteqq;": "\u2AC6\u0338",
      "&ntgl;": "\u2279",
      "&ntilde": "\xF1",
      "&ntilde;": "\xF1",
      "&ntlg;": "\u2278",
      "&ntriangleleft;": "\u22EA",
      "&ntrianglelefteq;": "\u22EC",
      "&ntriangleright;": "\u22EB",
      "&ntrianglerighteq;": "\u22ED",
      "&nu;": "\u03BD",
      "&num;": "#",
      "&numero;": "\u2116",
      "&numsp;": "\u2007",
      "&nvDash;": "\u22AD",
      "&nvHarr;": "\u2904",
      "&nvap;": "\u224D\u20D2",
      "&nvdash;": "\u22AC",
      "&nvge;": "\u2265\u20D2",
      "&nvgt;": ">\u20D2",
      "&nvinfin;": "\u29DE",
      "&nvlArr;": "\u2902",
      "&nvle;": "\u2264\u20D2",
      "&nvlt;": "<\u20D2",
      "&nvltrie;": "\u22B4\u20D2",
      "&nvrArr;": "\u2903",
      "&nvrtrie;": "\u22B5\u20D2",
      "&nvsim;": "\u223C\u20D2",
      "&nwArr;": "\u21D6",
      "&nwarhk;": "\u2923",
      "&nwarr;": "\u2196",
      "&nwarrow;": "\u2196",
      "&nwnear;": "\u2927",
      "&oS;": "\u24C8",
      "&oacute": "\xF3",
      "&oacute;": "\xF3",
      "&oast;": "\u229B",
      "&ocir;": "\u229A",
      "&ocirc": "\xF4",
      "&ocirc;": "\xF4",
      "&ocy;": "\u043E",
      "&odash;": "\u229D",
      "&odblac;": "\u0151",
      "&odiv;": "\u2A38",
      "&odot;": "\u2299",
      "&odsold;": "\u29BC",
      "&oelig;": "\u0153",
      "&ofcir;": "\u29BF",
      "&ofr;": "\u{1D52C}",
      "&ogon;": "\u02DB",
      "&ograve": "\xF2",
      "&ograve;": "\xF2",
      "&ogt;": "\u29C1",
      "&ohbar;": "\u29B5",
      "&ohm;": "\u03A9",
      "&oint;": "\u222E",
      "&olarr;": "\u21BA",
      "&olcir;": "\u29BE",
      "&olcross;": "\u29BB",
      "&oline;": "\u203E",
      "&olt;": "\u29C0",
      "&omacr;": "\u014D",
      "&omega;": "\u03C9",
      "&omicron;": "\u03BF",
      "&omid;": "\u29B6",
      "&ominus;": "\u2296",
      "&oopf;": "\u{1D560}",
      "&opar;": "\u29B7",
      "&operp;": "\u29B9",
      "&oplus;": "\u2295",
      "&or;": "\u2228",
      "&orarr;": "\u21BB",
      "&ord;": "\u2A5D",
      "&order;": "\u2134",
      "&orderof;": "\u2134",
      "&ordf": "\xAA",
      "&ordf;": "\xAA",
      "&ordm": "\xBA",
      "&ordm;": "\xBA",
      "&origof;": "\u22B6",
      "&oror;": "\u2A56",
      "&orslope;": "\u2A57",
      "&orv;": "\u2A5B",
      "&oscr;": "\u2134",
      "&oslash": "\xF8",
      "&oslash;": "\xF8",
      "&osol;": "\u2298",
      "&otilde": "\xF5",
      "&otilde;": "\xF5",
      "&otimes;": "\u2297",
      "&otimesas;": "\u2A36",
      "&ouml": "\xF6",
      "&ouml;": "\xF6",
      "&ovbar;": "\u233D",
      "&par;": "\u2225",
      "&para": "\xB6",
      "&para;": "\xB6",
      "&parallel;": "\u2225",
      "&parsim;": "\u2AF3",
      "&parsl;": "\u2AFD",
      "&part;": "\u2202",
      "&pcy;": "\u043F",
      "&percnt;": "%",
      "&period;": ".",
      "&permil;": "\u2030",
      "&perp;": "\u22A5",
      "&pertenk;": "\u2031",
      "&pfr;": "\u{1D52D}",
      "&phi;": "\u03C6",
      "&phiv;": "\u03D5",
      "&phmmat;": "\u2133",
      "&phone;": "\u260E",
      "&pi;": "\u03C0",
      "&pitchfork;": "\u22D4",
      "&piv;": "\u03D6",
      "&planck;": "\u210F",
      "&planckh;": "\u210E",
      "&plankv;": "\u210F",
      "&plus;": "+",
      "&plusacir;": "\u2A23",
      "&plusb;": "\u229E",
      "&pluscir;": "\u2A22",
      "&plusdo;": "\u2214",
      "&plusdu;": "\u2A25",
      "&pluse;": "\u2A72",
      "&plusmn": "\xB1",
      "&plusmn;": "\xB1",
      "&plussim;": "\u2A26",
      "&plustwo;": "\u2A27",
      "&pm;": "\xB1",
      "&pointint;": "\u2A15",
      "&popf;": "\u{1D561}",
      "&pound": "\xA3",
      "&pound;": "\xA3",
      "&pr;": "\u227A",
      "&prE;": "\u2AB3",
      "&prap;": "\u2AB7",
      "&prcue;": "\u227C",
      "&pre;": "\u2AAF",
      "&prec;": "\u227A",
      "&precapprox;": "\u2AB7",
      "&preccurlyeq;": "\u227C",
      "&preceq;": "\u2AAF",
      "&precnapprox;": "\u2AB9",
      "&precneqq;": "\u2AB5",
      "&precnsim;": "\u22E8",
      "&precsim;": "\u227E",
      "&prime;": "\u2032",
      "&primes;": "\u2119",
      "&prnE;": "\u2AB5",
      "&prnap;": "\u2AB9",
      "&prnsim;": "\u22E8",
      "&prod;": "\u220F",
      "&profalar;": "\u232E",
      "&profline;": "\u2312",
      "&profsurf;": "\u2313",
      "&prop;": "\u221D",
      "&propto;": "\u221D",
      "&prsim;": "\u227E",
      "&prurel;": "\u22B0",
      "&pscr;": "\u{1D4C5}",
      "&psi;": "\u03C8",
      "&puncsp;": "\u2008",
      "&qfr;": "\u{1D52E}",
      "&qint;": "\u2A0C",
      "&qopf;": "\u{1D562}",
      "&qprime;": "\u2057",
      "&qscr;": "\u{1D4C6}",
      "&quaternions;": "\u210D",
      "&quatint;": "\u2A16",
      "&quest;": "?",
      "&questeq;": "\u225F",
      "&quot": '"',
      "&quot;": '"',
      "&rAarr;": "\u21DB",
      "&rArr;": "\u21D2",
      "&rAtail;": "\u291C",
      "&rBarr;": "\u290F",
      "&rHar;": "\u2964",
      "&race;": "\u223D\u0331",
      "&racute;": "\u0155",
      "&radic;": "\u221A",
      "&raemptyv;": "\u29B3",
      "&rang;": "\u27E9",
      "&rangd;": "\u2992",
      "&range;": "\u29A5",
      "&rangle;": "\u27E9",
      "&raquo": "\xBB",
      "&raquo;": "\xBB",
      "&rarr;": "\u2192",
      "&rarrap;": "\u2975",
      "&rarrb;": "\u21E5",
      "&rarrbfs;": "\u2920",
      "&rarrc;": "\u2933",
      "&rarrfs;": "\u291E",
      "&rarrhk;": "\u21AA",
      "&rarrlp;": "\u21AC",
      "&rarrpl;": "\u2945",
      "&rarrsim;": "\u2974",
      "&rarrtl;": "\u21A3",
      "&rarrw;": "\u219D",
      "&ratail;": "\u291A",
      "&ratio;": "\u2236",
      "&rationals;": "\u211A",
      "&rbarr;": "\u290D",
      "&rbbrk;": "\u2773",
      "&rbrace;": "}",
      "&rbrack;": "]",
      "&rbrke;": "\u298C",
      "&rbrksld;": "\u298E",
      "&rbrkslu;": "\u2990",
      "&rcaron;": "\u0159",
      "&rcedil;": "\u0157",
      "&rceil;": "\u2309",
      "&rcub;": "}",
      "&rcy;": "\u0440",
      "&rdca;": "\u2937",
      "&rdldhar;": "\u2969",
      "&rdquo;": "\u201D",
      "&rdquor;": "\u201D",
      "&rdsh;": "\u21B3",
      "&real;": "\u211C",
      "&realine;": "\u211B",
      "&realpart;": "\u211C",
      "&reals;": "\u211D",
      "&rect;": "\u25AD",
      "&reg": "\xAE",
      "&reg;": "\xAE",
      "&rfisht;": "\u297D",
      "&rfloor;": "\u230B",
      "&rfr;": "\u{1D52F}",
      "&rhard;": "\u21C1",
      "&rharu;": "\u21C0",
      "&rharul;": "\u296C",
      "&rho;": "\u03C1",
      "&rhov;": "\u03F1",
      "&rightarrow;": "\u2192",
      "&rightarrowtail;": "\u21A3",
      "&rightharpoondown;": "\u21C1",
      "&rightharpoonup;": "\u21C0",
      "&rightleftarrows;": "\u21C4",
      "&rightleftharpoons;": "\u21CC",
      "&rightrightarrows;": "\u21C9",
      "&rightsquigarrow;": "\u219D",
      "&rightthreetimes;": "\u22CC",
      "&ring;": "\u02DA",
      "&risingdotseq;": "\u2253",
      "&rlarr;": "\u21C4",
      "&rlhar;": "\u21CC",
      "&rlm;": "\u200F",
      "&rmoust;": "\u23B1",
      "&rmoustache;": "\u23B1",
      "&rnmid;": "\u2AEE",
      "&roang;": "\u27ED",
      "&roarr;": "\u21FE",
      "&robrk;": "\u27E7",
      "&ropar;": "\u2986",
      "&ropf;": "\u{1D563}",
      "&roplus;": "\u2A2E",
      "&rotimes;": "\u2A35",
      "&rpar;": ")",
      "&rpargt;": "\u2994",
      "&rppolint;": "\u2A12",
      "&rrarr;": "\u21C9",
      "&rsaquo;": "\u203A",
      "&rscr;": "\u{1D4C7}",
      "&rsh;": "\u21B1",
      "&rsqb;": "]",
      "&rsquo;": "\u2019",
      "&rsquor;": "\u2019",
      "&rthree;": "\u22CC",
      "&rtimes;": "\u22CA",
      "&rtri;": "\u25B9",
      "&rtrie;": "\u22B5",
      "&rtrif;": "\u25B8",
      "&rtriltri;": "\u29CE",
      "&ruluhar;": "\u2968",
      "&rx;": "\u211E",
      "&sacute;": "\u015B",
      "&sbquo;": "\u201A",
      "&sc;": "\u227B",
      "&scE;": "\u2AB4",
      "&scap;": "\u2AB8",
      "&scaron;": "\u0161",
      "&sccue;": "\u227D",
      "&sce;": "\u2AB0",
      "&scedil;": "\u015F",
      "&scirc;": "\u015D",
      "&scnE;": "\u2AB6",
      "&scnap;": "\u2ABA",
      "&scnsim;": "\u22E9",
      "&scpolint;": "\u2A13",
      "&scsim;": "\u227F",
      "&scy;": "\u0441",
      "&sdot;": "\u22C5",
      "&sdotb;": "\u22A1",
      "&sdote;": "\u2A66",
      "&seArr;": "\u21D8",
      "&searhk;": "\u2925",
      "&searr;": "\u2198",
      "&searrow;": "\u2198",
      "&sect": "\xA7",
      "&sect;": "\xA7",
      "&semi;": ";",
      "&seswar;": "\u2929",
      "&setminus;": "\u2216",
      "&setmn;": "\u2216",
      "&sext;": "\u2736",
      "&sfr;": "\u{1D530}",
      "&sfrown;": "\u2322",
      "&sharp;": "\u266F",
      "&shchcy;": "\u0449",
      "&shcy;": "\u0448",
      "&shortmid;": "\u2223",
      "&shortparallel;": "\u2225",
      "&shy": "\xAD",
      "&shy;": "\xAD",
      "&sigma;": "\u03C3",
      "&sigmaf;": "\u03C2",
      "&sigmav;": "\u03C2",
      "&sim;": "\u223C",
      "&simdot;": "\u2A6A",
      "&sime;": "\u2243",
      "&simeq;": "\u2243",
      "&simg;": "\u2A9E",
      "&simgE;": "\u2AA0",
      "&siml;": "\u2A9D",
      "&simlE;": "\u2A9F",
      "&simne;": "\u2246",
      "&simplus;": "\u2A24",
      "&simrarr;": "\u2972",
      "&slarr;": "\u2190",
      "&smallsetminus;": "\u2216",
      "&smashp;": "\u2A33",
      "&smeparsl;": "\u29E4",
      "&smid;": "\u2223",
      "&smile;": "\u2323",
      "&smt;": "\u2AAA",
      "&smte;": "\u2AAC",
      "&smtes;": "\u2AAC\uFE00",
      "&softcy;": "\u044C",
      "&sol;": "/",
      "&solb;": "\u29C4",
      "&solbar;": "\u233F",
      "&sopf;": "\u{1D564}",
      "&spades;": "\u2660",
      "&spadesuit;": "\u2660",
      "&spar;": "\u2225",
      "&sqcap;": "\u2293",
      "&sqcaps;": "\u2293\uFE00",
      "&sqcup;": "\u2294",
      "&sqcups;": "\u2294\uFE00",
      "&sqsub;": "\u228F",
      "&sqsube;": "\u2291",
      "&sqsubset;": "\u228F",
      "&sqsubseteq;": "\u2291",
      "&sqsup;": "\u2290",
      "&sqsupe;": "\u2292",
      "&sqsupset;": "\u2290",
      "&sqsupseteq;": "\u2292",
      "&squ;": "\u25A1",
      "&square;": "\u25A1",
      "&squarf;": "\u25AA",
      "&squf;": "\u25AA",
      "&srarr;": "\u2192",
      "&sscr;": "\u{1D4C8}",
      "&ssetmn;": "\u2216",
      "&ssmile;": "\u2323",
      "&sstarf;": "\u22C6",
      "&star;": "\u2606",
      "&starf;": "\u2605",
      "&straightepsilon;": "\u03F5",
      "&straightphi;": "\u03D5",
      "&strns;": "\xAF",
      "&sub;": "\u2282",
      "&subE;": "\u2AC5",
      "&subdot;": "\u2ABD",
      "&sube;": "\u2286",
      "&subedot;": "\u2AC3",
      "&submult;": "\u2AC1",
      "&subnE;": "\u2ACB",
      "&subne;": "\u228A",
      "&subplus;": "\u2ABF",
      "&subrarr;": "\u2979",
      "&subset;": "\u2282",
      "&subseteq;": "\u2286",
      "&subseteqq;": "\u2AC5",
      "&subsetneq;": "\u228A",
      "&subsetneqq;": "\u2ACB",
      "&subsim;": "\u2AC7",
      "&subsub;": "\u2AD5",
      "&subsup;": "\u2AD3",
      "&succ;": "\u227B",
      "&succapprox;": "\u2AB8",
      "&succcurlyeq;": "\u227D",
      "&succeq;": "\u2AB0",
      "&succnapprox;": "\u2ABA",
      "&succneqq;": "\u2AB6",
      "&succnsim;": "\u22E9",
      "&succsim;": "\u227F",
      "&sum;": "\u2211",
      "&sung;": "\u266A",
      "&sup1": "\xB9",
      "&sup1;": "\xB9",
      "&sup2": "\xB2",
      "&sup2;": "\xB2",
      "&sup3": "\xB3",
      "&sup3;": "\xB3",
      "&sup;": "\u2283",
      "&supE;": "\u2AC6",
      "&supdot;": "\u2ABE",
      "&supdsub;": "\u2AD8",
      "&supe;": "\u2287",
      "&supedot;": "\u2AC4",
      "&suphsol;": "\u27C9",
      "&suphsub;": "\u2AD7",
      "&suplarr;": "\u297B",
      "&supmult;": "\u2AC2",
      "&supnE;": "\u2ACC",
      "&supne;": "\u228B",
      "&supplus;": "\u2AC0",
      "&supset;": "\u2283",
      "&supseteq;": "\u2287",
      "&supseteqq;": "\u2AC6",
      "&supsetneq;": "\u228B",
      "&supsetneqq;": "\u2ACC",
      "&supsim;": "\u2AC8",
      "&supsub;": "\u2AD4",
      "&supsup;": "\u2AD6",
      "&swArr;": "\u21D9",
      "&swarhk;": "\u2926",
      "&swarr;": "\u2199",
      "&swarrow;": "\u2199",
      "&swnwar;": "\u292A",
      "&szlig": "\xDF",
      "&szlig;": "\xDF",
      "&target;": "\u2316",
      "&tau;": "\u03C4",
      "&tbrk;": "\u23B4",
      "&tcaron;": "\u0165",
      "&tcedil;": "\u0163",
      "&tcy;": "\u0442",
      "&tdot;": "\u20DB",
      "&telrec;": "\u2315",
      "&tfr;": "\u{1D531}",
      "&there4;": "\u2234",
      "&therefore;": "\u2234",
      "&theta;": "\u03B8",
      "&thetasym;": "\u03D1",
      "&thetav;": "\u03D1",
      "&thickapprox;": "\u2248",
      "&thicksim;": "\u223C",
      "&thinsp;": "\u2009",
      "&thkap;": "\u2248",
      "&thksim;": "\u223C",
      "&thorn": "\xFE",
      "&thorn;": "\xFE",
      "&tilde;": "\u02DC",
      "&times": "\xD7",
      "&times;": "\xD7",
      "&timesb;": "\u22A0",
      "&timesbar;": "\u2A31",
      "&timesd;": "\u2A30",
      "&tint;": "\u222D",
      "&toea;": "\u2928",
      "&top;": "\u22A4",
      "&topbot;": "\u2336",
      "&topcir;": "\u2AF1",
      "&topf;": "\u{1D565}",
      "&topfork;": "\u2ADA",
      "&tosa;": "\u2929",
      "&tprime;": "\u2034",
      "&trade;": "\u2122",
      "&triangle;": "\u25B5",
      "&triangledown;": "\u25BF",
      "&triangleleft;": "\u25C3",
      "&trianglelefteq;": "\u22B4",
      "&triangleq;": "\u225C",
      "&triangleright;": "\u25B9",
      "&trianglerighteq;": "\u22B5",
      "&tridot;": "\u25EC",
      "&trie;": "\u225C",
      "&triminus;": "\u2A3A",
      "&triplus;": "\u2A39",
      "&trisb;": "\u29CD",
      "&tritime;": "\u2A3B",
      "&trpezium;": "\u23E2",
      "&tscr;": "\u{1D4C9}",
      "&tscy;": "\u0446",
      "&tshcy;": "\u045B",
      "&tstrok;": "\u0167",
      "&twixt;": "\u226C",
      "&twoheadleftarrow;": "\u219E",
      "&twoheadrightarrow;": "\u21A0",
      "&uArr;": "\u21D1",
      "&uHar;": "\u2963",
      "&uacute": "\xFA",
      "&uacute;": "\xFA",
      "&uarr;": "\u2191",
      "&ubrcy;": "\u045E",
      "&ubreve;": "\u016D",
      "&ucirc": "\xFB",
      "&ucirc;": "\xFB",
      "&ucy;": "\u0443",
      "&udarr;": "\u21C5",
      "&udblac;": "\u0171",
      "&udhar;": "\u296E",
      "&ufisht;": "\u297E",
      "&ufr;": "\u{1D532}",
      "&ugrave": "\xF9",
      "&ugrave;": "\xF9",
      "&uharl;": "\u21BF",
      "&uharr;": "\u21BE",
      "&uhblk;": "\u2580",
      "&ulcorn;": "\u231C",
      "&ulcorner;": "\u231C",
      "&ulcrop;": "\u230F",
      "&ultri;": "\u25F8",
      "&umacr;": "\u016B",
      "&uml": "\xA8",
      "&uml;": "\xA8",
      "&uogon;": "\u0173",
      "&uopf;": "\u{1D566}",
      "&uparrow;": "\u2191",
      "&updownarrow;": "\u2195",
      "&upharpoonleft;": "\u21BF",
      "&upharpoonright;": "\u21BE",
      "&uplus;": "\u228E",
      "&upsi;": "\u03C5",
      "&upsih;": "\u03D2",
      "&upsilon;": "\u03C5",
      "&upuparrows;": "\u21C8",
      "&urcorn;": "\u231D",
      "&urcorner;": "\u231D",
      "&urcrop;": "\u230E",
      "&uring;": "\u016F",
      "&urtri;": "\u25F9",
      "&uscr;": "\u{1D4CA}",
      "&utdot;": "\u22F0",
      "&utilde;": "\u0169",
      "&utri;": "\u25B5",
      "&utrif;": "\u25B4",
      "&uuarr;": "\u21C8",
      "&uuml": "\xFC",
      "&uuml;": "\xFC",
      "&uwangle;": "\u29A7",
      "&vArr;": "\u21D5",
      "&vBar;": "\u2AE8",
      "&vBarv;": "\u2AE9",
      "&vDash;": "\u22A8",
      "&vangrt;": "\u299C",
      "&varepsilon;": "\u03F5",
      "&varkappa;": "\u03F0",
      "&varnothing;": "\u2205",
      "&varphi;": "\u03D5",
      "&varpi;": "\u03D6",
      "&varpropto;": "\u221D",
      "&varr;": "\u2195",
      "&varrho;": "\u03F1",
      "&varsigma;": "\u03C2",
      "&varsubsetneq;": "\u228A\uFE00",
      "&varsubsetneqq;": "\u2ACB\uFE00",
      "&varsupsetneq;": "\u228B\uFE00",
      "&varsupsetneqq;": "\u2ACC\uFE00",
      "&vartheta;": "\u03D1",
      "&vartriangleleft;": "\u22B2",
      "&vartriangleright;": "\u22B3",
      "&vcy;": "\u0432",
      "&vdash;": "\u22A2",
      "&vee;": "\u2228",
      "&veebar;": "\u22BB",
      "&veeeq;": "\u225A",
      "&vellip;": "\u22EE",
      "&verbar;": "|",
      "&vert;": "|",
      "&vfr;": "\u{1D533}",
      "&vltri;": "\u22B2",
      "&vnsub;": "\u2282\u20D2",
      "&vnsup;": "\u2283\u20D2",
      "&vopf;": "\u{1D567}",
      "&vprop;": "\u221D",
      "&vrtri;": "\u22B3",
      "&vscr;": "\u{1D4CB}",
      "&vsubnE;": "\u2ACB\uFE00",
      "&vsubne;": "\u228A\uFE00",
      "&vsupnE;": "\u2ACC\uFE00",
      "&vsupne;": "\u228B\uFE00",
      "&vzigzag;": "\u299A",
      "&wcirc;": "\u0175",
      "&wedbar;": "\u2A5F",
      "&wedge;": "\u2227",
      "&wedgeq;": "\u2259",
      "&weierp;": "\u2118",
      "&wfr;": "\u{1D534}",
      "&wopf;": "\u{1D568}",
      "&wp;": "\u2118",
      "&wr;": "\u2240",
      "&wreath;": "\u2240",
      "&wscr;": "\u{1D4CC}",
      "&xcap;": "\u22C2",
      "&xcirc;": "\u25EF",
      "&xcup;": "\u22C3",
      "&xdtri;": "\u25BD",
      "&xfr;": "\u{1D535}",
      "&xhArr;": "\u27FA",
      "&xharr;": "\u27F7",
      "&xi;": "\u03BE",
      "&xlArr;": "\u27F8",
      "&xlarr;": "\u27F5",
      "&xmap;": "\u27FC",
      "&xnis;": "\u22FB",
      "&xodot;": "\u2A00",
      "&xopf;": "\u{1D569}",
      "&xoplus;": "\u2A01",
      "&xotime;": "\u2A02",
      "&xrArr;": "\u27F9",
      "&xrarr;": "\u27F6",
      "&xscr;": "\u{1D4CD}",
      "&xsqcup;": "\u2A06",
      "&xuplus;": "\u2A04",
      "&xutri;": "\u25B3",
      "&xvee;": "\u22C1",
      "&xwedge;": "\u22C0",
      "&yacute": "\xFD",
      "&yacute;": "\xFD",
      "&yacy;": "\u044F",
      "&ycirc;": "\u0177",
      "&ycy;": "\u044B",
      "&yen": "\xA5",
      "&yen;": "\xA5",
      "&yfr;": "\u{1D536}",
      "&yicy;": "\u0457",
      "&yopf;": "\u{1D56A}",
      "&yscr;": "\u{1D4CE}",
      "&yucy;": "\u044E",
      "&yuml": "\xFF",
      "&yuml;": "\xFF",
      "&zacute;": "\u017A",
      "&zcaron;": "\u017E",
      "&zcy;": "\u0437",
      "&zdot;": "\u017C",
      "&zeetrf;": "\u2128",
      "&zeta;": "\u03B6",
      "&zfr;": "\u{1D537}",
      "&zhcy;": "\u0436",
      "&zigrarr;": "\u21DD",
      "&zopf;": "\u{1D56B}",
      "&zscr;": "\u{1D4CF}",
      "&zwj;": "\u200D",
      "&zwnj;": "\u200C"
    };
    html_entities_default = htmlEntities;
  }
});

// ../../node_modules/postal-mime/src/text-format.js
function decodeHTMLEntities(str) {
  return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match, entity) => {
    if (typeof html_entities_default[match] === "string") {
      return html_entities_default[match];
    }
    if (entity.charAt(0) !== "#" || match.charAt(match.length - 1) !== ";") {
      return match;
    }
    let codePoint;
    if (entity.charAt(1) === "x") {
      codePoint = parseInt(entity.substr(2), 16);
    } else {
      codePoint = parseInt(entity.substr(1), 10);
    }
    var output = "";
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "\uFFFD";
    }
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  });
}
function escapeHtml(str) {
  return str.trim().replace(/[<>"'?&]/g, (c) => {
    let hex = c.charCodeAt(0).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return "&#x" + hex.toUpperCase() + ";";
  });
}
function textToHtml(str) {
  let html = escapeHtml(str).replace(/\n/g, "<br />");
  return "<div>" + html + "</div>";
}
function htmlToText(str) {
  str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
  str = decodeHTMLEntities(str);
  return str;
}
function formatTextAddress(address) {
  return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
function formatTextAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push(", ");
    }
    if (address.group) {
      let groupStart = `${address.name}:`;
      let groupEnd = `;`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatTextAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join("");
}
function formatHtmlAddress(address) {
  return `<a href="mailto:${escapeHtml(address.address)}" class="postal-email-address">${escapeHtml(address.name || `<${address.address}>`)}</a>`;
}
function formatHtmlAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push('<span class="postal-email-address-separator">, </span>');
    }
    if (address.group) {
      let groupStart = `<span class="postal-email-address-group">${escapeHtml(address.name)}:</span>`;
      let groupEnd = `<span class="postal-email-address-group">;</span>`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatHtmlAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join(" ");
}
function foldLines(str, lineLength, afterSpace) {
  str = (str || "").toString();
  lineLength = lineLength || 76;
  let pos = 0, len = str.length, result = "", line, match;
  while (pos < len) {
    line = str.substr(pos, lineLength);
    if (line.length < lineLength) {
      result += line;
      break;
    }
    if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) {
      line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
    } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
    }
    result += line;
    pos += line.length;
    if (pos < len) {
      result += "\r\n";
    }
  }
  return result;
}
function formatTextHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push({ key: "From", val: formatTextAddress(message.from) });
  }
  if (message.subject) {
    rows.push({ key: "Subject", val: message.subject });
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push({ key: "Date", val: dateStr });
  }
  if (message.to && message.to.length) {
    rows.push({ key: "To", val: formatTextAddresses(message.to) });
  }
  if (message.cc && message.cc.length) {
    rows.push({ key: "Cc", val: formatTextAddresses(message.cc) });
  }
  if (message.bcc && message.bcc.length) {
    rows.push({ key: "Bcc", val: formatTextAddresses(message.bcc) });
  }
  let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  rows = rows.flatMap((row) => {
    let sepLen = maxKeyLength - row.key.length;
    let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
    let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
    let foldedLines = foldLines(row.val, 80, true).split(/\r?\n/).map((line) => line.trim());
    return foldedLines.map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
  });
  let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  let lineMarker = "-".repeat(maxLineLength);
  let template = `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
  return template;
}
function formatHtmlHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push(
      `<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message.from)}</div>`
    );
  }
  if (message.subject) {
    rows.push(
      `<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml(
        message.subject
      )}</div>`
    );
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push(
      `<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml(
        message.date
      )}">${escapeHtml(dateStr)}</div>`
    );
  }
  if (message.to && message.to.length) {
    rows.push(
      `<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message.to)}</div>`
    );
  }
  if (message.cc && message.cc.length) {
    rows.push(
      `<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.cc)}</div>`
    );
  }
  if (message.bcc && message.bcc.length) {
    rows.push(
      `<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.bcc)}</div>`
    );
  }
  let template = `<div class="postal-email-header">${rows.length ? '<div class="postal-email-header-row">' : ""}${rows.join(
    '</div>\n<div class="postal-email-header-row">'
  )}${rows.length ? "</div>" : ""}</div>`;
  return template;
}
var init_text_format = __esm({
  "../../node_modules/postal-mime/src/text-format.js"() {
    init_html_entities();
  }
});

// ../../node_modules/postal-mime/src/address-parser.js
function _handleAddress(tokens, depth) {
  let isGroup = false;
  let state = "text";
  let address;
  let addresses = [];
  let data = {
    address: [],
    comment: [],
    group: [],
    text: [],
    textWasQuoted: []
    // Track which text tokens came from inside quotes
  };
  let i;
  let len;
  let insideQuotes = false;
  for (i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];
    let prevToken = i ? tokens[i - 1] : null;
    if (token.type === "operator") {
      switch (token.value) {
        case "<":
          state = "address";
          insideQuotes = false;
          break;
        case "(":
          state = "comment";
          insideQuotes = false;
          break;
        case ":":
          state = "group";
          isGroup = true;
          insideQuotes = false;
          break;
        case '"':
          insideQuotes = !insideQuotes;
          state = "text";
          break;
        default:
          state = "text";
          insideQuotes = false;
          break;
      }
    } else if (token.value) {
      if (state === "address") {
        token.value = token.value.replace(/^[^<]*<\s*/, "");
      }
      if (prevToken && prevToken.noBreak && data[state].length) {
        data[state][data[state].length - 1] += token.value;
        if (state === "text" && insideQuotes) {
          data.textWasQuoted[data.textWasQuoted.length - 1] = true;
        }
      } else {
        data[state].push(token.value);
        if (state === "text") {
          data.textWasQuoted.push(insideQuotes);
        }
      }
    }
  }
  if (!data.text.length && data.comment.length) {
    data.text = data.comment;
    data.comment = [];
  }
  if (isGroup) {
    data.text = data.text.join(" ");
    let groupMembers = [];
    if (data.group.length) {
      let parsedGroup = addressParser(data.group.join(","), { _depth: depth + 1 });
      parsedGroup.forEach((member) => {
        if (member.group) {
          groupMembers = groupMembers.concat(member.group);
        } else {
          groupMembers.push(member);
        }
      });
    }
    addresses.push({
      name: decodeWords(data.text || address && address.name),
      group: groupMembers
    });
  } else {
    if (!data.address.length && data.text.length) {
      for (i = data.text.length - 1; i >= 0; i--) {
        if (!data.textWasQuoted[i] && data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
          data.address = data.text.splice(i, 1);
          data.textWasQuoted.splice(i, 1);
          break;
        }
      }
      let _regexHandler = function(address2) {
        if (!data.address.length) {
          data.address = [address2.trim()];
          return " ";
        } else {
          return address2;
        }
      };
      if (!data.address.length) {
        for (i = data.text.length - 1; i >= 0; i--) {
          if (!data.textWasQuoted[i]) {
            data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
            if (data.address.length) {
              break;
            }
          }
        }
      }
    }
    if (!data.text.length && data.comment.length) {
      data.text = data.comment;
      data.comment = [];
    }
    if (data.address.length > 1) {
      data.text = data.text.concat(data.address.splice(1));
    }
    data.text = data.text.join(" ");
    data.address = data.address.join(" ");
    if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
      const parsedSubAddresses = addressParser(decodeWords(data.text));
      if (parsedSubAddresses && parsedSubAddresses.length) {
        return parsedSubAddresses;
      }
    }
    if (!data.address && isGroup) {
      return [];
    } else {
      address = {
        address: data.address || data.text || "",
        name: decodeWords(data.text || data.address || "")
      };
      if (address.address === address.name) {
        if ((address.address || "").match(/@/)) {
          address.name = "";
        } else {
          address.address = "";
        }
      }
      addresses.push(address);
    }
  }
  return addresses;
}
function addressParser(str, options) {
  options = options || {};
  let depth = options._depth || 0;
  if (depth > MAX_NESTED_GROUP_DEPTH) {
    return [];
  }
  let tokenizer = new Tokenizer(str);
  let tokens = tokenizer.tokenize();
  let addresses = [];
  let address = [];
  let parsedAddresses = [];
  tokens.forEach((token) => {
    if (token.type === "operator" && (token.value === "," || token.value === ";")) {
      if (address.length) {
        addresses.push(address);
      }
      address = [];
    } else {
      address.push(token);
    }
  });
  if (address.length) {
    addresses.push(address);
  }
  addresses.forEach((address2) => {
    address2 = _handleAddress(address2, depth);
    if (address2.length) {
      parsedAddresses = parsedAddresses.concat(address2);
    }
  });
  if (options.flatten) {
    let addresses2 = [];
    let walkAddressList = (list) => {
      list.forEach((address2) => {
        if (address2.group) {
          return walkAddressList(address2.group);
        } else {
          addresses2.push(address2);
        }
      });
    };
    walkAddressList(parsedAddresses);
    return addresses2;
  }
  return parsedAddresses;
}
var Tokenizer, MAX_NESTED_GROUP_DEPTH, address_parser_default;
var init_address_parser = __esm({
  "../../node_modules/postal-mime/src/address-parser.js"() {
    init_decode_strings();
    Tokenizer = class {
      constructor(str) {
        this.str = (str || "").toString();
        this.operatorCurrent = "";
        this.operatorExpecting = "";
        this.node = null;
        this.escaped = false;
        this.list = [];
        this.operators = {
          '"': '"',
          "(": ")",
          "<": ">",
          ",": "",
          ":": ";",
          // Semicolons are not a legal delimiter per the RFC2822 grammar other
          // than for terminating a group, but they are also not valid for any
          // other use in this context.  Given that some mail clients have
          // historically allowed the semicolon as a delimiter equivalent to the
          // comma in their UI, it makes sense to treat them the same as a comma
          // when used outside of a group.
          ";": ""
        };
      }
      /**
       * Tokenizes the original input string
       *
       * @return {Array} An array of operator|text tokens
       */
      tokenize() {
        let list = [];
        for (let i = 0, len = this.str.length; i < len; i++) {
          let chr = this.str.charAt(i);
          let nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
          this.checkChar(chr, nextChr);
        }
        this.list.forEach((node) => {
          node.value = (node.value || "").toString().trim();
          if (node.value) {
            list.push(node);
          }
        });
        return list;
      }
      /**
       * Checks if a character is an operator or text and acts accordingly
       *
       * @param {String} chr Character from the address field
       */
      checkChar(chr, nextChr) {
        if (this.escaped) {
        } else if (chr === this.operatorExpecting) {
          this.node = {
            type: "operator",
            value: chr
          };
          if (nextChr && ![" ", "	", "\r", "\n", ",", ";"].includes(nextChr)) {
            this.node.noBreak = true;
          }
          this.list.push(this.node);
          this.node = null;
          this.operatorExpecting = "";
          this.escaped = false;
          return;
        } else if (!this.operatorExpecting && chr in this.operators) {
          this.node = {
            type: "operator",
            value: chr
          };
          this.list.push(this.node);
          this.node = null;
          this.operatorExpecting = this.operators[chr];
          this.escaped = false;
          return;
        } else if (['"', "'"].includes(this.operatorExpecting) && chr === "\\") {
          this.escaped = true;
          return;
        }
        if (!this.node) {
          this.node = {
            type: "text",
            value: ""
          };
          this.list.push(this.node);
        }
        if (chr === "\n") {
          chr = " ";
        }
        if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
          this.node.value += chr;
        }
        this.escaped = false;
      }
    };
    MAX_NESTED_GROUP_DEPTH = 50;
    address_parser_default = addressParser;
  }
});

// ../../node_modules/postal-mime/src/base64-encoder.js
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }
  return base64;
}
var init_base64_encoder = __esm({
  "../../node_modules/postal-mime/src/base64-encoder.js"() {
  }
});

// ../../node_modules/postal-mime/src/postal-mime.js
var MAX_NESTING_DEPTH, MAX_HEADERS_SIZE, PostalMime;
var init_postal_mime = __esm({
  "../../node_modules/postal-mime/src/postal-mime.js"() {
    init_mime_node();
    init_text_format();
    init_address_parser();
    init_decode_strings();
    init_base64_encoder();
    MAX_NESTING_DEPTH = 256;
    MAX_HEADERS_SIZE = 2 * 1024 * 1024;
    PostalMime = class _PostalMime {
      static parse(buf, options) {
        const parser = new _PostalMime(options);
        return parser.parse(buf);
      }
      constructor(options) {
        this.options = options || {};
        this.mimeOptions = {
          maxNestingDepth: this.options.maxNestingDepth || MAX_NESTING_DEPTH,
          maxHeadersSize: this.options.maxHeadersSize || MAX_HEADERS_SIZE
        };
        this.root = this.currentNode = new MimeNode({
          postalMime: this,
          ...this.mimeOptions
        });
        this.boundaries = [];
        this.textContent = {};
        this.attachments = [];
        this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
        this.started = false;
      }
      async finalize() {
        await this.root.finalize();
      }
      async processLine(line, isFinal) {
        let boundaries = this.boundaries;
        if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) {
          for (let i = boundaries.length - 1; i >= 0; i--) {
            let boundary = boundaries[i];
            if (line.length < boundary.value.length + 2) {
              continue;
            }
            let boundaryMatches = true;
            for (let j = 0; j < boundary.value.length; j++) {
              if (line[j + 2] !== boundary.value[j]) {
                boundaryMatches = false;
                break;
              }
            }
            if (!boundaryMatches) {
              continue;
            }
            let boundaryEnd = boundary.value.length + 2;
            let isTerminator = false;
            if (line.length >= boundary.value.length + 4 && line[boundary.value.length + 2] === 45 && line[boundary.value.length + 3] === 45) {
              isTerminator = true;
              boundaryEnd = boundary.value.length + 4;
            }
            let hasValidTrailing = true;
            for (let j = boundaryEnd; j < line.length; j++) {
              if (line[j] !== 32 && line[j] !== 9) {
                hasValidTrailing = false;
                break;
              }
            }
            if (!hasValidTrailing) {
              continue;
            }
            if (isTerminator) {
              await boundary.node.finalize();
              this.currentNode = boundary.node.parentNode || this.root;
            } else {
              await boundary.node.finalizeChildNodes();
              this.currentNode = new MimeNode({
                postalMime: this,
                parentNode: boundary.node,
                parentMultipartType: boundary.node.contentType.multipart,
                ...this.mimeOptions
              });
            }
            if (isFinal) {
              return this.finalize();
            }
            return;
          }
        }
        this.currentNode.feed(line);
        if (isFinal) {
          return this.finalize();
        }
      }
      readLine() {
        let startPos = this.readPos;
        let endPos = this.readPos;
        let res = () => {
          return {
            bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
            done: this.readPos >= this.av.length
          };
        };
        while (this.readPos < this.av.length) {
          const c = this.av[this.readPos++];
          if (c !== 13 && c !== 10) {
            endPos = this.readPos;
          }
          if (c === 10) {
            return res();
          }
        }
        return res();
      }
      async processNodeTree() {
        let textContent = {};
        let textTypes = /* @__PURE__ */ new Set();
        let textMap = this.textMap = /* @__PURE__ */ new Map();
        let forceRfc822Attachments = this.forceRfc822Attachments();
        let walk = async (node, alternative, related) => {
          alternative = alternative || false;
          related = related || false;
          if (!node.contentType.multipart) {
            if (this.isInlineMessageRfc822(node) && !forceRfc822Attachments) {
              const subParser = new _PostalMime();
              node.subMessage = await subParser.parse(node.content);
              if (!textMap.has(node)) {
                textMap.set(node, {});
              }
              let textEntry = textMap.get(node);
              if (node.subMessage.text || !node.subMessage.html) {
                textEntry.plain = textEntry.plain || [];
                textEntry.plain.push({ type: "subMessage", value: node.subMessage });
                textTypes.add("plain");
              }
              if (node.subMessage.html) {
                textEntry.html = textEntry.html || [];
                textEntry.html.push({ type: "subMessage", value: node.subMessage });
                textTypes.add("html");
              }
              if (subParser.textMap) {
                subParser.textMap.forEach((subTextEntry, subTextNode) => {
                  textMap.set(subTextNode, subTextEntry);
                });
              }
              for (let attachment of node.subMessage.attachments || []) {
                this.attachments.push(attachment);
              }
            } else if (this.isInlineTextNode(node)) {
              let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
              let selectorNode = alternative || node;
              if (!textMap.has(selectorNode)) {
                textMap.set(selectorNode, {});
              }
              let textEntry = textMap.get(selectorNode);
              textEntry[textType] = textEntry[textType] || [];
              textEntry[textType].push({ type: "text", value: node.getTextContent() });
              textTypes.add(textType);
            } else if (node.content) {
              const filename = node.contentDisposition?.parsed?.params?.filename || node.contentType.parsed.params.name || null;
              const attachment = {
                filename: filename ? decodeWords(filename) : null,
                mimeType: node.contentType.parsed.value,
                disposition: node.contentDisposition?.parsed?.value || null
              };
              if (related && node.contentId) {
                attachment.related = true;
              }
              if (node.contentDescription) {
                attachment.description = node.contentDescription;
              }
              if (node.contentId) {
                attachment.contentId = node.contentId;
              }
              switch (node.contentType.parsed.value) {
                // Special handling for calendar events
                case "text/calendar":
                case "application/ics": {
                  if (node.contentType.parsed.params.method) {
                    attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
                  }
                  const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
                  attachment.content = textEncoder.encode(decodedText);
                  break;
                }
                // Regular attachments
                default:
                  attachment.content = node.content;
              }
              this.attachments.push(attachment);
            }
          } else if (node.contentType.multipart === "alternative") {
            alternative = node;
          } else if (node.contentType.multipart === "related") {
            related = node;
          }
          for (let childNode of node.childNodes) {
            await walk(childNode, alternative, related);
          }
        };
        await walk(this.root, false, []);
        textMap.forEach((mapEntry) => {
          textTypes.forEach((textType) => {
            if (!textContent[textType]) {
              textContent[textType] = [];
            }
            if (mapEntry[textType]) {
              mapEntry[textType].forEach((textEntry) => {
                switch (textEntry.type) {
                  case "text":
                    textContent[textType].push(textEntry.value);
                    break;
                  case "subMessage":
                    {
                      switch (textType) {
                        case "html":
                          textContent[textType].push(formatHtmlHeader(textEntry.value));
                          break;
                        case "plain":
                          textContent[textType].push(formatTextHeader(textEntry.value));
                          break;
                      }
                    }
                    break;
                }
              });
            } else {
              let alternativeType;
              switch (textType) {
                case "html":
                  alternativeType = "plain";
                  break;
                case "plain":
                  alternativeType = "html";
                  break;
              }
              (mapEntry[alternativeType] || []).forEach((textEntry) => {
                switch (textEntry.type) {
                  case "text":
                    switch (textType) {
                      case "html":
                        textContent[textType].push(textToHtml(textEntry.value));
                        break;
                      case "plain":
                        textContent[textType].push(htmlToText(textEntry.value));
                        break;
                    }
                    break;
                  case "subMessage":
                    {
                      switch (textType) {
                        case "html":
                          textContent[textType].push(formatHtmlHeader(textEntry.value));
                          break;
                        case "plain":
                          textContent[textType].push(formatTextHeader(textEntry.value));
                          break;
                      }
                    }
                    break;
                }
              });
            }
          });
        });
        Object.keys(textContent).forEach((textType) => {
          textContent[textType] = textContent[textType].join("\n");
        });
        this.textContent = textContent;
      }
      isInlineTextNode(node) {
        if (node.contentDisposition?.parsed?.value === "attachment") {
          return false;
        }
        switch (node.contentType.parsed?.value) {
          case "text/html":
          case "text/plain":
            return true;
          case "text/calendar":
          case "text/csv":
          default:
            return false;
        }
      }
      isInlineMessageRfc822(node) {
        if (node.contentType.parsed?.value !== "message/rfc822") {
          return false;
        }
        let disposition = node.contentDisposition?.parsed?.value || (this.options.rfc822Attachments ? "attachment" : "inline");
        return disposition === "inline";
      }
      // Check if this is a specially crafted report email where message/rfc822 content should not be inlined
      forceRfc822Attachments() {
        if (this.options.forceRfc822Attachments) {
          return true;
        }
        let forceRfc822Attachments = false;
        let walk = (node) => {
          if (!node.contentType.multipart) {
            if (node.contentType.parsed && ["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) {
              forceRfc822Attachments = true;
            }
          }
          for (let childNode of node.childNodes) {
            walk(childNode);
          }
        };
        walk(this.root);
        return forceRfc822Attachments;
      }
      async resolveStream(stream) {
        let chunkLen = 0;
        let chunks = [];
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value);
          chunkLen += value.length;
        }
        const result = new Uint8Array(chunkLen);
        let chunkPointer = 0;
        for (let chunk of chunks) {
          result.set(chunk, chunkPointer);
          chunkPointer += chunk.length;
        }
        return result;
      }
      async parse(buf) {
        if (this.started) {
          throw new Error("Can not reuse parser, create a new PostalMime object");
        }
        this.started = true;
        if (buf && typeof buf.getReader === "function") {
          buf = await this.resolveStream(buf);
        }
        buf = buf || new ArrayBuffer(0);
        if (typeof buf === "string") {
          buf = textEncoder.encode(buf);
        }
        if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") {
          buf = await blobToArrayBuffer(buf);
        }
        if (buf.buffer instanceof ArrayBuffer) {
          buf = new Uint8Array(buf).buffer;
        }
        this.buf = buf;
        this.av = new Uint8Array(buf);
        this.readPos = 0;
        while (this.readPos < this.av.length) {
          const line = this.readLine();
          await this.processLine(line.bytes, line.done);
        }
        await this.processNodeTree();
        const message = {
          headers: this.root.headers.map((entry) => ({ key: entry.key, value: entry.value })).reverse()
        };
        for (const key of ["from", "sender"]) {
          const addressHeader = this.root.headers.find((line) => line.key === key);
          if (addressHeader && addressHeader.value) {
            const addresses = address_parser_default(addressHeader.value);
            if (addresses && addresses.length) {
              message[key] = addresses[0];
            }
          }
        }
        for (const key of ["delivered-to", "return-path"]) {
          const addressHeader = this.root.headers.find((line) => line.key === key);
          if (addressHeader && addressHeader.value) {
            const addresses = address_parser_default(addressHeader.value);
            if (addresses && addresses.length && addresses[0].address) {
              const camelKey = key.replace(/\-(.)/g, (o, c) => c.toUpperCase());
              message[camelKey] = addresses[0].address;
            }
          }
        }
        for (const key of ["to", "cc", "bcc", "reply-to"]) {
          const addressHeaders = this.root.headers.filter((line) => line.key === key);
          let addresses = [];
          addressHeaders.filter((entry) => entry && entry.value).map((entry) => address_parser_default(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
          if (addresses && addresses.length) {
            const camelKey = key.replace(/\-(.)/g, (o, c) => c.toUpperCase());
            message[camelKey] = addresses;
          }
        }
        for (const key of ["subject", "message-id", "in-reply-to", "references"]) {
          const header = this.root.headers.find((line) => line.key === key);
          if (header && header.value) {
            const camelKey = key.replace(/\-(.)/g, (o, c) => c.toUpperCase());
            message[camelKey] = decodeWords(header.value);
          }
        }
        let dateHeader = this.root.headers.find((line) => line.key === "date");
        if (dateHeader) {
          let date = new Date(dateHeader.value);
          if (!date || date.toString() === "Invalid Date") {
            date = dateHeader.value;
          } else {
            date = date.toISOString();
          }
          message.date = date;
        }
        if (this.textContent?.html) {
          message.html = this.textContent.html;
        }
        if (this.textContent?.plain) {
          message.text = this.textContent.plain;
        }
        message.attachments = this.attachments;
        message.headerLines = (this.root.rawHeaderLines || []).slice().reverse();
        switch (this.attachmentEncoding) {
          case "arraybuffer":
            break;
          case "base64":
            for (let attachment of message.attachments || []) {
              if (attachment?.content) {
                attachment.content = base64ArrayBuffer(attachment.content);
                attachment.encoding = "base64";
              }
            }
            break;
          case "utf8":
            let attachmentDecoder = new TextDecoder("utf8");
            for (let attachment of message.attachments || []) {
              if (attachment?.content) {
                attachment.content = attachmentDecoder.decode(attachment.content);
                attachment.encoding = "utf8";
              }
            }
            break;
          default:
            throw new Error("Unknwon attachment encoding");
        }
        return message;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/applicationIn.js
var require_applicationIn = __commonJS({
  "../../node_modules/svix/dist/models/applicationIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationInSerializer = void 0;
    exports.ApplicationInSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/applicationOut.js
var require_applicationOut = __commonJS({
  "../../node_modules/svix/dist/models/applicationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationOutSerializer = void 0;
    exports.ApplicationOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          id: self.id,
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/applicationPatch.js
var require_applicationPatch = __commonJS({
  "../../node_modules/svix/dist/models/applicationPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationPatchSerializer = void 0;
    exports.ApplicationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseApplicationOut.js
var require_listResponseApplicationOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseApplicationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseApplicationOutSerializer = void 0;
    var applicationOut_1 = require_applicationOut();
    exports.ListResponseApplicationOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => applicationOut_1.ApplicationOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => applicationOut_1.ApplicationOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/util.js
var require_util = __commonJS({
  "../../node_modules/svix/dist/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApiException = void 0;
    var ApiException = class extends Error {
      constructor(code, body, headers) {
        super(`HTTP-Code: ${code}
Headers: ${JSON.stringify(headers)}`);
        this.code = code;
        this.body = body;
        this.headers = {};
        headers.forEach((value, name) => {
          this.headers[name] = value;
        });
      }
    };
    exports.ApiException = ApiException;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/max.js
var max_default;
var init_max = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/max.js"() {
    max_default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    stringify_default = stringify;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/rng.js
import crypto from "node:crypto";
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/rng.js"() {
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node;
  let clockseq = options.clockseq;
  if (!options._v6) {
    if (!node) {
      node = _nodeId;
    }
    if (clockseq == null) {
      clockseq = _clockseq;
    }
  }
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = [seedBytes[0], seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      if (!_nodeId && !options._v6) {
        node[0] |= 1;
        _nodeId = node;
      }
    }
    if (clockseq == null) {
      clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
      if (_clockseq === void 0 && !options._v6) {
        _clockseq = clockseq;
      }
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v1ToV6.js
function v1ToV6(uuid) {
  const v1Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v6Bytes = _v1ToV6(v1Bytes);
  return typeof uuid === "string" ? unsafeStringify(v6Bytes) : v6Bytes;
}
function _v1ToV6(v1Bytes, randomize = false) {
  return Uint8Array.of((v1Bytes[6] & 15) << 4 | v1Bytes[7] >> 4 & 15, (v1Bytes[7] & 15) << 4 | (v1Bytes[4] & 240) >> 4, (v1Bytes[4] & 15) << 4 | (v1Bytes[5] & 240) >> 4, (v1Bytes[5] & 15) << 4 | (v1Bytes[0] & 240) >> 4, (v1Bytes[0] & 15) << 4 | (v1Bytes[1] & 240) >> 4, (v1Bytes[1] & 15) << 4 | (v1Bytes[2] & 240) >> 4, 96 | v1Bytes[2] & 15, v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
}
var init_v1ToV6 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v1ToV6.js"() {
    init_parse();
    init_stringify();
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version3, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version3;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/md5.js
import crypto2 from "node:crypto";
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto2.createHash("md5").update(bytes).digest();
}
var md5_default;
var init_md5 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/md5.js"() {
    md5_default = md5;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35("v3", 48, md5_default);
    v3_default = v3;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/native.js
import crypto3 from "node:crypto";
var native_default;
var init_native = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/native.js"() {
    native_default = {
      randomUUID: crypto3.randomUUID
    };
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/sha1.js
import crypto4 from "node:crypto";
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto4.createHash("sha1").update(bytes).digest();
}
var sha1_default;
var init_sha1 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/sha1.js"() {
    sha1_default = sha1;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v6.js
function v6(options = {}, buf, offset = 0) {
  let bytes = v1_default({
    ...options,
    _v6: true
  }, new Uint8Array(16));
  bytes = v1ToV6(bytes);
  if (buf) {
    for (let i = 0; i < 16; i++) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}
var init_v6 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v6.js"() {
    init_stringify();
    init_v1();
    init_v1ToV6();
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v6ToV1.js
function v6ToV1(uuid) {
  const v6Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v1Bytes = _v6ToV1(v6Bytes);
  return typeof uuid === "string" ? unsafeStringify(v1Bytes) : v1Bytes;
}
function _v6ToV1(v6Bytes) {
  return Uint8Array.of((v6Bytes[3] & 15) << 4 | v6Bytes[4] >> 4 & 15, (v6Bytes[4] & 15) << 4 | (v6Bytes[5] & 240) >> 4, (v6Bytes[5] & 15) << 4 | v6Bytes[6] & 15, v6Bytes[7], (v6Bytes[1] & 15) << 4 | (v6Bytes[2] & 240) >> 4, (v6Bytes[2] & 15) << 4 | (v6Bytes[3] & 240) >> 4, 16 | (v6Bytes[0] & 240) >> 4, (v6Bytes[0] & 15) << 4 | (v6Bytes[1] & 240) >> 4, v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
}
var init_v6ToV1 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v6ToV1.js"() {
    init_parse();
    init_stringify();
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/v7.js
function v7(options, buf, offset) {
  options = options || {};
  let i = buf && offset || 0;
  const b = buf || new Uint8Array(16);
  const rnds = options.random || (options.rng || rng)();
  const msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let seq = options.seq !== void 0 ? options.seq : null;
  let seqHigh = _seqHigh;
  let seqLow = _seqLow;
  if (msecs > _msecs && options.msecs === void 0) {
    _msecs = msecs;
    if (seq !== null) {
      seqHigh = null;
      seqLow = null;
    }
  }
  if (seq !== null) {
    if (seq > 2147483647) {
      seq = 2147483647;
    }
    seqHigh = seq >>> 19 & 4095;
    seqLow = seq & 524287;
  }
  if (seqHigh === null || seqLow === null) {
    seqHigh = rnds[6] & 127;
    seqHigh = seqHigh << 8 | rnds[7];
    seqLow = rnds[8] & 63;
    seqLow = seqLow << 8 | rnds[9];
    seqLow = seqLow << 5 | rnds[10] >>> 3;
  }
  if (msecs + 1e4 > _msecs && seq === null) {
    if (++seqLow > 524287) {
      seqLow = 0;
      if (++seqHigh > 4095) {
        seqHigh = 0;
        _msecs++;
      }
    }
  } else {
    _msecs = msecs;
  }
  _seqHigh = seqHigh;
  _seqLow = seqLow;
  b[i++] = _msecs / 1099511627776 & 255;
  b[i++] = _msecs / 4294967296 & 255;
  b[i++] = _msecs / 16777216 & 255;
  b[i++] = _msecs / 65536 & 255;
  b[i++] = _msecs / 256 & 255;
  b[i++] = _msecs & 255;
  b[i++] = seqHigh >>> 4 & 15 | 112;
  b[i++] = seqHigh & 255;
  b[i++] = seqLow >>> 13 & 63 | 128;
  b[i++] = seqLow >>> 5 & 255;
  b[i++] = seqLow << 3 & 255 | rnds[10] & 7;
  b[i++] = rnds[11];
  b[i++] = rnds[12];
  b[i++] = rnds[13];
  b[i++] = rnds[14];
  b[i++] = rnds[15];
  return buf || unsafeStringify(b);
}
var _seqLow, _seqHigh, _msecs, v7_default;
var init_v7 = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/v7.js"() {
    init_rng();
    init_stringify();
    _seqLow = null;
    _seqHigh = null;
    _msecs = 0;
    v7_default = v7;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// ../../node_modules/svix/node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  MAX: () => max_default,
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v1ToV6: () => v1ToV6,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  v6: () => v6,
  v6ToV1: () => v6ToV1,
  v7: () => v7_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "../../node_modules/svix/node_modules/uuid/dist/esm-node/index.js"() {
    init_max();
    init_nil();
    init_parse();
    init_stringify();
    init_v1();
    init_v1ToV6();
    init_v3();
    init_v4();
    init_v5();
    init_v6();
    init_v6ToV1();
    init_v7();
    init_validate();
    init_version();
  }
});

// ../../node_modules/svix/dist/request.js
var require_request = __commonJS({
  "../../node_modules/svix/dist/request.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixRequest = exports.HttpMethod = exports.LIB_VERSION = void 0;
    var util_1 = require_util();
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    exports.LIB_VERSION = "1.84.1";
    var USER_AGENT = `svix-libs/${exports.LIB_VERSION}/javascript`;
    var HttpMethod;
    (function(HttpMethod2) {
      HttpMethod2["GET"] = "GET";
      HttpMethod2["HEAD"] = "HEAD";
      HttpMethod2["POST"] = "POST";
      HttpMethod2["PUT"] = "PUT";
      HttpMethod2["DELETE"] = "DELETE";
      HttpMethod2["CONNECT"] = "CONNECT";
      HttpMethod2["OPTIONS"] = "OPTIONS";
      HttpMethod2["TRACE"] = "TRACE";
      HttpMethod2["PATCH"] = "PATCH";
    })(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
    var SvixRequest = class {
      constructor(method, path5) {
        this.method = method;
        this.path = path5;
        this.queryParams = {};
        this.headerParams = {};
      }
      setPathParam(name, value) {
        const newPath = this.path.replace(`{${name}}`, encodeURIComponent(value));
        if (this.path === newPath) {
          throw new Error(`path parameter ${name} not found`);
        }
        this.path = newPath;
      }
      setQueryParams(params) {
        for (const [name, value] of Object.entries(params)) {
          this.setQueryParam(name, value);
        }
      }
      setQueryParam(name, value) {
        if (value === void 0 || value === null) {
          return;
        }
        if (typeof value === "string") {
          this.queryParams[name] = value;
        } else if (typeof value === "boolean" || typeof value === "number") {
          this.queryParams[name] = value.toString();
        } else if (value instanceof Date) {
          this.queryParams[name] = value.toISOString();
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            this.queryParams[name] = value.join(",");
          }
        } else {
          const _assert_unreachable = value;
          throw new Error(`query parameter ${name} has unsupported type`);
        }
      }
      setHeaderParam(name, value) {
        if (value === void 0) {
          return;
        }
        this.headerParams[name] = value;
      }
      setBody(value) {
        this.body = JSON.stringify(value);
      }
      send(ctx, parseResponseBody) {
        return __awaiter(this, void 0, void 0, function* () {
          const response = yield this.sendInner(ctx);
          if (response.status === 204) {
            return null;
          }
          const responseBody = yield response.text();
          return parseResponseBody(JSON.parse(responseBody));
        });
      }
      sendNoResponseBody(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.sendInner(ctx);
        });
      }
      sendInner(ctx) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
          const url = new URL(ctx.baseUrl + this.path);
          for (const [name, value] of Object.entries(this.queryParams)) {
            url.searchParams.set(name, value);
          }
          if (this.headerParams["idempotency-key"] === void 0 && this.method.toUpperCase() === "POST") {
            this.headerParams["idempotency-key"] = `auto_${(0, uuid_1.v4)()}`;
          }
          const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
          if (this.body != null) {
            this.headerParams["content-type"] = "application/json";
          }
          const isCredentialsSupported = "credentials" in Request.prototype;
          const response = yield sendWithRetry(url, {
            method: this.method.toString(),
            body: this.body,
            headers: Object.assign({ accept: "application/json, */*;q=0.8", authorization: `Bearer ${ctx.token}`, "user-agent": USER_AGENT, "svix-req-id": randomId.toString() }, this.headerParams),
            credentials: isCredentialsSupported ? "same-origin" : void 0,
            signal: ctx.timeout !== void 0 ? AbortSignal.timeout(ctx.timeout) : void 0
          }, ctx.retryScheduleInMs, (_a = ctx.retryScheduleInMs) === null || _a === void 0 ? void 0 : _a[0], ((_b = ctx.retryScheduleInMs) === null || _b === void 0 ? void 0 : _b.length) || ctx.numRetries, ctx.fetch);
          return filterResponseForErrors(response);
        });
      }
    };
    exports.SvixRequest = SvixRequest;
    function filterResponseForErrors(response) {
      return __awaiter(this, void 0, void 0, function* () {
        if (response.status < 300) {
          return response;
        }
        const responseBody = yield response.text();
        if (response.status === 422) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        if (response.status >= 400 && response.status <= 499) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        throw new util_1.ApiException(response.status, responseBody, response.headers);
      });
    }
    function sendWithRetry(url, init, retryScheduleInMs, nextInterval = 50, triesLeft = 2, fetchImpl = fetch, retryCount = 1) {
      return __awaiter(this, void 0, void 0, function* () {
        const sleep = (interval) => new Promise((resolve) => setTimeout(resolve, interval));
        try {
          const response = yield fetchImpl(url, init);
          if (triesLeft <= 0 || response.status < 500) {
            return response;
          }
        } catch (e) {
          if (triesLeft <= 0) {
            throw e;
          }
        }
        yield sleep(nextInterval);
        init.headers["svix-retry-count"] = retryCount.toString();
        nextInterval = (retryScheduleInMs === null || retryScheduleInMs === void 0 ? void 0 : retryScheduleInMs[retryCount]) || nextInterval * 2;
        return yield sendWithRetry(url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, ++retryCount);
      });
    }
  }
});

// ../../node_modules/svix/dist/api/application.js
var require_application = __commonJS({
  "../../node_modules/svix/dist/api/application.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Application = void 0;
    var applicationIn_1 = require_applicationIn();
    var applicationOut_1 = require_applicationOut();
    var applicationPatch_1 = require_applicationPatch();
    var listResponseApplicationOut_1 = require_listResponseApplicationOut();
    var request_1 = require_request();
    var Application = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app");
        request.setQueryParams({
          exclude_apps_with_no_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithNoEndpoints,
          exclude_apps_with_disabled_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithDisabledEndpoints,
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseApplicationOut_1.ListResponseApplicationOutSerializer._fromJsonObject);
      }
      create(applicationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      getOrCreate(applicationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
        request.setQueryParam("get_if_exists", true);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      get(appId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      update(appId, applicationIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      delete(appId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(appId, applicationPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        request.setBody(applicationPatch_1.ApplicationPatchSerializer._toJsonObject(applicationPatch));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
    };
    exports.Application = Application;
  }
});

// ../../node_modules/svix/dist/models/apiTokenOut.js
var require_apiTokenOut = __commonJS({
  "../../node_modules/svix/dist/models/apiTokenOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApiTokenOutSerializer = void 0;
    exports.ApiTokenOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          expiresAt: object["expiresAt"] ? new Date(object["expiresAt"]) : null,
          id: object["id"],
          name: object["name"],
          scopes: object["scopes"],
          token: object["token"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          expiresAt: self.expiresAt,
          id: self.id,
          name: self.name,
          scopes: self.scopes,
          token: self.token
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/appPortalCapability.js
var require_appPortalCapability = __commonJS({
  "../../node_modules/svix/dist/models/appPortalCapability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppPortalCapabilitySerializer = exports.AppPortalCapability = void 0;
    var AppPortalCapability;
    (function(AppPortalCapability2) {
      AppPortalCapability2["ViewBase"] = "ViewBase";
      AppPortalCapability2["ViewEndpointSecret"] = "ViewEndpointSecret";
      AppPortalCapability2["ManageEndpointSecret"] = "ManageEndpointSecret";
      AppPortalCapability2["ManageTransformations"] = "ManageTransformations";
      AppPortalCapability2["CreateAttempts"] = "CreateAttempts";
      AppPortalCapability2["ManageEndpoint"] = "ManageEndpoint";
    })(AppPortalCapability = exports.AppPortalCapability || (exports.AppPortalCapability = {}));
    exports.AppPortalCapabilitySerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/appPortalAccessIn.js
var require_appPortalAccessIn = __commonJS({
  "../../node_modules/svix/dist/models/appPortalAccessIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppPortalAccessInSerializer = void 0;
    var appPortalCapability_1 = require_appPortalCapability();
    var applicationIn_1 = require_applicationIn();
    exports.AppPortalAccessInSerializer = {
      _fromJsonObject(object) {
        var _a;
        return {
          application: object["application"] ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
          capabilities: (_a = object["capabilities"]) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._fromJsonObject(item)),
          expiry: object["expiry"],
          featureFlags: object["featureFlags"],
          readOnly: object["readOnly"],
          sessionId: object["sessionId"]
        };
      },
      _toJsonObject(self) {
        var _a;
        return {
          application: self.application ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
          capabilities: (_a = self.capabilities) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._toJsonObject(item)),
          expiry: self.expiry,
          featureFlags: self.featureFlags,
          readOnly: self.readOnly,
          sessionId: self.sessionId
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/appPortalAccessOut.js
var require_appPortalAccessOut = __commonJS({
  "../../node_modules/svix/dist/models/appPortalAccessOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppPortalAccessOutSerializer = void 0;
    exports.AppPortalAccessOutSerializer = {
      _fromJsonObject(object) {
        return {
          token: object["token"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          token: self.token,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/applicationTokenExpireIn.js
var require_applicationTokenExpireIn = __commonJS({
  "../../node_modules/svix/dist/models/applicationTokenExpireIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplicationTokenExpireInSerializer = void 0;
    exports.ApplicationTokenExpireInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          sessionIds: object["sessionIds"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          sessionIds: self.sessionIds
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/rotatePollerTokenIn.js
var require_rotatePollerTokenIn = __commonJS({
  "../../node_modules/svix/dist/models/rotatePollerTokenIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RotatePollerTokenInSerializer = void 0;
    exports.RotatePollerTokenInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          oldTokenExpiry: object["oldTokenExpiry"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          oldTokenExpiry: self.oldTokenExpiry
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamPortalAccessIn.js
var require_streamPortalAccessIn = __commonJS({
  "../../node_modules/svix/dist/models/streamPortalAccessIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamPortalAccessInSerializer = void 0;
    exports.StreamPortalAccessInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          featureFlags: object["featureFlags"],
          sessionId: object["sessionId"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          featureFlags: self.featureFlags,
          sessionId: self.sessionId
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/dashboardAccessOut.js
var require_dashboardAccessOut = __commonJS({
  "../../node_modules/svix/dist/models/dashboardAccessOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DashboardAccessOutSerializer = void 0;
    exports.DashboardAccessOutSerializer = {
      _fromJsonObject(object) {
        return {
          token: object["token"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          token: self.token,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/authentication.js
var require_authentication = __commonJS({
  "../../node_modules/svix/dist/api/authentication.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Authentication = void 0;
    var apiTokenOut_1 = require_apiTokenOut();
    var appPortalAccessIn_1 = require_appPortalAccessIn();
    var appPortalAccessOut_1 = require_appPortalAccessOut();
    var applicationTokenExpireIn_1 = require_applicationTokenExpireIn();
    var rotatePollerTokenIn_1 = require_rotatePollerTokenIn();
    var streamPortalAccessIn_1 = require_streamPortalAccessIn();
    var dashboardAccessOut_1 = require_dashboardAccessOut();
    var request_1 = require_request();
    var Authentication = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      appPortalAccess(appId, appPortalAccessIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app-portal-access/{app_id}");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(appPortalAccessIn_1.AppPortalAccessInSerializer._toJsonObject(appPortalAccessIn));
        return request.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
      }
      expireAll(appId, applicationTokenExpireIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app/{app_id}/expire-all");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationTokenExpireIn_1.ApplicationTokenExpireInSerializer._toJsonObject(applicationTokenExpireIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      dashboardAccess(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/dashboard-access/{app_id}");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
      }
      logout(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/logout");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.sendNoResponseBody(this.requestCtx);
      }
      streamPortalAccess(streamId, streamPortalAccessIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream-portal-access/{stream_id}");
        request.setPathParam("stream_id", streamId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamPortalAccessIn_1.StreamPortalAccessInSerializer._toJsonObject(streamPortalAccessIn));
        return request.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
      }
      getStreamPollerToken(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
      }
      rotateStreamPollerToken(streamId, sinkId, rotatePollerTokenIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token/rotate");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(rotatePollerTokenIn_1.RotatePollerTokenInSerializer._toJsonObject(rotatePollerTokenIn));
        return request.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
      }
    };
    exports.Authentication = Authentication;
  }
});

// ../../node_modules/svix/dist/models/backgroundTaskStatus.js
var require_backgroundTaskStatus = __commonJS({
  "../../node_modules/svix/dist/models/backgroundTaskStatus.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTaskStatusSerializer = exports.BackgroundTaskStatus = void 0;
    var BackgroundTaskStatus;
    (function(BackgroundTaskStatus2) {
      BackgroundTaskStatus2["Running"] = "running";
      BackgroundTaskStatus2["Finished"] = "finished";
      BackgroundTaskStatus2["Failed"] = "failed";
    })(BackgroundTaskStatus = exports.BackgroundTaskStatus || (exports.BackgroundTaskStatus = {}));
    exports.BackgroundTaskStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/backgroundTaskType.js
var require_backgroundTaskType = __commonJS({
  "../../node_modules/svix/dist/models/backgroundTaskType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTaskTypeSerializer = exports.BackgroundTaskType = void 0;
    var BackgroundTaskType;
    (function(BackgroundTaskType2) {
      BackgroundTaskType2["EndpointReplay"] = "endpoint.replay";
      BackgroundTaskType2["EndpointRecover"] = "endpoint.recover";
      BackgroundTaskType2["ApplicationStats"] = "application.stats";
      BackgroundTaskType2["MessageBroadcast"] = "message.broadcast";
      BackgroundTaskType2["SdkGenerate"] = "sdk.generate";
      BackgroundTaskType2["EventTypeAggregate"] = "event-type.aggregate";
      BackgroundTaskType2["ApplicationPurgeContent"] = "application.purge_content";
      BackgroundTaskType2["EndpointBulkReplay"] = "endpoint.bulk_replay";
    })(BackgroundTaskType = exports.BackgroundTaskType || (exports.BackgroundTaskType = {}));
    exports.BackgroundTaskTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/backgroundTaskOut.js
var require_backgroundTaskOut = __commonJS({
  "../../node_modules/svix/dist/models/backgroundTaskOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTaskOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.BackgroundTaskOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"],
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data,
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseBackgroundTaskOut.js
var require_listResponseBackgroundTaskOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseBackgroundTaskOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseBackgroundTaskOutSerializer = void 0;
    var backgroundTaskOut_1 = require_backgroundTaskOut();
    exports.ListResponseBackgroundTaskOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/backgroundTask.js
var require_backgroundTask = __commonJS({
  "../../node_modules/svix/dist/api/backgroundTask.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackgroundTask = void 0;
    var backgroundTaskOut_1 = require_backgroundTaskOut();
    var listResponseBackgroundTaskOut_1 = require_listResponseBackgroundTaskOut();
    var request_1 = require_request();
    var BackgroundTask = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task");
        request.setQueryParams({
          status: options === null || options === void 0 ? void 0 : options.status,
          task: options === null || options === void 0 ? void 0 : options.task,
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseBackgroundTaskOut_1.ListResponseBackgroundTaskOutSerializer._fromJsonObject);
      }
      listByEndpoint(options) {
        return this.list(options);
      }
      get(taskId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task/{task_id}");
        request.setPathParam("task_id", taskId);
        return request.send(this.requestCtx, backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject);
      }
    };
    exports.BackgroundTask = BackgroundTask;
  }
});

// ../../node_modules/svix/dist/models/connectorKind.js
var require_connectorKind = __commonJS({
  "../../node_modules/svix/dist/models/connectorKind.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorKindSerializer = exports.ConnectorKind = void 0;
    var ConnectorKind;
    (function(ConnectorKind2) {
      ConnectorKind2["Custom"] = "Custom";
      ConnectorKind2["AgenticCommerceProtocol"] = "AgenticCommerceProtocol";
      ConnectorKind2["CloseCrm"] = "CloseCRM";
      ConnectorKind2["CustomerIo"] = "CustomerIO";
      ConnectorKind2["Discord"] = "Discord";
      ConnectorKind2["Hubspot"] = "Hubspot";
      ConnectorKind2["Inngest"] = "Inngest";
      ConnectorKind2["Loops"] = "Loops";
      ConnectorKind2["Otel"] = "Otel";
      ConnectorKind2["Resend"] = "Resend";
      ConnectorKind2["Salesforce"] = "Salesforce";
      ConnectorKind2["Segment"] = "Segment";
      ConnectorKind2["Sendgrid"] = "Sendgrid";
      ConnectorKind2["Slack"] = "Slack";
      ConnectorKind2["Teams"] = "Teams";
      ConnectorKind2["TriggerDev"] = "TriggerDev";
      ConnectorKind2["Windmill"] = "Windmill";
      ConnectorKind2["Zapier"] = "Zapier";
    })(ConnectorKind = exports.ConnectorKind || (exports.ConnectorKind = {}));
    exports.ConnectorKindSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/connectorProduct.js
var require_connectorProduct = __commonJS({
  "../../node_modules/svix/dist/models/connectorProduct.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorProductSerializer = exports.ConnectorProduct = void 0;
    var ConnectorProduct;
    (function(ConnectorProduct2) {
      ConnectorProduct2["Dispatch"] = "Dispatch";
      ConnectorProduct2["Stream"] = "Stream";
    })(ConnectorProduct = exports.ConnectorProduct || (exports.ConnectorProduct = {}));
    exports.ConnectorProductSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/connectorIn.js
var require_connectorIn = __commonJS({
  "../../node_modules/svix/dist/models/connectorIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorInSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    var connectorProduct_1 = require_connectorProduct();
    exports.ConnectorInSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          productType: object["productType"] ? connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]) : void 0,
          transformation: object["transformation"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          productType: self.productType ? connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType) : void 0,
          transformation: self.transformation,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/connectorOut.js
var require_connectorOut = __commonJS({
  "../../node_modules/svix/dist/models/connectorOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorOutSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    var connectorProduct_1 = require_connectorProduct();
    exports.ConnectorOutSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          featureFlags: object["featureFlags"],
          id: object["id"],
          instructions: object["instructions"],
          kind: connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]),
          logo: object["logo"],
          name: object["name"],
          orgId: object["orgId"],
          productType: connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]),
          transformation: object["transformation"],
          transformationUpdatedAt: new Date(object["transformationUpdatedAt"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          createdAt: self.createdAt,
          description: self.description,
          featureFlags: self.featureFlags,
          id: self.id,
          instructions: self.instructions,
          kind: connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind),
          logo: self.logo,
          name: self.name,
          orgId: self.orgId,
          productType: connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType),
          transformation: self.transformation,
          transformationUpdatedAt: self.transformationUpdatedAt,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/connectorPatch.js
var require_connectorPatch = __commonJS({
  "../../node_modules/svix/dist/models/connectorPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorPatchSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    exports.ConnectorPatchSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          transformation: object["transformation"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          transformation: self.transformation
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/connectorUpdate.js
var require_connectorUpdate = __commonJS({
  "../../node_modules/svix/dist/models/connectorUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConnectorUpdateSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    exports.ConnectorUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          transformation: object["transformation"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          transformation: self.transformation
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseConnectorOut.js
var require_listResponseConnectorOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseConnectorOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseConnectorOutSerializer = void 0;
    var connectorOut_1 = require_connectorOut();
    exports.ListResponseConnectorOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/connector.js
var require_connector = __commonJS({
  "../../node_modules/svix/dist/api/connector.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Connector = void 0;
    var connectorIn_1 = require_connectorIn();
    var connectorOut_1 = require_connectorOut();
    var connectorPatch_1 = require_connectorPatch();
    var connectorUpdate_1 = require_connectorUpdate();
    var listResponseConnectorOut_1 = require_listResponseConnectorOut();
    var request_1 = require_request();
    var Connector = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order,
          product_type: options === null || options === void 0 ? void 0 : options.productType
        });
        return request.send(this.requestCtx, listResponseConnectorOut_1.ListResponseConnectorOutSerializer._fromJsonObject);
      }
      create(connectorIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/connector");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(connectorIn_1.ConnectorInSerializer._toJsonObject(connectorIn));
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
      get(connectorId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
      update(connectorId, connectorUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        request.setBody(connectorUpdate_1.ConnectorUpdateSerializer._toJsonObject(connectorUpdate));
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
      delete(connectorId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(connectorId, connectorPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        request.setBody(connectorPatch_1.ConnectorPatchSerializer._toJsonObject(connectorPatch));
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
    };
    exports.Connector = Connector;
  }
});

// ../../node_modules/svix/dist/models/endpointHeadersIn.js
var require_endpointHeadersIn = __commonJS({
  "../../node_modules/svix/dist/models/endpointHeadersIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointHeadersInSerializer = void 0;
    exports.EndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointHeadersOut.js
var require_endpointHeadersOut = __commonJS({
  "../../node_modules/svix/dist/models/endpointHeadersOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointHeadersOutSerializer = void 0;
    exports.EndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointHeadersPatchIn.js
var require_endpointHeadersPatchIn = __commonJS({
  "../../node_modules/svix/dist/models/endpointHeadersPatchIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointHeadersPatchInSerializer = void 0;
    exports.EndpointHeadersPatchInSerializer = {
      _fromJsonObject(object) {
        return {
          deleteHeaders: object["deleteHeaders"],
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          deleteHeaders: self.deleteHeaders,
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointIn.js
var require_endpointIn = __commonJS({
  "../../node_modules/svix/dist/models/endpointIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointInSerializer = void 0;
    exports.EndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          headers: object["headers"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          headers: self.headers,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointOut.js
var require_endpointOut = __commonJS({
  "../../node_modules/svix/dist/models/endpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointOutSerializer = void 0;
    exports.EndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointPatch.js
var require_endpointPatch = __commonJS({
  "../../node_modules/svix/dist/models/endpointPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointPatchSerializer = void 0;
    exports.EndpointPatchSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointSecretOut.js
var require_endpointSecretOut = __commonJS({
  "../../node_modules/svix/dist/models/endpointSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointSecretOutSerializer = void 0;
    exports.EndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointSecretRotateIn.js
var require_endpointSecretRotateIn = __commonJS({
  "../../node_modules/svix/dist/models/endpointSecretRotateIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointSecretRotateInSerializer = void 0;
    exports.EndpointSecretRotateInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointStats.js
var require_endpointStats = __commonJS({
  "../../node_modules/svix/dist/models/endpointStats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointStatsSerializer = void 0;
    exports.EndpointStatsSerializer = {
      _fromJsonObject(object) {
        return {
          fail: object["fail"],
          pending: object["pending"],
          sending: object["sending"],
          success: object["success"]
        };
      },
      _toJsonObject(self) {
        return {
          fail: self.fail,
          pending: self.pending,
          sending: self.sending,
          success: self.success
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointTransformationIn.js
var require_endpointTransformationIn = __commonJS({
  "../../node_modules/svix/dist/models/endpointTransformationIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointTransformationInSerializer = void 0;
    exports.EndpointTransformationInSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointTransformationOut.js
var require_endpointTransformationOut = __commonJS({
  "../../node_modules/svix/dist/models/endpointTransformationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointTransformationOutSerializer = void 0;
    exports.EndpointTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"],
          updatedAt: object["updatedAt"] ? new Date(object["updatedAt"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointTransformationPatch.js
var require_endpointTransformationPatch = __commonJS({
  "../../node_modules/svix/dist/models/endpointTransformationPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointTransformationPatchSerializer = void 0;
    exports.EndpointTransformationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointUpdate.js
var require_endpointUpdate = __commonJS({
  "../../node_modules/svix/dist/models/endpointUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointUpdateSerializer = void 0;
    exports.EndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventExampleIn.js
var require_eventExampleIn = __commonJS({
  "../../node_modules/svix/dist/models/eventExampleIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventExampleInSerializer = void 0;
    exports.EventExampleInSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          exampleIndex: object["exampleIndex"]
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          exampleIndex: self.exampleIndex
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseEndpointOut.js
var require_listResponseEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseEndpointOutSerializer = void 0;
    var endpointOut_1 = require_endpointOut();
    exports.ListResponseEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => endpointOut_1.EndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => endpointOut_1.EndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/messageOut.js
var require_messageOut = __commonJS({
  "../../node_modules/svix/dist/models/messageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageOutSerializer = void 0;
    exports.MessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          id: object["id"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          id: self.id,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/recoverIn.js
var require_recoverIn = __commonJS({
  "../../node_modules/svix/dist/models/recoverIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RecoverInSerializer = void 0;
    exports.RecoverInSerializer = {
      _fromJsonObject(object) {
        return {
          since: new Date(object["since"]),
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/recoverOut.js
var require_recoverOut = __commonJS({
  "../../node_modules/svix/dist/models/recoverOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RecoverOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.RecoverOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/replayIn.js
var require_replayIn = __commonJS({
  "../../node_modules/svix/dist/models/replayIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplayInSerializer = void 0;
    exports.ReplayInSerializer = {
      _fromJsonObject(object) {
        return {
          since: new Date(object["since"]),
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/replayOut.js
var require_replayOut = __commonJS({
  "../../node_modules/svix/dist/models/replayOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplayOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.ReplayOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/endpoint.js
var require_endpoint = __commonJS({
  "../../node_modules/svix/dist/api/endpoint.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Endpoint = void 0;
    var endpointHeadersIn_1 = require_endpointHeadersIn();
    var endpointHeadersOut_1 = require_endpointHeadersOut();
    var endpointHeadersPatchIn_1 = require_endpointHeadersPatchIn();
    var endpointIn_1 = require_endpointIn();
    var endpointOut_1 = require_endpointOut();
    var endpointPatch_1 = require_endpointPatch();
    var endpointSecretOut_1 = require_endpointSecretOut();
    var endpointSecretRotateIn_1 = require_endpointSecretRotateIn();
    var endpointStats_1 = require_endpointStats();
    var endpointTransformationIn_1 = require_endpointTransformationIn();
    var endpointTransformationOut_1 = require_endpointTransformationOut();
    var endpointTransformationPatch_1 = require_endpointTransformationPatch();
    var endpointUpdate_1 = require_endpointUpdate();
    var eventExampleIn_1 = require_eventExampleIn();
    var listResponseEndpointOut_1 = require_listResponseEndpointOut();
    var messageOut_1 = require_messageOut();
    var recoverIn_1 = require_recoverIn();
    var recoverOut_1 = require_recoverOut();
    var replayIn_1 = require_replayIn();
    var replayOut_1 = require_replayOut();
    var request_1 = require_request();
    var Endpoint = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseEndpointOut_1.ListResponseEndpointOutSerializer._fromJsonObject);
      }
      create(appId, endpointIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(endpointIn_1.EndpointInSerializer._toJsonObject(endpointIn));
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      get(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      update(appId, endpointId, endpointUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointUpdate_1.EndpointUpdateSerializer._toJsonObject(endpointUpdate));
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      delete(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(appId, endpointId, endpointPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointPatch_1.EndpointPatchSerializer._toJsonObject(endpointPatch));
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      getHeaders(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
      }
      updateHeaders(appId, endpointId, endpointHeadersIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointHeadersIn_1.EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      headersUpdate(appId, endpointId, endpointHeadersIn) {
        return this.updateHeaders(appId, endpointId, endpointHeadersIn);
      }
      patchHeaders(appId, endpointId, endpointHeadersPatchIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointHeadersPatchIn_1.EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      headersPatch(appId, endpointId, endpointHeadersPatchIn) {
        return this.patchHeaders(appId, endpointId, endpointHeadersPatchIn);
      }
      recover(appId, endpointId, recoverIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/recover");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(recoverIn_1.RecoverInSerializer._toJsonObject(recoverIn));
        return request.send(this.requestCtx, recoverOut_1.RecoverOutSerializer._fromJsonObject);
      }
      replayMissing(appId, endpointId, replayIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/replay-missing");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(replayIn_1.ReplayInSerializer._toJsonObject(replayIn));
        return request.send(this.requestCtx, replayOut_1.ReplayOutSerializer._fromJsonObject);
      }
      getSecret(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointSecretOut_1.EndpointSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(appId, endpointId, endpointSecretRotateIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret/rotate");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      sendExample(appId, endpointId, eventExampleIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/send-example");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(eventExampleIn_1.EventExampleInSerializer._toJsonObject(eventExampleIn));
        return request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
      }
      getStats(appId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/stats");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setQueryParams({
          since: options === null || options === void 0 ? void 0 : options.since,
          until: options === null || options === void 0 ? void 0 : options.until
        });
        return request.send(this.requestCtx, endpointStats_1.EndpointStatsSerializer._fromJsonObject);
      }
      transformationGet(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointTransformationOut_1.EndpointTransformationOutSerializer._fromJsonObject);
      }
      patchTransformation(appId, endpointId, endpointTransformationPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointTransformationPatch_1.EndpointTransformationPatchSerializer._toJsonObject(endpointTransformationPatch));
        return request.sendNoResponseBody(this.requestCtx);
      }
      transformationPartialUpdate(appId, endpointId, endpointTransformationIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointTransformationIn_1.EndpointTransformationInSerializer._toJsonObject(endpointTransformationIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports.Endpoint = Endpoint;
  }
});

// ../../node_modules/svix/dist/models/eventTypeIn.js
var require_eventTypeIn = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeInSerializer = void 0;
    exports.EventTypeInSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/environmentIn.js
var require_environmentIn = __commonJS({
  "../../node_modules/svix/dist/models/environmentIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentInSerializer = void 0;
    var connectorIn_1 = require_connectorIn();
    var eventTypeIn_1 = require_eventTypeIn();
    exports.EnvironmentInSerializer = {
      _fromJsonObject(object) {
        var _a, _b;
        return {
          connectors: (_a = object["connectors"]) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._fromJsonObject(item)),
          eventTypes: (_b = object["eventTypes"]) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._fromJsonObject(item)),
          settings: object["settings"]
        };
      },
      _toJsonObject(self) {
        var _a, _b;
        return {
          connectors: (_a = self.connectors) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._toJsonObject(item)),
          eventTypes: (_b = self.eventTypes) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._toJsonObject(item)),
          settings: self.settings
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventTypeOut.js
var require_eventTypeOut = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeOutSerializer = void 0;
    exports.EventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          createdAt: new Date(object["createdAt"]),
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          createdAt: self.createdAt,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/environmentOut.js
var require_environmentOut = __commonJS({
  "../../node_modules/svix/dist/models/environmentOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentOutSerializer = void 0;
    var connectorOut_1 = require_connectorOut();
    var eventTypeOut_1 = require_eventTypeOut();
    exports.EnvironmentOutSerializer = {
      _fromJsonObject(object) {
        return {
          connectors: object["connectors"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
          createdAt: new Date(object["createdAt"]),
          eventTypes: object["eventTypes"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
          settings: object["settings"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          connectors: self.connectors.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
          createdAt: self.createdAt,
          eventTypes: self.eventTypes.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
          settings: self.settings,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/environment.js
var require_environment = __commonJS({
  "../../node_modules/svix/dist/api/environment.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Environment = void 0;
    var environmentIn_1 = require_environmentIn();
    var environmentOut_1 = require_environmentOut();
    var request_1 = require_request();
    var Environment = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      export(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/export");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, environmentOut_1.EnvironmentOutSerializer._fromJsonObject);
      }
      import(environmentIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/import");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(environmentIn_1.EnvironmentInSerializer._toJsonObject(environmentIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports.Environment = Environment;
  }
});

// ../../node_modules/svix/dist/models/eventTypeImportOpenApiIn.js
var require_eventTypeImportOpenApiIn = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeImportOpenApiIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeImportOpenApiInSerializer = void 0;
    exports.EventTypeImportOpenApiInSerializer = {
      _fromJsonObject(object) {
        return {
          dryRun: object["dryRun"],
          replaceAll: object["replaceAll"],
          spec: object["spec"],
          specRaw: object["specRaw"]
        };
      },
      _toJsonObject(self) {
        return {
          dryRun: self.dryRun,
          replaceAll: self.replaceAll,
          spec: self.spec,
          specRaw: self.specRaw
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventTypeFromOpenApi.js
var require_eventTypeFromOpenApi = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeFromOpenApi.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeFromOpenApiSerializer = void 0;
    exports.EventTypeFromOpenApiSerializer = {
      _fromJsonObject(object) {
        return {
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventTypeImportOpenApiOutData.js
var require_eventTypeImportOpenApiOutData = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeImportOpenApiOutData.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeImportOpenApiOutDataSerializer = void 0;
    var eventTypeFromOpenApi_1 = require_eventTypeFromOpenApi();
    exports.EventTypeImportOpenApiOutDataSerializer = {
      _fromJsonObject(object) {
        var _a;
        return {
          modified: object["modified"],
          toModify: (_a = object["to_modify"]) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._fromJsonObject(item))
        };
      },
      _toJsonObject(self) {
        var _a;
        return {
          modified: self.modified,
          to_modify: (_a = self.toModify) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._toJsonObject(item))
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventTypeImportOpenApiOut.js
var require_eventTypeImportOpenApiOut = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeImportOpenApiOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeImportOpenApiOutSerializer = void 0;
    var eventTypeImportOpenApiOutData_1 = require_eventTypeImportOpenApiOutData();
    exports.EventTypeImportOpenApiOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._fromJsonObject(object["data"])
        };
      },
      _toJsonObject(self) {
        return {
          data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._toJsonObject(self.data)
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventTypePatch.js
var require_eventTypePatch = __commonJS({
  "../../node_modules/svix/dist/models/eventTypePatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypePatchSerializer = void 0;
    exports.EventTypePatchSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventTypeUpdate.js
var require_eventTypeUpdate = __commonJS({
  "../../node_modules/svix/dist/models/eventTypeUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventTypeUpdateSerializer = void 0;
    exports.EventTypeUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          schemas: self.schemas
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseEventTypeOut.js
var require_listResponseEventTypeOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseEventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseEventTypeOutSerializer = void 0;
    var eventTypeOut_1 = require_eventTypeOut();
    exports.ListResponseEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/eventType.js
var require_eventType = __commonJS({
  "../../node_modules/svix/dist/api/eventType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventType = void 0;
    var eventTypeImportOpenApiIn_1 = require_eventTypeImportOpenApiIn();
    var eventTypeImportOpenApiOut_1 = require_eventTypeImportOpenApiOut();
    var eventTypeIn_1 = require_eventTypeIn();
    var eventTypeOut_1 = require_eventTypeOut();
    var eventTypePatch_1 = require_eventTypePatch();
    var eventTypeUpdate_1 = require_eventTypeUpdate();
    var listResponseEventTypeOut_1 = require_listResponseEventTypeOut();
    var request_1 = require_request();
    var EventType = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order,
          include_archived: options === null || options === void 0 ? void 0 : options.includeArchived,
          with_content: options === null || options === void 0 ? void 0 : options.withContent
        });
        return request.send(this.requestCtx, listResponseEventTypeOut_1.ListResponseEventTypeOutSerializer._fromJsonObject);
      }
      create(eventTypeIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(eventTypeIn_1.EventTypeInSerializer._toJsonObject(eventTypeIn));
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
      importOpenapi(eventTypeImportOpenApiIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type/import/openapi");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(eventTypeImportOpenApiIn_1.EventTypeImportOpenApiInSerializer._toJsonObject(eventTypeImportOpenApiIn));
        return request.send(this.requestCtx, eventTypeImportOpenApiOut_1.EventTypeImportOpenApiOutSerializer._fromJsonObject);
      }
      get(eventTypeName) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
      update(eventTypeName, eventTypeUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        request.setBody(eventTypeUpdate_1.EventTypeUpdateSerializer._toJsonObject(eventTypeUpdate));
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
      delete(eventTypeName, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        request.setQueryParams({
          expunge: options === null || options === void 0 ? void 0 : options.expunge
        });
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(eventTypeName, eventTypePatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        request.setBody(eventTypePatch_1.EventTypePatchSerializer._toJsonObject(eventTypePatch));
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
    };
    exports.EventType = EventType;
  }
});

// ../../node_modules/svix/dist/api/health.js
var require_health = __commonJS({
  "../../node_modules/svix/dist/api/health.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Health = void 0;
    var request_1 = require_request();
    var Health = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get() {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/health");
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports.Health = Health;
  }
});

// ../../node_modules/svix/dist/models/ingestSourceConsumerPortalAccessIn.js
var require_ingestSourceConsumerPortalAccessIn = __commonJS({
  "../../node_modules/svix/dist/models/ingestSourceConsumerPortalAccessIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSourceConsumerPortalAccessInSerializer = void 0;
    exports.IngestSourceConsumerPortalAccessInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          readOnly: object["readOnly"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          readOnly: self.readOnly
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointHeadersIn.js
var require_ingestEndpointHeadersIn = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointHeadersIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointHeadersInSerializer = void 0;
    exports.IngestEndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointHeadersOut.js
var require_ingestEndpointHeadersOut = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointHeadersOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointHeadersOutSerializer = void 0;
    exports.IngestEndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointIn.js
var require_ingestEndpointIn = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointInSerializer = void 0;
    exports.IngestEndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointOut.js
var require_ingestEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointOutSerializer = void 0;
    exports.IngestEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointSecretIn.js
var require_ingestEndpointSecretIn = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointSecretIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointSecretInSerializer = void 0;
    exports.IngestEndpointSecretInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointSecretOut.js
var require_ingestEndpointSecretOut = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointSecretOutSerializer = void 0;
    exports.IngestEndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointTransformationOut.js
var require_ingestEndpointTransformationOut = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointTransformationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointTransformationOutSerializer = void 0;
    exports.IngestEndpointTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointTransformationPatch.js
var require_ingestEndpointTransformationPatch = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointTransformationPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointTransformationPatchSerializer = void 0;
    exports.IngestEndpointTransformationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestEndpointUpdate.js
var require_ingestEndpointUpdate = __commonJS({
  "../../node_modules/svix/dist/models/ingestEndpointUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpointUpdateSerializer = void 0;
    exports.IngestEndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseIngestEndpointOut.js
var require_listResponseIngestEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseIngestEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseIngestEndpointOutSerializer = void 0;
    var ingestEndpointOut_1 = require_ingestEndpointOut();
    exports.ListResponseIngestEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/ingestEndpoint.js
var require_ingestEndpoint = __commonJS({
  "../../node_modules/svix/dist/api/ingestEndpoint.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestEndpoint = void 0;
    var ingestEndpointHeadersIn_1 = require_ingestEndpointHeadersIn();
    var ingestEndpointHeadersOut_1 = require_ingestEndpointHeadersOut();
    var ingestEndpointIn_1 = require_ingestEndpointIn();
    var ingestEndpointOut_1 = require_ingestEndpointOut();
    var ingestEndpointSecretIn_1 = require_ingestEndpointSecretIn();
    var ingestEndpointSecretOut_1 = require_ingestEndpointSecretOut();
    var ingestEndpointTransformationOut_1 = require_ingestEndpointTransformationOut();
    var ingestEndpointTransformationPatch_1 = require_ingestEndpointTransformationPatch();
    var ingestEndpointUpdate_1 = require_ingestEndpointUpdate();
    var listResponseIngestEndpointOut_1 = require_listResponseIngestEndpointOut();
    var request_1 = require_request();
    var IngestEndpoint = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(sourceId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint");
        request.setPathParam("source_id", sourceId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseIngestEndpointOut_1.ListResponseIngestEndpointOutSerializer._fromJsonObject);
      }
      create(sourceId, ingestEndpointIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint");
        request.setPathParam("source_id", sourceId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestEndpointIn_1.IngestEndpointInSerializer._toJsonObject(ingestEndpointIn));
        return request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
      }
      get(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
      }
      update(sourceId, endpointId, ingestEndpointUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(ingestEndpointUpdate_1.IngestEndpointUpdateSerializer._toJsonObject(ingestEndpointUpdate));
        return request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
      }
      delete(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      getHeaders(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointHeadersOut_1.IngestEndpointHeadersOutSerializer._fromJsonObject);
      }
      updateHeaders(sourceId, endpointId, ingestEndpointHeadersIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(ingestEndpointHeadersIn_1.IngestEndpointHeadersInSerializer._toJsonObject(ingestEndpointHeadersIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      getSecret(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointSecretOut_1.IngestEndpointSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(sourceId, endpointId, ingestEndpointSecretIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret/rotate");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestEndpointSecretIn_1.IngestEndpointSecretInSerializer._toJsonObject(ingestEndpointSecretIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      getTransformation(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointTransformationOut_1.IngestEndpointTransformationOutSerializer._fromJsonObject);
      }
      setTransformation(sourceId, endpointId, ingestEndpointTransformationPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(ingestEndpointTransformationPatch_1.IngestEndpointTransformationPatchSerializer._toJsonObject(ingestEndpointTransformationPatch));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports.IngestEndpoint = IngestEndpoint;
  }
});

// ../../node_modules/svix/dist/models/adobeSignConfig.js
var require_adobeSignConfig = __commonJS({
  "../../node_modules/svix/dist/models/adobeSignConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdobeSignConfigSerializer = void 0;
    exports.AdobeSignConfigSerializer = {
      _fromJsonObject(object) {
        return {
          clientId: object["clientId"]
        };
      },
      _toJsonObject(self) {
        return {
          clientId: self.clientId
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/airwallexConfig.js
var require_airwallexConfig = __commonJS({
  "../../node_modules/svix/dist/models/airwallexConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AirwallexConfigSerializer = void 0;
    exports.AirwallexConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/checkbookConfig.js
var require_checkbookConfig = __commonJS({
  "../../node_modules/svix/dist/models/checkbookConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckbookConfigSerializer = void 0;
    exports.CheckbookConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/cronConfig.js
var require_cronConfig = __commonJS({
  "../../node_modules/svix/dist/models/cronConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronConfigSerializer = void 0;
    exports.CronConfigSerializer = {
      _fromJsonObject(object) {
        return {
          contentType: object["contentType"],
          payload: object["payload"],
          schedule: object["schedule"]
        };
      },
      _toJsonObject(self) {
        return {
          contentType: self.contentType,
          payload: self.payload,
          schedule: self.schedule
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/docusignConfig.js
var require_docusignConfig = __commonJS({
  "../../node_modules/svix/dist/models/docusignConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocusignConfigSerializer = void 0;
    exports.DocusignConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/easypostConfig.js
var require_easypostConfig = __commonJS({
  "../../node_modules/svix/dist/models/easypostConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EasypostConfigSerializer = void 0;
    exports.EasypostConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/githubConfig.js
var require_githubConfig = __commonJS({
  "../../node_modules/svix/dist/models/githubConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubConfigSerializer = void 0;
    exports.GithubConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/hubspotConfig.js
var require_hubspotConfig = __commonJS({
  "../../node_modules/svix/dist/models/hubspotConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HubspotConfigSerializer = void 0;
    exports.HubspotConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/orumIoConfig.js
var require_orumIoConfig = __commonJS({
  "../../node_modules/svix/dist/models/orumIoConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OrumIoConfigSerializer = void 0;
    exports.OrumIoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/pandaDocConfig.js
var require_pandaDocConfig = __commonJS({
  "../../node_modules/svix/dist/models/pandaDocConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PandaDocConfigSerializer = void 0;
    exports.PandaDocConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/portIoConfig.js
var require_portIoConfig = __commonJS({
  "../../node_modules/svix/dist/models/portIoConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PortIoConfigSerializer = void 0;
    exports.PortIoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/rutterConfig.js
var require_rutterConfig = __commonJS({
  "../../node_modules/svix/dist/models/rutterConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RutterConfigSerializer = void 0;
    exports.RutterConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/segmentConfig.js
var require_segmentConfig = __commonJS({
  "../../node_modules/svix/dist/models/segmentConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SegmentConfigSerializer = void 0;
    exports.SegmentConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/shopifyConfig.js
var require_shopifyConfig = __commonJS({
  "../../node_modules/svix/dist/models/shopifyConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShopifyConfigSerializer = void 0;
    exports.ShopifyConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/slackConfig.js
var require_slackConfig = __commonJS({
  "../../node_modules/svix/dist/models/slackConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlackConfigSerializer = void 0;
    exports.SlackConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/stripeConfig.js
var require_stripeConfig = __commonJS({
  "../../node_modules/svix/dist/models/stripeConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StripeConfigSerializer = void 0;
    exports.StripeConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/svixConfig.js
var require_svixConfig = __commonJS({
  "../../node_modules/svix/dist/models/svixConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixConfigSerializer = void 0;
    exports.SvixConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/telnyxConfig.js
var require_telnyxConfig = __commonJS({
  "../../node_modules/svix/dist/models/telnyxConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelnyxConfigSerializer = void 0;
    exports.TelnyxConfigSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/vapiConfig.js
var require_vapiConfig = __commonJS({
  "../../node_modules/svix/dist/models/vapiConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VapiConfigSerializer = void 0;
    exports.VapiConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/veriffConfig.js
var require_veriffConfig = __commonJS({
  "../../node_modules/svix/dist/models/veriffConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VeriffConfigSerializer = void 0;
    exports.VeriffConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/zoomConfig.js
var require_zoomConfig = __commonJS({
  "../../node_modules/svix/dist/models/zoomConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZoomConfigSerializer = void 0;
    exports.ZoomConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestSourceIn.js
var require_ingestSourceIn = __commonJS({
  "../../node_modules/svix/dist/models/ingestSourceIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSourceInSerializer = void 0;
    var adobeSignConfig_1 = require_adobeSignConfig();
    var airwallexConfig_1 = require_airwallexConfig();
    var checkbookConfig_1 = require_checkbookConfig();
    var cronConfig_1 = require_cronConfig();
    var docusignConfig_1 = require_docusignConfig();
    var easypostConfig_1 = require_easypostConfig();
    var githubConfig_1 = require_githubConfig();
    var hubspotConfig_1 = require_hubspotConfig();
    var orumIoConfig_1 = require_orumIoConfig();
    var pandaDocConfig_1 = require_pandaDocConfig();
    var portIoConfig_1 = require_portIoConfig();
    var rutterConfig_1 = require_rutterConfig();
    var segmentConfig_1 = require_segmentConfig();
    var shopifyConfig_1 = require_shopifyConfig();
    var slackConfig_1 = require_slackConfig();
    var stripeConfig_1 = require_stripeConfig();
    var svixConfig_1 = require_svixConfig();
    var telnyxConfig_1 = require_telnyxConfig();
    var vapiConfig_1 = require_vapiConfig();
    var veriffConfig_1 = require_veriffConfig();
    var zoomConfig_1 = require_zoomConfig();
    exports.IngestSourceInSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "generic-webhook":
              return {};
            case "cron":
              return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
            case "adobe-sign":
              return adobeSignConfig_1.AdobeSignConfigSerializer._fromJsonObject(object["config"]);
            case "beehiiv":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "brex":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "checkbook":
              return checkbookConfig_1.CheckbookConfigSerializer._fromJsonObject(object["config"]);
            case "clerk":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "docusign":
              return docusignConfig_1.DocusignConfigSerializer._fromJsonObject(object["config"]);
            case "easypost":
              return easypostConfig_1.EasypostConfigSerializer._fromJsonObject(object["config"]);
            case "github":
              return githubConfig_1.GithubConfigSerializer._fromJsonObject(object["config"]);
            case "guesty":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "hubspot":
              return hubspotConfig_1.HubspotConfigSerializer._fromJsonObject(object["config"]);
            case "incident-io":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "lithic":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "nash":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "orum-io":
              return orumIoConfig_1.OrumIoConfigSerializer._fromJsonObject(object["config"]);
            case "panda-doc":
              return pandaDocConfig_1.PandaDocConfigSerializer._fromJsonObject(object["config"]);
            case "port-io":
              return portIoConfig_1.PortIoConfigSerializer._fromJsonObject(object["config"]);
            case "pleo":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "replicate":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "resend":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "rutter":
              return rutterConfig_1.RutterConfigSerializer._fromJsonObject(object["config"]);
            case "safebase":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "sardine":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "segment":
              return segmentConfig_1.SegmentConfigSerializer._fromJsonObject(object["config"]);
            case "shopify":
              return shopifyConfig_1.ShopifyConfigSerializer._fromJsonObject(object["config"]);
            case "slack":
              return slackConfig_1.SlackConfigSerializer._fromJsonObject(object["config"]);
            case "stripe":
              return stripeConfig_1.StripeConfigSerializer._fromJsonObject(object["config"]);
            case "stych":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "svix":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "zoom":
              return zoomConfig_1.ZoomConfigSerializer._fromJsonObject(object["config"]);
            case "telnyx":
              return telnyxConfig_1.TelnyxConfigSerializer._fromJsonObject(object["config"]);
            case "vapi":
              return vapiConfig_1.VapiConfigSerializer._fromJsonObject(object["config"]);
            case "open-ai":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "render":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "veriff":
              return veriffConfig_1.VeriffConfigSerializer._fromJsonObject(object["config"]);
            case "airwallex":
              return airwallexConfig_1.AirwallexConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "generic-webhook":
            config = {};
            break;
          case "cron":
            config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
            break;
          case "adobe-sign":
            config = adobeSignConfig_1.AdobeSignConfigSerializer._toJsonObject(self.config);
            break;
          case "beehiiv":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "brex":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "checkbook":
            config = checkbookConfig_1.CheckbookConfigSerializer._toJsonObject(self.config);
            break;
          case "clerk":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "docusign":
            config = docusignConfig_1.DocusignConfigSerializer._toJsonObject(self.config);
            break;
          case "easypost":
            config = easypostConfig_1.EasypostConfigSerializer._toJsonObject(self.config);
            break;
          case "github":
            config = githubConfig_1.GithubConfigSerializer._toJsonObject(self.config);
            break;
          case "guesty":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "hubspot":
            config = hubspotConfig_1.HubspotConfigSerializer._toJsonObject(self.config);
            break;
          case "incident-io":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "lithic":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "nash":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "orum-io":
            config = orumIoConfig_1.OrumIoConfigSerializer._toJsonObject(self.config);
            break;
          case "panda-doc":
            config = pandaDocConfig_1.PandaDocConfigSerializer._toJsonObject(self.config);
            break;
          case "port-io":
            config = portIoConfig_1.PortIoConfigSerializer._toJsonObject(self.config);
            break;
          case "pleo":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "replicate":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "resend":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "rutter":
            config = rutterConfig_1.RutterConfigSerializer._toJsonObject(self.config);
            break;
          case "safebase":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "sardine":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "segment":
            config = segmentConfig_1.SegmentConfigSerializer._toJsonObject(self.config);
            break;
          case "shopify":
            config = shopifyConfig_1.ShopifyConfigSerializer._toJsonObject(self.config);
            break;
          case "slack":
            config = slackConfig_1.SlackConfigSerializer._toJsonObject(self.config);
            break;
          case "stripe":
            config = stripeConfig_1.StripeConfigSerializer._toJsonObject(self.config);
            break;
          case "stych":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "svix":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "zoom":
            config = zoomConfig_1.ZoomConfigSerializer._toJsonObject(self.config);
            break;
          case "telnyx":
            config = telnyxConfig_1.TelnyxConfigSerializer._toJsonObject(self.config);
            break;
          case "vapi":
            config = vapiConfig_1.VapiConfigSerializer._toJsonObject(self.config);
            break;
          case "open-ai":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "render":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "veriff":
            config = veriffConfig_1.VeriffConfigSerializer._toJsonObject(self.config);
            break;
          case "airwallex":
            config = airwallexConfig_1.AirwallexConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/adobeSignConfigOut.js
var require_adobeSignConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/adobeSignConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdobeSignConfigOutSerializer = void 0;
    exports.AdobeSignConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/airwallexConfigOut.js
var require_airwallexConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/airwallexConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AirwallexConfigOutSerializer = void 0;
    exports.AirwallexConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/checkbookConfigOut.js
var require_checkbookConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/checkbookConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckbookConfigOutSerializer = void 0;
    exports.CheckbookConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/docusignConfigOut.js
var require_docusignConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/docusignConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocusignConfigOutSerializer = void 0;
    exports.DocusignConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/easypostConfigOut.js
var require_easypostConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/easypostConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EasypostConfigOutSerializer = void 0;
    exports.EasypostConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/githubConfigOut.js
var require_githubConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/githubConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubConfigOutSerializer = void 0;
    exports.GithubConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/hubspotConfigOut.js
var require_hubspotConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/hubspotConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HubspotConfigOutSerializer = void 0;
    exports.HubspotConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/orumIoConfigOut.js
var require_orumIoConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/orumIoConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OrumIoConfigOutSerializer = void 0;
    exports.OrumIoConfigOutSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/pandaDocConfigOut.js
var require_pandaDocConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/pandaDocConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PandaDocConfigOutSerializer = void 0;
    exports.PandaDocConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/portIoConfigOut.js
var require_portIoConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/portIoConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PortIoConfigOutSerializer = void 0;
    exports.PortIoConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/rutterConfigOut.js
var require_rutterConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/rutterConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RutterConfigOutSerializer = void 0;
    exports.RutterConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/segmentConfigOut.js
var require_segmentConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/segmentConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SegmentConfigOutSerializer = void 0;
    exports.SegmentConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/shopifyConfigOut.js
var require_shopifyConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/shopifyConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShopifyConfigOutSerializer = void 0;
    exports.ShopifyConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/slackConfigOut.js
var require_slackConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/slackConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlackConfigOutSerializer = void 0;
    exports.SlackConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/stripeConfigOut.js
var require_stripeConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/stripeConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StripeConfigOutSerializer = void 0;
    exports.StripeConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/svixConfigOut.js
var require_svixConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/svixConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SvixConfigOutSerializer = void 0;
    exports.SvixConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/telnyxConfigOut.js
var require_telnyxConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/telnyxConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelnyxConfigOutSerializer = void 0;
    exports.TelnyxConfigOutSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/vapiConfigOut.js
var require_vapiConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/vapiConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VapiConfigOutSerializer = void 0;
    exports.VapiConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/veriffConfigOut.js
var require_veriffConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/veriffConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VeriffConfigOutSerializer = void 0;
    exports.VeriffConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/zoomConfigOut.js
var require_zoomConfigOut = __commonJS({
  "../../node_modules/svix/dist/models/zoomConfigOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ZoomConfigOutSerializer = void 0;
    exports.ZoomConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ingestSourceOut.js
var require_ingestSourceOut = __commonJS({
  "../../node_modules/svix/dist/models/ingestSourceOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSourceOutSerializer = void 0;
    var adobeSignConfigOut_1 = require_adobeSignConfigOut();
    var airwallexConfigOut_1 = require_airwallexConfigOut();
    var checkbookConfigOut_1 = require_checkbookConfigOut();
    var cronConfig_1 = require_cronConfig();
    var docusignConfigOut_1 = require_docusignConfigOut();
    var easypostConfigOut_1 = require_easypostConfigOut();
    var githubConfigOut_1 = require_githubConfigOut();
    var hubspotConfigOut_1 = require_hubspotConfigOut();
    var orumIoConfigOut_1 = require_orumIoConfigOut();
    var pandaDocConfigOut_1 = require_pandaDocConfigOut();
    var portIoConfigOut_1 = require_portIoConfigOut();
    var rutterConfigOut_1 = require_rutterConfigOut();
    var segmentConfigOut_1 = require_segmentConfigOut();
    var shopifyConfigOut_1 = require_shopifyConfigOut();
    var slackConfigOut_1 = require_slackConfigOut();
    var stripeConfigOut_1 = require_stripeConfigOut();
    var svixConfigOut_1 = require_svixConfigOut();
    var telnyxConfigOut_1 = require_telnyxConfigOut();
    var vapiConfigOut_1 = require_vapiConfigOut();
    var veriffConfigOut_1 = require_veriffConfigOut();
    var zoomConfigOut_1 = require_zoomConfigOut();
    exports.IngestSourceOutSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "generic-webhook":
              return {};
            case "cron":
              return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
            case "adobe-sign":
              return adobeSignConfigOut_1.AdobeSignConfigOutSerializer._fromJsonObject(object["config"]);
            case "beehiiv":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "brex":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "checkbook":
              return checkbookConfigOut_1.CheckbookConfigOutSerializer._fromJsonObject(object["config"]);
            case "clerk":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "docusign":
              return docusignConfigOut_1.DocusignConfigOutSerializer._fromJsonObject(object["config"]);
            case "easypost":
              return easypostConfigOut_1.EasypostConfigOutSerializer._fromJsonObject(object["config"]);
            case "github":
              return githubConfigOut_1.GithubConfigOutSerializer._fromJsonObject(object["config"]);
            case "guesty":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "hubspot":
              return hubspotConfigOut_1.HubspotConfigOutSerializer._fromJsonObject(object["config"]);
            case "incident-io":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "lithic":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "nash":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "orum-io":
              return orumIoConfigOut_1.OrumIoConfigOutSerializer._fromJsonObject(object["config"]);
            case "panda-doc":
              return pandaDocConfigOut_1.PandaDocConfigOutSerializer._fromJsonObject(object["config"]);
            case "port-io":
              return portIoConfigOut_1.PortIoConfigOutSerializer._fromJsonObject(object["config"]);
            case "pleo":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "replicate":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "resend":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "rutter":
              return rutterConfigOut_1.RutterConfigOutSerializer._fromJsonObject(object["config"]);
            case "safebase":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "sardine":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "segment":
              return segmentConfigOut_1.SegmentConfigOutSerializer._fromJsonObject(object["config"]);
            case "shopify":
              return shopifyConfigOut_1.ShopifyConfigOutSerializer._fromJsonObject(object["config"]);
            case "slack":
              return slackConfigOut_1.SlackConfigOutSerializer._fromJsonObject(object["config"]);
            case "stripe":
              return stripeConfigOut_1.StripeConfigOutSerializer._fromJsonObject(object["config"]);
            case "stych":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "svix":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "zoom":
              return zoomConfigOut_1.ZoomConfigOutSerializer._fromJsonObject(object["config"]);
            case "telnyx":
              return telnyxConfigOut_1.TelnyxConfigOutSerializer._fromJsonObject(object["config"]);
            case "vapi":
              return vapiConfigOut_1.VapiConfigOutSerializer._fromJsonObject(object["config"]);
            case "open-ai":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "render":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "veriff":
              return veriffConfigOut_1.VeriffConfigOutSerializer._fromJsonObject(object["config"]);
            case "airwallex":
              return airwallexConfigOut_1.AirwallexConfigOutSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          ingestUrl: object["ingestUrl"],
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "generic-webhook":
            config = {};
            break;
          case "cron":
            config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
            break;
          case "adobe-sign":
            config = adobeSignConfigOut_1.AdobeSignConfigOutSerializer._toJsonObject(self.config);
            break;
          case "beehiiv":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "brex":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "checkbook":
            config = checkbookConfigOut_1.CheckbookConfigOutSerializer._toJsonObject(self.config);
            break;
          case "clerk":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "docusign":
            config = docusignConfigOut_1.DocusignConfigOutSerializer._toJsonObject(self.config);
            break;
          case "easypost":
            config = easypostConfigOut_1.EasypostConfigOutSerializer._toJsonObject(self.config);
            break;
          case "github":
            config = githubConfigOut_1.GithubConfigOutSerializer._toJsonObject(self.config);
            break;
          case "guesty":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "hubspot":
            config = hubspotConfigOut_1.HubspotConfigOutSerializer._toJsonObject(self.config);
            break;
          case "incident-io":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "lithic":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "nash":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "orum-io":
            config = orumIoConfigOut_1.OrumIoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "panda-doc":
            config = pandaDocConfigOut_1.PandaDocConfigOutSerializer._toJsonObject(self.config);
            break;
          case "port-io":
            config = portIoConfigOut_1.PortIoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "pleo":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "replicate":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "resend":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "rutter":
            config = rutterConfigOut_1.RutterConfigOutSerializer._toJsonObject(self.config);
            break;
          case "safebase":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "sardine":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "segment":
            config = segmentConfigOut_1.SegmentConfigOutSerializer._toJsonObject(self.config);
            break;
          case "shopify":
            config = shopifyConfigOut_1.ShopifyConfigOutSerializer._toJsonObject(self.config);
            break;
          case "slack":
            config = slackConfigOut_1.SlackConfigOutSerializer._toJsonObject(self.config);
            break;
          case "stripe":
            config = stripeConfigOut_1.StripeConfigOutSerializer._toJsonObject(self.config);
            break;
          case "stych":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "svix":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "zoom":
            config = zoomConfigOut_1.ZoomConfigOutSerializer._toJsonObject(self.config);
            break;
          case "telnyx":
            config = telnyxConfigOut_1.TelnyxConfigOutSerializer._toJsonObject(self.config);
            break;
          case "vapi":
            config = vapiConfigOut_1.VapiConfigOutSerializer._toJsonObject(self.config);
            break;
          case "open-ai":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "render":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "veriff":
            config = veriffConfigOut_1.VeriffConfigOutSerializer._toJsonObject(self.config);
            break;
          case "airwallex":
            config = airwallexConfigOut_1.AirwallexConfigOutSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          createdAt: self.createdAt,
          id: self.id,
          ingestUrl: self.ingestUrl,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseIngestSourceOut.js
var require_listResponseIngestSourceOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseIngestSourceOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseIngestSourceOutSerializer = void 0;
    var ingestSourceOut_1 = require_ingestSourceOut();
    exports.ListResponseIngestSourceOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => ingestSourceOut_1.IngestSourceOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/rotateTokenOut.js
var require_rotateTokenOut = __commonJS({
  "../../node_modules/svix/dist/models/rotateTokenOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RotateTokenOutSerializer = void 0;
    exports.RotateTokenOutSerializer = {
      _fromJsonObject(object) {
        return {
          ingestUrl: object["ingestUrl"]
        };
      },
      _toJsonObject(self) {
        return {
          ingestUrl: self.ingestUrl
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/ingestSource.js
var require_ingestSource = __commonJS({
  "../../node_modules/svix/dist/api/ingestSource.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IngestSource = void 0;
    var ingestSourceIn_1 = require_ingestSourceIn();
    var ingestSourceOut_1 = require_ingestSourceOut();
    var listResponseIngestSourceOut_1 = require_listResponseIngestSourceOut();
    var rotateTokenOut_1 = require_rotateTokenOut();
    var request_1 = require_request();
    var IngestSource = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseIngestSourceOut_1.ListResponseIngestSourceOutSerializer._fromJsonObject);
      }
      create(ingestSourceIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn));
        return request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
      }
      get(sourceId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}");
        request.setPathParam("source_id", sourceId);
        return request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
      }
      update(sourceId, ingestSourceIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}");
        request.setPathParam("source_id", sourceId);
        request.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn));
        return request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
      }
      delete(sourceId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}");
        request.setPathParam("source_id", sourceId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      rotateToken(sourceId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/token/rotate");
        request.setPathParam("source_id", sourceId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, rotateTokenOut_1.RotateTokenOutSerializer._fromJsonObject);
      }
    };
    exports.IngestSource = IngestSource;
  }
});

// ../../node_modules/svix/dist/api/ingest.js
var require_ingest = __commonJS({
  "../../node_modules/svix/dist/api/ingest.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Ingest = void 0;
    var dashboardAccessOut_1 = require_dashboardAccessOut();
    var ingestSourceConsumerPortalAccessIn_1 = require_ingestSourceConsumerPortalAccessIn();
    var ingestEndpoint_1 = require_ingestEndpoint();
    var ingestSource_1 = require_ingestSource();
    var request_1 = require_request();
    var Ingest = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get endpoint() {
        return new ingestEndpoint_1.IngestEndpoint(this.requestCtx);
      }
      get source() {
        return new ingestSource_1.IngestSource(this.requestCtx);
      }
      dashboard(sourceId, ingestSourceConsumerPortalAccessIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/dashboard");
        request.setPathParam("source_id", sourceId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestSourceConsumerPortalAccessIn_1.IngestSourceConsumerPortalAccessInSerializer._toJsonObject(ingestSourceConsumerPortalAccessIn));
        return request.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
      }
    };
    exports.Ingest = Ingest;
  }
});

// ../../node_modules/svix/dist/models/integrationIn.js
var require_integrationIn = __commonJS({
  "../../node_modules/svix/dist/models/integrationIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationInSerializer = void 0;
    exports.IntegrationInSerializer = {
      _fromJsonObject(object) {
        return {
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/integrationKeyOut.js
var require_integrationKeyOut = __commonJS({
  "../../node_modules/svix/dist/models/integrationKeyOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationKeyOutSerializer = void 0;
    exports.IntegrationKeyOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/integrationOut.js
var require_integrationOut = __commonJS({
  "../../node_modules/svix/dist/models/integrationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationOutSerializer = void 0;
    exports.IntegrationOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          featureFlags: object["featureFlags"],
          id: object["id"],
          name: object["name"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          featureFlags: self.featureFlags,
          id: self.id,
          name: self.name,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/integrationUpdate.js
var require_integrationUpdate = __commonJS({
  "../../node_modules/svix/dist/models/integrationUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrationUpdateSerializer = void 0;
    exports.IntegrationUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseIntegrationOut.js
var require_listResponseIntegrationOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseIntegrationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseIntegrationOutSerializer = void 0;
    var integrationOut_1 = require_integrationOut();
    exports.ListResponseIntegrationOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => integrationOut_1.IntegrationOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => integrationOut_1.IntegrationOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/integration.js
var require_integration = __commonJS({
  "../../node_modules/svix/dist/api/integration.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Integration = void 0;
    var integrationIn_1 = require_integrationIn();
    var integrationKeyOut_1 = require_integrationKeyOut();
    var integrationOut_1 = require_integrationOut();
    var integrationUpdate_1 = require_integrationUpdate();
    var listResponseIntegrationOut_1 = require_listResponseIntegrationOut();
    var request_1 = require_request();
    var Integration = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseIntegrationOut_1.ListResponseIntegrationOutSerializer._fromJsonObject);
      }
      create(appId, integrationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(integrationIn_1.IntegrationInSerializer._toJsonObject(integrationIn));
        return request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
      }
      get(appId, integId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        return request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
      }
      update(appId, integId, integrationUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/integration/{integ_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        request.setBody(integrationUpdate_1.IntegrationUpdateSerializer._toJsonObject(integrationUpdate));
        return request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
      }
      delete(appId, integId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/integration/{integ_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      getKey(appId, integId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}/key");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        return request.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
      }
      rotateKey(appId, integId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration/{integ_id}/key/rotate");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
      }
    };
    exports.Integration = Integration;
  }
});

// ../../node_modules/svix/dist/models/expungeAllContentsOut.js
var require_expungeAllContentsOut = __commonJS({
  "../../node_modules/svix/dist/models/expungeAllContentsOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExpungeAllContentsOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.ExpungeAllContentsOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseMessageOut.js
var require_listResponseMessageOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseMessageOutSerializer = void 0;
    var messageOut_1 = require_messageOut();
    exports.ListResponseMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageOut_1.MessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageOut_1.MessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/pollingEndpointConsumerSeekIn.js
var require_pollingEndpointConsumerSeekIn = __commonJS({
  "../../node_modules/svix/dist/models/pollingEndpointConsumerSeekIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointConsumerSeekInSerializer = void 0;
    exports.PollingEndpointConsumerSeekInSerializer = {
      _fromJsonObject(object) {
        return {
          after: new Date(object["after"])
        };
      },
      _toJsonObject(self) {
        return {
          after: self.after
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/pollingEndpointConsumerSeekOut.js
var require_pollingEndpointConsumerSeekOut = __commonJS({
  "../../node_modules/svix/dist/models/pollingEndpointConsumerSeekOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointConsumerSeekOutSerializer = void 0;
    exports.PollingEndpointConsumerSeekOutSerializer = {
      _fromJsonObject(object) {
        return {
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          iterator: self.iterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/pollingEndpointMessageOut.js
var require_pollingEndpointMessageOut = __commonJS({
  "../../node_modules/svix/dist/models/pollingEndpointMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointMessageOutSerializer = void 0;
    exports.PollingEndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          headers: object["headers"],
          id: object["id"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          headers: self.headers,
          id: self.id,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/pollingEndpointOut.js
var require_pollingEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/pollingEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PollingEndpointOutSerializer = void 0;
    var pollingEndpointMessageOut_1 = require_pollingEndpointMessageOut();
    exports.PollingEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/messagePoller.js
var require_messagePoller = __commonJS({
  "../../node_modules/svix/dist/api/messagePoller.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessagePoller = void 0;
    var pollingEndpointConsumerSeekIn_1 = require_pollingEndpointConsumerSeekIn();
    var pollingEndpointConsumerSeekOut_1 = require_pollingEndpointConsumerSeekOut();
    var pollingEndpointOut_1 = require_pollingEndpointOut();
    var request_1 = require_request();
    var MessagePoller = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      poll(appId, sinkId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("sink_id", sinkId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          event_type: options === null || options === void 0 ? void 0 : options.eventType,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          after: options === null || options === void 0 ? void 0 : options.after
        });
        return request.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
      }
      consumerPoll(appId, sinkId, consumerId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("sink_id", sinkId);
        request.setPathParam("consumer_id", consumerId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator
        });
        return request.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
      }
      consumerSeek(appId, sinkId, consumerId, pollingEndpointConsumerSeekIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}/seek");
        request.setPathParam("app_id", appId);
        request.setPathParam("sink_id", sinkId);
        request.setPathParam("consumer_id", consumerId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(pollingEndpointConsumerSeekIn_1.PollingEndpointConsumerSeekInSerializer._toJsonObject(pollingEndpointConsumerSeekIn));
        return request.send(this.requestCtx, pollingEndpointConsumerSeekOut_1.PollingEndpointConsumerSeekOutSerializer._fromJsonObject);
      }
    };
    exports.MessagePoller = MessagePoller;
  }
});

// ../../node_modules/svix/dist/models/messageIn.js
var require_messageIn = __commonJS({
  "../../node_modules/svix/dist/models/messageIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageInSerializer = void 0;
    var applicationIn_1 = require_applicationIn();
    exports.MessageInSerializer = {
      _fromJsonObject(object) {
        return {
          application: object["application"] ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          payload: object["payload"],
          payloadRetentionHours: object["payloadRetentionHours"],
          payloadRetentionPeriod: object["payloadRetentionPeriod"],
          tags: object["tags"],
          transformationsParams: object["transformationsParams"]
        };
      },
      _toJsonObject(self) {
        return {
          application: self.application ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          payload: self.payload,
          payloadRetentionHours: self.payloadRetentionHours,
          payloadRetentionPeriod: self.payloadRetentionPeriod,
          tags: self.tags,
          transformationsParams: self.transformationsParams
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/message.js
var require_message = __commonJS({
  "../../node_modules/svix/dist/api/message.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.messageInRaw = exports.Message = void 0;
    var expungeAllContentsOut_1 = require_expungeAllContentsOut();
    var listResponseMessageOut_1 = require_listResponseMessageOut();
    var messageOut_1 = require_messageOut();
    var messagePoller_1 = require_messagePoller();
    var request_1 = require_request();
    var messageIn_1 = require_messageIn();
    var Message = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get poller() {
        return new messagePoller_1.MessagePoller(this.requestCtx);
      }
      list(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseMessageOut_1.ListResponseMessageOutSerializer._fromJsonObject);
      }
      create(appId, messageIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          with_content: options === null || options === void 0 ? void 0 : options.withContent
        });
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(messageIn_1.MessageInSerializer._toJsonObject(messageIn));
        return request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
      }
      expungeAllContents(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/expunge-all-contents");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, expungeAllContentsOut_1.ExpungeAllContentsOutSerializer._fromJsonObject);
      }
      get(appId, msgId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setQueryParams({
          with_content: options === null || options === void 0 ? void 0 : options.withContent
        });
        return request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
      }
      expungeContent(appId, msgId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/content");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports.Message = Message;
    function messageInRaw(eventType, payload, contentType) {
      const headers = contentType ? { "content-type": contentType } : void 0;
      return {
        eventType,
        payload: {},
        transformationsParams: {
          rawPayload: payload,
          headers
        }
      };
    }
    exports.messageInRaw = messageInRaw;
  }
});

// ../../node_modules/svix/dist/models/emptyResponse.js
var require_emptyResponse = __commonJS({
  "../../node_modules/svix/dist/models/emptyResponse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmptyResponseSerializer = void 0;
    exports.EmptyResponseSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/messageStatus.js
var require_messageStatus = __commonJS({
  "../../node_modules/svix/dist/models/messageStatus.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageStatusSerializer = exports.MessageStatus = void 0;
    var MessageStatus;
    (function(MessageStatus2) {
      MessageStatus2[MessageStatus2["Success"] = 0] = "Success";
      MessageStatus2[MessageStatus2["Pending"] = 1] = "Pending";
      MessageStatus2[MessageStatus2["Fail"] = 2] = "Fail";
      MessageStatus2[MessageStatus2["Sending"] = 3] = "Sending";
    })(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
    exports.MessageStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/messageStatusText.js
var require_messageStatusText = __commonJS({
  "../../node_modules/svix/dist/models/messageStatusText.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageStatusTextSerializer = exports.MessageStatusText = void 0;
    var MessageStatusText;
    (function(MessageStatusText2) {
      MessageStatusText2["Success"] = "success";
      MessageStatusText2["Pending"] = "pending";
      MessageStatusText2["Fail"] = "fail";
      MessageStatusText2["Sending"] = "sending";
    })(MessageStatusText = exports.MessageStatusText || (exports.MessageStatusText = {}));
    exports.MessageStatusTextSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/endpointMessageOut.js
var require_endpointMessageOut = __commonJS({
  "../../node_modules/svix/dist/models/endpointMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointMessageOutSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports.EndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          id: object["id"],
          nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
          payload: object["payload"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          id: self.id,
          nextAttempt: self.nextAttempt,
          payload: self.payload,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseEndpointMessageOut.js
var require_listResponseEndpointMessageOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseEndpointMessageOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseEndpointMessageOutSerializer = void 0;
    var endpointMessageOut_1 = require_endpointMessageOut();
    exports.ListResponseEndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/messageAttemptTriggerType.js
var require_messageAttemptTriggerType = __commonJS({
  "../../node_modules/svix/dist/models/messageAttemptTriggerType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageAttemptTriggerTypeSerializer = exports.MessageAttemptTriggerType = void 0;
    var MessageAttemptTriggerType;
    (function(MessageAttemptTriggerType2) {
      MessageAttemptTriggerType2[MessageAttemptTriggerType2["Scheduled"] = 0] = "Scheduled";
      MessageAttemptTriggerType2[MessageAttemptTriggerType2["Manual"] = 1] = "Manual";
    })(MessageAttemptTriggerType = exports.MessageAttemptTriggerType || (exports.MessageAttemptTriggerType = {}));
    exports.MessageAttemptTriggerTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/messageAttemptOut.js
var require_messageAttemptOut = __commonJS({
  "../../node_modules/svix/dist/models/messageAttemptOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageAttemptOutSerializer = void 0;
    var messageAttemptTriggerType_1 = require_messageAttemptTriggerType();
    var messageOut_1 = require_messageOut();
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports.MessageAttemptOutSerializer = {
      _fromJsonObject(object) {
        return {
          endpointId: object["endpointId"],
          id: object["id"],
          msg: object["msg"] ? messageOut_1.MessageOutSerializer._fromJsonObject(object["msg"]) : void 0,
          msgId: object["msgId"],
          response: object["response"],
          responseDurationMs: object["responseDurationMs"],
          responseStatusCode: object["responseStatusCode"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          timestamp: new Date(object["timestamp"]),
          triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._fromJsonObject(object["triggerType"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          endpointId: self.endpointId,
          id: self.id,
          msg: self.msg ? messageOut_1.MessageOutSerializer._toJsonObject(self.msg) : void 0,
          msgId: self.msgId,
          response: self.response,
          responseDurationMs: self.responseDurationMs,
          responseStatusCode: self.responseStatusCode,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          timestamp: self.timestamp,
          triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._toJsonObject(self.triggerType),
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseMessageAttemptOut.js
var require_listResponseMessageAttemptOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseMessageAttemptOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseMessageAttemptOutSerializer = void 0;
    var messageAttemptOut_1 = require_messageAttemptOut();
    exports.ListResponseMessageAttemptOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/messageEndpointOut.js
var require_messageEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/messageEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageEndpointOutSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports.MessageEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
          rateLimit: object["rateLimit"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          nextAttempt: self.nextAttempt,
          rateLimit: self.rateLimit,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseMessageEndpointOut.js
var require_listResponseMessageEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseMessageEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseMessageEndpointOutSerializer = void 0;
    var messageEndpointOut_1 = require_messageEndpointOut();
    exports.ListResponseMessageEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/messageAttempt.js
var require_messageAttempt = __commonJS({
  "../../node_modules/svix/dist/api/messageAttempt.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MessageAttempt = void 0;
    var emptyResponse_1 = require_emptyResponse();
    var listResponseEndpointMessageOut_1 = require_listResponseEndpointMessageOut();
    var listResponseMessageAttemptOut_1 = require_listResponseMessageAttemptOut();
    var listResponseMessageEndpointOut_1 = require_listResponseMessageEndpointOut();
    var messageAttemptOut_1 = require_messageAttemptOut();
    var request_1 = require_request();
    var MessageAttempt = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      listByEndpoint(appId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          status: options === null || options === void 0 ? void 0 : options.status,
          status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          with_msg: options === null || options === void 0 ? void 0 : options.withMsg,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
      }
      listByMsg(appId, msgId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/msg/{msg_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          status: options === null || options === void 0 ? void 0 : options.status,
          status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          endpoint_id: options === null || options === void 0 ? void 0 : options.endpointId,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
      }
      listAttemptedMessages(appId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/msg");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          status: options === null || options === void 0 ? void 0 : options.status,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseEndpointMessageOut_1.ListResponseEndpointMessageOutSerializer._fromJsonObject);
      }
      get(appId, msgId, attemptId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setPathParam("attempt_id", attemptId);
        return request.send(this.requestCtx, messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject);
      }
      expungeContent(appId, msgId, attemptId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}/content");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setPathParam("attempt_id", attemptId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      listAttemptedDestinations(appId, msgId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator
        });
        return request.send(this.requestCtx, listResponseMessageEndpointOut_1.ListResponseMessageEndpointOutSerializer._fromJsonObject);
      }
      resend(appId, msgId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint/{endpoint_id}/resend");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
      }
    };
    exports.MessageAttempt = MessageAttempt;
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointOut.js
var require_operationalWebhookEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointOutSerializer = void 0;
    exports.OperationalWebhookEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseOperationalWebhookEndpointOut.js
var require_listResponseOperationalWebhookEndpointOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseOperationalWebhookEndpointOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseOperationalWebhookEndpointOutSerializer = void 0;
    var operationalWebhookEndpointOut_1 = require_operationalWebhookEndpointOut();
    exports.ListResponseOperationalWebhookEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointHeadersIn.js
var require_operationalWebhookEndpointHeadersIn = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointHeadersIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointHeadersInSerializer = void 0;
    exports.OperationalWebhookEndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointHeadersOut.js
var require_operationalWebhookEndpointHeadersOut = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointHeadersOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointHeadersOutSerializer = void 0;
    exports.OperationalWebhookEndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointIn.js
var require_operationalWebhookEndpointIn = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointInSerializer = void 0;
    exports.OperationalWebhookEndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointSecretIn.js
var require_operationalWebhookEndpointSecretIn = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointSecretIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointSecretInSerializer = void 0;
    exports.OperationalWebhookEndpointSecretInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointSecretOut.js
var require_operationalWebhookEndpointSecretOut = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointSecretOutSerializer = void 0;
    exports.OperationalWebhookEndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/operationalWebhookEndpointUpdate.js
var require_operationalWebhookEndpointUpdate = __commonJS({
  "../../node_modules/svix/dist/models/operationalWebhookEndpointUpdate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpointUpdateSerializer = void 0;
    exports.OperationalWebhookEndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/operationalWebhookEndpoint.js
var require_operationalWebhookEndpoint = __commonJS({
  "../../node_modules/svix/dist/api/operationalWebhookEndpoint.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhookEndpoint = void 0;
    var listResponseOperationalWebhookEndpointOut_1 = require_listResponseOperationalWebhookEndpointOut();
    var operationalWebhookEndpointHeadersIn_1 = require_operationalWebhookEndpointHeadersIn();
    var operationalWebhookEndpointHeadersOut_1 = require_operationalWebhookEndpointHeadersOut();
    var operationalWebhookEndpointIn_1 = require_operationalWebhookEndpointIn();
    var operationalWebhookEndpointOut_1 = require_operationalWebhookEndpointOut();
    var operationalWebhookEndpointSecretIn_1 = require_operationalWebhookEndpointSecretIn();
    var operationalWebhookEndpointSecretOut_1 = require_operationalWebhookEndpointSecretOut();
    var operationalWebhookEndpointUpdate_1 = require_operationalWebhookEndpointUpdate();
    var request_1 = require_request();
    var OperationalWebhookEndpoint = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseOperationalWebhookEndpointOut_1.ListResponseOperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      create(operationalWebhookEndpointIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(operationalWebhookEndpointIn_1.OperationalWebhookEndpointInSerializer._toJsonObject(operationalWebhookEndpointIn));
        return request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      get(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      update(endpointId, operationalWebhookEndpointUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(operationalWebhookEndpointUpdate_1.OperationalWebhookEndpointUpdateSerializer._toJsonObject(operationalWebhookEndpointUpdate));
        return request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      delete(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
        request.setPathParam("endpoint_id", endpointId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      getHeaders(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, operationalWebhookEndpointHeadersOut_1.OperationalWebhookEndpointHeadersOutSerializer._fromJsonObject);
      }
      updateHeaders(endpointId, operationalWebhookEndpointHeadersIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(operationalWebhookEndpointHeadersIn_1.OperationalWebhookEndpointHeadersInSerializer._toJsonObject(operationalWebhookEndpointHeadersIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      getSecret(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret");
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, operationalWebhookEndpointSecretOut_1.OperationalWebhookEndpointSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(endpointId, operationalWebhookEndpointSecretIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret/rotate");
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(operationalWebhookEndpointSecretIn_1.OperationalWebhookEndpointSecretInSerializer._toJsonObject(operationalWebhookEndpointSecretIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports.OperationalWebhookEndpoint = OperationalWebhookEndpoint;
  }
});

// ../../node_modules/svix/dist/api/operationalWebhook.js
var require_operationalWebhook = __commonJS({
  "../../node_modules/svix/dist/api/operationalWebhook.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OperationalWebhook = void 0;
    var operationalWebhookEndpoint_1 = require_operationalWebhookEndpoint();
    var OperationalWebhook = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get endpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    };
    exports.OperationalWebhook = OperationalWebhook;
  }
});

// ../../node_modules/svix/dist/models/aggregateEventTypesOut.js
var require_aggregateEventTypesOut = __commonJS({
  "../../node_modules/svix/dist/models/aggregateEventTypesOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AggregateEventTypesOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.AggregateEventTypesOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/appUsageStatsIn.js
var require_appUsageStatsIn = __commonJS({
  "../../node_modules/svix/dist/models/appUsageStatsIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppUsageStatsInSerializer = void 0;
    exports.AppUsageStatsInSerializer = {
      _fromJsonObject(object) {
        return {
          appIds: object["appIds"],
          since: new Date(object["since"]),
          until: new Date(object["until"])
        };
      },
      _toJsonObject(self) {
        return {
          appIds: self.appIds,
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/appUsageStatsOut.js
var require_appUsageStatsOut = __commonJS({
  "../../node_modules/svix/dist/models/appUsageStatsOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppUsageStatsOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports.AppUsageStatsOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          unresolvedAppIds: object["unresolvedAppIds"]
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          unresolvedAppIds: self.unresolvedAppIds
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/statistics.js
var require_statistics = __commonJS({
  "../../node_modules/svix/dist/api/statistics.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Statistics = void 0;
    var aggregateEventTypesOut_1 = require_aggregateEventTypesOut();
    var appUsageStatsIn_1 = require_appUsageStatsIn();
    var appUsageStatsOut_1 = require_appUsageStatsOut();
    var request_1 = require_request();
    var Statistics = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      aggregateAppStats(appUsageStatsIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stats/usage/app");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(appUsageStatsIn_1.AppUsageStatsInSerializer._toJsonObject(appUsageStatsIn));
        return request.send(this.requestCtx, appUsageStatsOut_1.AppUsageStatsOutSerializer._fromJsonObject);
      }
      aggregateEventTypes() {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stats/usage/event-types");
        return request.send(this.requestCtx, aggregateEventTypesOut_1.AggregateEventTypesOutSerializer._fromJsonObject);
      }
    };
    exports.Statistics = Statistics;
  }
});

// ../../node_modules/svix/dist/models/httpSinkHeadersPatchIn.js
var require_httpSinkHeadersPatchIn = __commonJS({
  "../../node_modules/svix/dist/models/httpSinkHeadersPatchIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpSinkHeadersPatchInSerializer = void 0;
    exports.HttpSinkHeadersPatchInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkTransformationOut.js
var require_sinkTransformationOut = __commonJS({
  "../../node_modules/svix/dist/models/sinkTransformationOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkTransformationOutSerializer = void 0;
    exports.SinkTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamEventTypeOut.js
var require_streamEventTypeOut = __commonJS({
  "../../node_modules/svix/dist/models/streamEventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamEventTypeOutSerializer = void 0;
    exports.StreamEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          createdAt: new Date(object["createdAt"]),
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          createdAt: self.createdAt,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseStreamEventTypeOut.js
var require_listResponseStreamEventTypeOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseStreamEventTypeOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseStreamEventTypeOutSerializer = void 0;
    var streamEventTypeOut_1 = require_streamEventTypeOut();
    exports.ListResponseStreamEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamEventTypeIn.js
var require_streamEventTypeIn = __commonJS({
  "../../node_modules/svix/dist/models/streamEventTypeIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamEventTypeInSerializer = void 0;
    exports.StreamEventTypeInSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamEventTypePatch.js
var require_streamEventTypePatch = __commonJS({
  "../../node_modules/svix/dist/models/streamEventTypePatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamEventTypePatchSerializer = void 0;
    exports.StreamEventTypePatchSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/streamingEventType.js
var require_streamingEventType = __commonJS({
  "../../node_modules/svix/dist/api/streamingEventType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingEventType = void 0;
    var listResponseStreamEventTypeOut_1 = require_listResponseStreamEventTypeOut();
    var streamEventTypeIn_1 = require_streamEventTypeIn();
    var streamEventTypeOut_1 = require_streamEventTypeOut();
    var streamEventTypePatch_1 = require_streamEventTypePatch();
    var request_1 = require_request();
    var StreamingEventType = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order,
          include_archived: options === null || options === void 0 ? void 0 : options.includeArchived
        });
        return request.send(this.requestCtx, listResponseStreamEventTypeOut_1.ListResponseStreamEventTypeOutSerializer._fromJsonObject);
      }
      create(streamEventTypeIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/event-type");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
      get(name) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
      update(name, streamEventTypeIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        request.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
      delete(name, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        request.setQueryParams({
          expunge: options === null || options === void 0 ? void 0 : options.expunge
        });
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(name, streamEventTypePatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        request.setBody(streamEventTypePatch_1.StreamEventTypePatchSerializer._toJsonObject(streamEventTypePatch));
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
    };
    exports.StreamingEventType = StreamingEventType;
  }
});

// ../../node_modules/svix/dist/models/eventIn.js
var require_eventIn = __commonJS({
  "../../node_modules/svix/dist/models/eventIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventInSerializer = void 0;
    exports.EventInSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          payload: object["payload"]
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          payload: self.payload
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamIn.js
var require_streamIn = __commonJS({
  "../../node_modules/svix/dist/models/streamIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamInSerializer = void 0;
    exports.StreamInSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/createStreamEventsIn.js
var require_createStreamEventsIn = __commonJS({
  "../../node_modules/svix/dist/models/createStreamEventsIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreateStreamEventsInSerializer = void 0;
    var eventIn_1 = require_eventIn();
    var streamIn_1 = require_streamIn();
    exports.CreateStreamEventsInSerializer = {
      _fromJsonObject(object) {
        return {
          events: object["events"].map((item) => eventIn_1.EventInSerializer._fromJsonObject(item)),
          stream: object["stream"] ? streamIn_1.StreamInSerializer._fromJsonObject(object["stream"]) : void 0
        };
      },
      _toJsonObject(self) {
        return {
          events: self.events.map((item) => eventIn_1.EventInSerializer._toJsonObject(item)),
          stream: self.stream ? streamIn_1.StreamInSerializer._toJsonObject(self.stream) : void 0
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/createStreamEventsOut.js
var require_createStreamEventsOut = __commonJS({
  "../../node_modules/svix/dist/models/createStreamEventsOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreateStreamEventsOutSerializer = void 0;
    exports.CreateStreamEventsOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventOut.js
var require_eventOut = __commonJS({
  "../../node_modules/svix/dist/models/eventOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventOutSerializer = void 0;
    exports.EventOutSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          payload: object["payload"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          payload: self.payload,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/eventStreamOut.js
var require_eventStreamOut = __commonJS({
  "../../node_modules/svix/dist/models/eventStreamOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventStreamOutSerializer = void 0;
    var eventOut_1 = require_eventOut();
    exports.EventStreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => eventOut_1.EventOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => eventOut_1.EventOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/streamingEvents.js
var require_streamingEvents = __commonJS({
  "../../node_modules/svix/dist/api/streamingEvents.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingEvents = void 0;
    var createStreamEventsIn_1 = require_createStreamEventsIn();
    var createStreamEventsOut_1 = require_createStreamEventsOut();
    var eventStreamOut_1 = require_eventStreamOut();
    var request_1 = require_request();
    var StreamingEvents = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      create(streamId, createStreamEventsIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/events");
        request.setPathParam("stream_id", streamId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(createStreamEventsIn_1.CreateStreamEventsInSerializer._toJsonObject(createStreamEventsIn));
        return request.send(this.requestCtx, createStreamEventsOut_1.CreateStreamEventsOutSerializer._fromJsonObject);
      }
      get(streamId, sinkId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/events");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          after: options === null || options === void 0 ? void 0 : options.after
        });
        return request.send(this.requestCtx, eventStreamOut_1.EventStreamOutSerializer._fromJsonObject);
      }
    };
    exports.StreamingEvents = StreamingEvents;
  }
});

// ../../node_modules/svix/dist/models/azureBlobStorageConfig.js
var require_azureBlobStorageConfig = __commonJS({
  "../../node_modules/svix/dist/models/azureBlobStorageConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AzureBlobStorageConfigSerializer = void 0;
    exports.AzureBlobStorageConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKey: object["accessKey"],
          account: object["account"],
          container: object["container"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKey: self.accessKey,
          account: self.account,
          container: self.container
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/googleCloudStorageConfig.js
var require_googleCloudStorageConfig = __commonJS({
  "../../node_modules/svix/dist/models/googleCloudStorageConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleCloudStorageConfigSerializer = void 0;
    exports.GoogleCloudStorageConfigSerializer = {
      _fromJsonObject(object) {
        return {
          bucket: object["bucket"],
          credentials: object["credentials"]
        };
      },
      _toJsonObject(self) {
        return {
          bucket: self.bucket,
          credentials: self.credentials
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/s3Config.js
var require_s3Config = __commonJS({
  "../../node_modules/svix/dist/models/s3Config.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.S3ConfigSerializer = void 0;
    exports.S3ConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          bucket: object["bucket"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          bucket: self.bucket,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkHttpConfig.js
var require_sinkHttpConfig = __commonJS({
  "../../node_modules/svix/dist/models/sinkHttpConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkHttpConfigSerializer = void 0;
    exports.SinkHttpConfigSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          key: object["key"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          key: self.key,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkOtelV1Config.js
var require_sinkOtelV1Config = __commonJS({
  "../../node_modules/svix/dist/models/sinkOtelV1Config.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkOtelV1ConfigSerializer = void 0;
    exports.SinkOtelV1ConfigSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkStatus.js
var require_sinkStatus = __commonJS({
  "../../node_modules/svix/dist/models/sinkStatus.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkStatusSerializer = exports.SinkStatus = void 0;
    var SinkStatus;
    (function(SinkStatus2) {
      SinkStatus2["Enabled"] = "enabled";
      SinkStatus2["Paused"] = "paused";
      SinkStatus2["Disabled"] = "disabled";
      SinkStatus2["Retrying"] = "retrying";
    })(SinkStatus = exports.SinkStatus || (exports.SinkStatus = {}));
    exports.SinkStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamSinkOut.js
var require_streamSinkOut = __commonJS({
  "../../node_modules/svix/dist/models/streamSinkOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSinkOutSerializer = void 0;
    var azureBlobStorageConfig_1 = require_azureBlobStorageConfig();
    var googleCloudStorageConfig_1 = require_googleCloudStorageConfig();
    var s3Config_1 = require_s3Config();
    var sinkHttpConfig_1 = require_sinkHttpConfig();
    var sinkOtelV1Config_1 = require_sinkOtelV1Config();
    var sinkStatus_1 = require_sinkStatus();
    exports.StreamSinkOutSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          createdAt: new Date(object["createdAt"]),
          currentIterator: object["currentIterator"],
          eventTypes: object["eventTypes"],
          failureReason: object["failureReason"],
          id: object["id"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          nextRetryAt: object["nextRetryAt"] ? new Date(object["nextRetryAt"]) : null,
          status: sinkStatus_1.SinkStatusSerializer._fromJsonObject(object["status"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          createdAt: self.createdAt,
          currentIterator: self.currentIterator,
          eventTypes: self.eventTypes,
          failureReason: self.failureReason,
          id: self.id,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          nextRetryAt: self.nextRetryAt,
          status: sinkStatus_1.SinkStatusSerializer._toJsonObject(self.status),
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseStreamSinkOut.js
var require_listResponseStreamSinkOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseStreamSinkOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseStreamSinkOutSerializer = void 0;
    var streamSinkOut_1 = require_streamSinkOut();
    exports.ListResponseStreamSinkOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamSinkOut_1.StreamSinkOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkSecretOut.js
var require_sinkSecretOut = __commonJS({
  "../../node_modules/svix/dist/models/sinkSecretOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkSecretOutSerializer = void 0;
    exports.SinkSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkTransformIn.js
var require_sinkTransformIn = __commonJS({
  "../../node_modules/svix/dist/models/sinkTransformIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkTransformInSerializer = void 0;
    exports.SinkTransformInSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/sinkStatusIn.js
var require_sinkStatusIn = __commonJS({
  "../../node_modules/svix/dist/models/sinkStatusIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SinkStatusInSerializer = exports.SinkStatusIn = void 0;
    var SinkStatusIn;
    (function(SinkStatusIn2) {
      SinkStatusIn2["Enabled"] = "enabled";
      SinkStatusIn2["Disabled"] = "disabled";
    })(SinkStatusIn = exports.SinkStatusIn || (exports.SinkStatusIn = {}));
    exports.SinkStatusInSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamSinkIn.js
var require_streamSinkIn = __commonJS({
  "../../node_modules/svix/dist/models/streamSinkIn.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSinkInSerializer = void 0;
    var azureBlobStorageConfig_1 = require_azureBlobStorageConfig();
    var googleCloudStorageConfig_1 = require_googleCloudStorageConfig();
    var s3Config_1 = require_s3Config();
    var sinkHttpConfig_1 = require_sinkHttpConfig();
    var sinkOtelV1Config_1 = require_sinkOtelV1Config();
    var sinkStatusIn_1 = require_sinkStatusIn();
    exports.StreamSinkInSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          eventTypes: object["eventTypes"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          status: object["status"] ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          eventTypes: self.eventTypes,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          status: self.status ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/amazonS3PatchConfig.js
var require_amazonS3PatchConfig = __commonJS({
  "../../node_modules/svix/dist/models/amazonS3PatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AmazonS3PatchConfigSerializer = void 0;
    exports.AmazonS3PatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          bucket: object["bucket"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          bucket: self.bucket,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/azureBlobStoragePatchConfig.js
var require_azureBlobStoragePatchConfig = __commonJS({
  "../../node_modules/svix/dist/models/azureBlobStoragePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AzureBlobStoragePatchConfigSerializer = void 0;
    exports.AzureBlobStoragePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKey: object["accessKey"],
          account: object["account"],
          container: object["container"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKey: self.accessKey,
          account: self.account,
          container: self.container
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/googleCloudStoragePatchConfig.js
var require_googleCloudStoragePatchConfig = __commonJS({
  "../../node_modules/svix/dist/models/googleCloudStoragePatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GoogleCloudStoragePatchConfigSerializer = void 0;
    exports.GoogleCloudStoragePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          bucket: object["bucket"],
          credentials: object["credentials"]
        };
      },
      _toJsonObject(self) {
        return {
          bucket: self.bucket,
          credentials: self.credentials
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/httpPatchConfig.js
var require_httpPatchConfig = __commonJS({
  "../../node_modules/svix/dist/models/httpPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpPatchConfigSerializer = void 0;
    exports.HttpPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/otelTracingPatchConfig.js
var require_otelTracingPatchConfig = __commonJS({
  "../../node_modules/svix/dist/models/otelTracingPatchConfig.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OtelTracingPatchConfigSerializer = void 0;
    exports.OtelTracingPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          url: self.url
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamSinkPatch.js
var require_streamSinkPatch = __commonJS({
  "../../node_modules/svix/dist/models/streamSinkPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamSinkPatchSerializer = void 0;
    var amazonS3PatchConfig_1 = require_amazonS3PatchConfig();
    var azureBlobStoragePatchConfig_1 = require_azureBlobStoragePatchConfig();
    var googleCloudStoragePatchConfig_1 = require_googleCloudStoragePatchConfig();
    var httpPatchConfig_1 = require_httpPatchConfig();
    var otelTracingPatchConfig_1 = require_otelTracingPatchConfig();
    var sinkStatusIn_1 = require_sinkStatusIn();
    exports.StreamSinkPatchSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return httpPatchConfig_1.HttpPatchConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          eventTypes: object["eventTypes"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          status: object["status"] ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = httpPatchConfig_1.HttpPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          eventTypes: self.eventTypes,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          status: self.status ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/streamingSink.js
var require_streamingSink = __commonJS({
  "../../node_modules/svix/dist/api/streamingSink.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingSink = void 0;
    var emptyResponse_1 = require_emptyResponse();
    var endpointSecretRotateIn_1 = require_endpointSecretRotateIn();
    var listResponseStreamSinkOut_1 = require_listResponseStreamSinkOut();
    var sinkSecretOut_1 = require_sinkSecretOut();
    var sinkTransformIn_1 = require_sinkTransformIn();
    var streamSinkIn_1 = require_streamSinkIn();
    var streamSinkOut_1 = require_streamSinkOut();
    var streamSinkPatch_1 = require_streamSinkPatch();
    var request_1 = require_request();
    var StreamingSink = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(streamId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink");
        request.setPathParam("stream_id", streamId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseStreamSinkOut_1.ListResponseStreamSinkOutSerializer._fromJsonObject);
      }
      create(streamId, streamSinkIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink");
        request.setPathParam("stream_id", streamId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn));
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      get(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      update(streamId, sinkId, streamSinkIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn));
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      delete(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(streamId, sinkId, streamSinkPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(streamSinkPatch_1.StreamSinkPatchSerializer._toJsonObject(streamSinkPatch));
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      getSecret(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, sinkSecretOut_1.SinkSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(streamId, sinkId, endpointSecretRotateIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret/rotate");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
        return request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
      }
      transformationPartialUpdate(streamId, sinkId, sinkTransformIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(sinkTransformIn_1.SinkTransformInSerializer._toJsonObject(sinkTransformIn));
        return request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
      }
    };
    exports.StreamingSink = StreamingSink;
  }
});

// ../../node_modules/svix/dist/models/streamOut.js
var require_streamOut = __commonJS({
  "../../node_modules/svix/dist/models/streamOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamOutSerializer = void 0;
    exports.StreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          id: self.id,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/listResponseStreamOut.js
var require_listResponseStreamOut = __commonJS({
  "../../node_modules/svix/dist/models/listResponseStreamOut.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListResponseStreamOutSerializer = void 0;
    var streamOut_1 = require_streamOut();
    exports.ListResponseStreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamOut_1.StreamOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamOut_1.StreamOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/models/streamPatch.js
var require_streamPatch = __commonJS({
  "../../node_modules/svix/dist/models/streamPatch.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamPatchSerializer = void 0;
    exports.StreamPatchSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          metadata: object["metadata"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          metadata: self.metadata,
          uid: self.uid
        };
      }
    };
  }
});

// ../../node_modules/svix/dist/api/streamingStream.js
var require_streamingStream = __commonJS({
  "../../node_modules/svix/dist/api/streamingStream.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StreamingStream = void 0;
    var listResponseStreamOut_1 = require_listResponseStreamOut();
    var streamIn_1 = require_streamIn();
    var streamOut_1 = require_streamOut();
    var streamPatch_1 = require_streamPatch();
    var request_1 = require_request();
    var StreamingStream = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseStreamOut_1.ListResponseStreamOutSerializer._fromJsonObject);
      }
      create(streamIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn));
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
      get(streamId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
      update(streamId, streamIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        request.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn));
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
      delete(streamId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(streamId, streamPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        request.setBody(streamPatch_1.StreamPatchSerializer._toJsonObject(streamPatch));
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
    };
    exports.StreamingStream = StreamingStream;
  }
});

// ../../node_modules/svix/dist/api/streaming.js
var require_streaming = __commonJS({
  "../../node_modules/svix/dist/api/streaming.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Streaming = void 0;
    var endpointHeadersOut_1 = require_endpointHeadersOut();
    var httpSinkHeadersPatchIn_1 = require_httpSinkHeadersPatchIn();
    var sinkTransformationOut_1 = require_sinkTransformationOut();
    var streamingEventType_1 = require_streamingEventType();
    var streamingEvents_1 = require_streamingEvents();
    var streamingSink_1 = require_streamingSink();
    var streamingStream_1 = require_streamingStream();
    var request_1 = require_request();
    var Streaming = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get event_type() {
        return new streamingEventType_1.StreamingEventType(this.requestCtx);
      }
      get events() {
        return new streamingEvents_1.StreamingEvents(this.requestCtx);
      }
      get sink() {
        return new streamingSink_1.StreamingSink(this.requestCtx);
      }
      get stream() {
        return new streamingStream_1.StreamingStream(this.requestCtx);
      }
      sinkHeadersGet(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
      }
      sinkHeadersPatch(streamId, sinkId, httpSinkHeadersPatchIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(httpSinkHeadersPatchIn_1.HttpSinkHeadersPatchInSerializer._toJsonObject(httpSinkHeadersPatchIn));
        return request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
      }
      sinkTransformationGet(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, sinkTransformationOut_1.SinkTransformationOutSerializer._fromJsonObject);
      }
    };
    exports.Streaming = Streaming;
  }
});

// ../../node_modules/svix/dist/HttpErrors.js
var require_HttpErrors = __commonJS({
  "../../node_modules/svix/dist/HttpErrors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTTPValidationError = exports.ValidationError = exports.HttpErrorOut = void 0;
    var HttpErrorOut = class _HttpErrorOut {
      static getAttributeTypeMap() {
        return _HttpErrorOut.attributeTypeMap;
      }
    };
    exports.HttpErrorOut = HttpErrorOut;
    HttpErrorOut.discriminator = void 0;
    HttpErrorOut.mapping = void 0;
    HttpErrorOut.attributeTypeMap = [
      {
        name: "code",
        baseName: "code",
        type: "string",
        format: ""
      },
      {
        name: "detail",
        baseName: "detail",
        type: "string",
        format: ""
      }
    ];
    var ValidationError = class _ValidationError {
      static getAttributeTypeMap() {
        return _ValidationError.attributeTypeMap;
      }
    };
    exports.ValidationError = ValidationError;
    ValidationError.discriminator = void 0;
    ValidationError.mapping = void 0;
    ValidationError.attributeTypeMap = [
      {
        name: "loc",
        baseName: "loc",
        type: "Array<string>",
        format: ""
      },
      {
        name: "msg",
        baseName: "msg",
        type: "string",
        format: ""
      },
      {
        name: "type",
        baseName: "type",
        type: "string",
        format: ""
      }
    ];
    var HTTPValidationError = class _HTTPValidationError {
      static getAttributeTypeMap() {
        return _HTTPValidationError.attributeTypeMap;
      }
    };
    exports.HTTPValidationError = HTTPValidationError;
    HTTPValidationError.discriminator = void 0;
    HTTPValidationError.mapping = void 0;
    HTTPValidationError.attributeTypeMap = [
      {
        name: "detail",
        baseName: "detail",
        type: "Array<ValidationError>",
        format: ""
      }
    ];
  }
});

// ../../node_modules/standardwebhooks/dist/timing_safe_equal.js
var require_timing_safe_equal = __commonJS({
  "../../node_modules/standardwebhooks/dist/timing_safe_equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.timingSafeEqual = void 0;
    function assert(expr, msg = "") {
      if (!expr) {
        throw new Error(msg);
      }
    }
    function timingSafeEqual(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      if (!(a instanceof DataView)) {
        a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
      }
      if (!(b instanceof DataView)) {
        b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
      }
      assert(a instanceof DataView);
      assert(b instanceof DataView);
      const length = a.byteLength;
      let out = 0;
      let i = -1;
      while (++i < length) {
        out |= a.getUint8(i) ^ b.getUint8(i);
      }
      return out === 0;
    }
    exports.timingSafeEqual = timingSafeEqual;
  }
});

// ../../node_modules/@stablelib/base64/lib/base64.js
var require_base64 = __commonJS({
  "../../node_modules/@stablelib/base64/lib/base64.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", { value: true });
    var INVALID_BYTE = 256;
    var Coder = (
      /** @class */
      function() {
        function Coder2(_paddingCharacter) {
          if (_paddingCharacter === void 0) {
            _paddingCharacter = "=";
          }
          this._paddingCharacter = _paddingCharacter;
        }
        Coder2.prototype.encodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
          }
          return (length + 2) / 3 * 4 | 0;
        };
        Coder2.prototype.encode = function(data) {
          var out = "";
          var i = 0;
          for (; i < data.length - 2; i += 3) {
            var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            out += this._encodeByte(c >>> 1 * 6 & 63);
            out += this._encodeByte(c >>> 0 * 6 & 63);
          }
          var left = data.length - i;
          if (left > 0) {
            var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            if (left === 2) {
              out += this._encodeByte(c >>> 1 * 6 & 63);
            } else {
              out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
          }
          return out;
        };
        Coder2.prototype.maxDecodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
          }
          return length / 4 * 3 | 0;
        };
        Coder2.prototype.decodedLength = function(s) {
          return this.maxDecodedLength(s.length - this._getPaddingLength(s));
        };
        Coder2.prototype.decode = function(s) {
          if (s.length === 0) {
            return new Uint8Array(0);
          }
          var paddingLength = this._getPaddingLength(s);
          var length = s.length - paddingLength;
          var out = new Uint8Array(this.maxDecodedLength(length));
          var op = 0;
          var i = 0;
          var haveBad = 0;
          var v0 = 0, v12 = 0, v2 = 0, v32 = 0;
          for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v12 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v32 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v0 << 2 | v12 >>> 4;
            out[op++] = v12 << 4 | v2 >>> 2;
            out[op++] = v2 << 6 | v32;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v12 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v32 & INVALID_BYTE;
          }
          if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v12 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = v0 << 2 | v12 >>> 4;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v12 & INVALID_BYTE;
          }
          if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = v12 << 4 | v2 >>> 2;
            haveBad |= v2 & INVALID_BYTE;
          }
          if (i < length - 3) {
            v32 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v2 << 6 | v32;
            haveBad |= v32 & INVALID_BYTE;
          }
          if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
          }
          return out;
        };
        Coder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 43;
          result += 62 - b >>> 8 & 62 - 43 - 63 + 47;
          return String.fromCharCode(result);
        };
        Coder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
          result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        Coder2.prototype._getPaddingLength = function(s) {
          var paddingLength = 0;
          if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
              if (s[i] !== this._paddingCharacter) {
                break;
              }
              paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
              throw new Error("Base64Coder: incorrect padding");
            }
          }
          return paddingLength;
        };
        return Coder2;
      }()
    );
    exports.Coder = Coder;
    var stdCoder = new Coder();
    function encode(data) {
      return stdCoder.encode(data);
    }
    exports.encode = encode;
    function decode(s) {
      return stdCoder.decode(s);
    }
    exports.decode = decode;
    var URLSafeCoder = (
      /** @class */
      function(_super) {
        __extends(URLSafeCoder2, _super);
        function URLSafeCoder2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        URLSafeCoder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 45;
          result += 62 - b >>> 8 & 62 - 45 - 63 + 95;
          return String.fromCharCode(result);
        };
        URLSafeCoder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
          result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        return URLSafeCoder2;
      }(Coder)
    );
    exports.URLSafeCoder = URLSafeCoder;
    var urlSafeCoder = new URLSafeCoder();
    function encodeURLSafe(data) {
      return urlSafeCoder.encode(data);
    }
    exports.encodeURLSafe = encodeURLSafe;
    function decodeURLSafe(s) {
      return urlSafeCoder.decode(s);
    }
    exports.decodeURLSafe = decodeURLSafe;
    exports.encodedLength = function(length) {
      return stdCoder.encodedLength(length);
    };
    exports.maxDecodedLength = function(length) {
      return stdCoder.maxDecodedLength(length);
    };
    exports.decodedLength = function(s) {
      return stdCoder.decodedLength(s);
    };
  }
});

// ../../node_modules/fast-sha256/sha256.js
var require_sha256 = __commonJS({
  "../../node_modules/fast-sha256/sha256.js"(exports, module) {
    (function(root, factory) {
      var exports2 = {};
      factory(exports2);
      var sha256 = exports2["default"];
      for (var k in exports2) {
        sha256[k] = exports2[k];
      }
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = sha256;
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return sha256;
        });
      } else {
        root.sha256 = sha256;
      }
    })(exports, function(exports2) {
      "use strict";
      exports2.__esModule = true;
      exports2.digestLength = 32;
      exports2.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
            h = g;
            g = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      var Hash = (
        /** @class */
        function() {
          function Hash2() {
            this.digestLength = exports2.digestLength;
            this.blockSize = exports2.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        }()
      );
      exports2.Hash = Hash;
      var HMAC = (
        /** @class */
        function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        }()
      );
      exports2.HMAC = HMAC;
      function hash(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports2.hash = hash;
      exports2["default"] = hash;
      function hmac(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports2.hmac = hmac;
      function fillBuffer(buffer, hmac2, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac2.reset();
        if (num > 1) {
          hmac2.update(buffer);
        }
        if (info) {
          hmac2.update(info);
        }
        hmac2.update(counter);
        hmac2.finish(buffer);
        counter[0]++;
      }
      var hkdfSalt = new Uint8Array(exports2.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer[bufpos++];
        }
        hmac_.clean();
        buffer.fill(0);
        counter.fill(0);
        return out;
      }
      exports2.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      exports2.pbkdf2 = pbkdf2;
    });
  }
});

// ../../node_modules/standardwebhooks/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/standardwebhooks/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Webhook = exports.WebhookVerificationError = void 0;
    var timing_safe_equal_1 = require_timing_safe_equal();
    var base64 = require_base64();
    var sha256 = require_sha256();
    var WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
    var ExtendableError = class _ExtendableError extends Error {
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _ExtendableError.prototype);
        this.name = "ExtendableError";
        this.stack = new Error(message).stack;
      }
    };
    var WebhookVerificationError = class _WebhookVerificationError extends ExtendableError {
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _WebhookVerificationError.prototype);
        this.name = "WebhookVerificationError";
      }
    };
    exports.WebhookVerificationError = WebhookVerificationError;
    var Webhook2 = class _Webhook {
      constructor(secret, options) {
        if (!secret) {
          throw new Error("Secret can't be empty.");
        }
        if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
          if (secret instanceof Uint8Array) {
            this.key = secret;
          } else {
            this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
          }
        } else {
          if (typeof secret !== "string") {
            throw new Error("Expected secret to be of type string");
          }
          if (secret.startsWith(_Webhook.prefix)) {
            secret = secret.substring(_Webhook.prefix.length);
          }
          this.key = base64.decode(secret);
        }
      }
      verify(payload, headers_) {
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        const msgId = headers["webhook-id"];
        const msgSignature = headers["webhook-signature"];
        const msgTimestamp = headers["webhook-timestamp"];
        if (!msgSignature || !msgId || !msgTimestamp) {
          throw new WebhookVerificationError("Missing required headers");
        }
        const timestamp = this.verifyTimestamp(msgTimestamp);
        const computedSignature = this.sign(msgId, timestamp, payload);
        const expectedSignature = computedSignature.split(",")[1];
        const passedSignatures = msgSignature.split(" ");
        const encoder = new globalThis.TextEncoder();
        for (const versionedSignature of passedSignatures) {
          const [version3, signature] = versionedSignature.split(",");
          if (version3 !== "v1") {
            continue;
          }
          if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
            return JSON.parse(payload.toString());
          }
        }
        throw new WebhookVerificationError("No matching signature found");
      }
      sign(msgId, timestamp, payload) {
        if (typeof payload === "string") {
        } else if (payload.constructor.name === "Buffer") {
          payload = payload.toString();
        } else {
          throw new Error("Expected payload to be of type string or Buffer.");
        }
        const encoder = new TextEncoder();
        const timestampNumber = Math.floor(timestamp.getTime() / 1e3);
        const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
        const expectedSignature = base64.encode(sha256.hmac(this.key, toSign));
        return `v1,${expectedSignature}`;
      }
      verifyTimestamp(timestampHeader) {
        const now = Math.floor(Date.now() / 1e3);
        const timestamp = parseInt(timestampHeader, 10);
        if (isNaN(timestamp)) {
          throw new WebhookVerificationError("Invalid Signature Headers");
        }
        if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too old");
        }
        if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too new");
        }
        return new Date(timestamp * 1e3);
      }
    };
    exports.Webhook = Webhook2;
    Webhook2.prefix = "whsec_";
  }
});

// ../../node_modules/svix/dist/webhook.js
var require_webhook = __commonJS({
  "../../node_modules/svix/dist/webhook.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Webhook = exports.WebhookVerificationError = void 0;
    var standardwebhooks_1 = require_dist();
    var standardwebhooks_2 = require_dist();
    Object.defineProperty(exports, "WebhookVerificationError", { enumerable: true, get: function() {
      return standardwebhooks_2.WebhookVerificationError;
    } });
    var Webhook2 = class {
      constructor(secret, options) {
        this.inner = new standardwebhooks_1.Webhook(secret, options);
      }
      verify(payload, headers_) {
        var _a, _b, _c, _d, _e, _f;
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        headers["webhook-id"] = (_b = (_a = headers["svix-id"]) !== null && _a !== void 0 ? _a : headers["webhook-id"]) !== null && _b !== void 0 ? _b : "";
        headers["webhook-signature"] = (_d = (_c = headers["svix-signature"]) !== null && _c !== void 0 ? _c : headers["webhook-signature"]) !== null && _d !== void 0 ? _d : "";
        headers["webhook-timestamp"] = (_f = (_e = headers["svix-timestamp"]) !== null && _e !== void 0 ? _e : headers["webhook-timestamp"]) !== null && _f !== void 0 ? _f : "";
        return this.inner.verify(payload, headers);
      }
      sign(msgId, timestamp, payload) {
        return this.inner.sign(msgId, timestamp, payload);
      }
    };
    exports.Webhook = Webhook2;
  }
});

// ../../node_modules/svix/dist/models/endpointDisabledTrigger.js
var require_endpointDisabledTrigger = __commonJS({
  "../../node_modules/svix/dist/models/endpointDisabledTrigger.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EndpointDisabledTriggerSerializer = exports.EndpointDisabledTrigger = void 0;
    var EndpointDisabledTrigger;
    (function(EndpointDisabledTrigger2) {
      EndpointDisabledTrigger2["Manual"] = "manual";
      EndpointDisabledTrigger2["Automatic"] = "automatic";
    })(EndpointDisabledTrigger = exports.EndpointDisabledTrigger || (exports.EndpointDisabledTrigger = {}));
    exports.EndpointDisabledTriggerSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/ordering.js
var require_ordering = __commonJS({
  "../../node_modules/svix/dist/models/ordering.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OrderingSerializer = exports.Ordering = void 0;
    var Ordering;
    (function(Ordering2) {
      Ordering2["Ascending"] = "ascending";
      Ordering2["Descending"] = "descending";
    })(Ordering = exports.Ordering || (exports.Ordering = {}));
    exports.OrderingSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/statusCodeClass.js
var require_statusCodeClass = __commonJS({
  "../../node_modules/svix/dist/models/statusCodeClass.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusCodeClassSerializer = exports.StatusCodeClass = void 0;
    var StatusCodeClass;
    (function(StatusCodeClass2) {
      StatusCodeClass2[StatusCodeClass2["CodeNone"] = 0] = "CodeNone";
      StatusCodeClass2[StatusCodeClass2["Code1xx"] = 100] = "Code1xx";
      StatusCodeClass2[StatusCodeClass2["Code2xx"] = 200] = "Code2xx";
      StatusCodeClass2[StatusCodeClass2["Code3xx"] = 300] = "Code3xx";
      StatusCodeClass2[StatusCodeClass2["Code4xx"] = 400] = "Code4xx";
      StatusCodeClass2[StatusCodeClass2["Code5xx"] = 500] = "Code5xx";
    })(StatusCodeClass = exports.StatusCodeClass || (exports.StatusCodeClass = {}));
    exports.StatusCodeClassSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// ../../node_modules/svix/dist/models/index.js
var require_models = __commonJS({
  "../../node_modules/svix/dist/models/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusCodeClass = exports.SinkStatusIn = exports.SinkStatus = exports.Ordering = exports.MessageStatusText = exports.MessageStatus = exports.MessageAttemptTriggerType = exports.EndpointDisabledTrigger = exports.ConnectorProduct = exports.ConnectorKind = exports.BackgroundTaskType = exports.BackgroundTaskStatus = exports.AppPortalCapability = void 0;
    var appPortalCapability_1 = require_appPortalCapability();
    Object.defineProperty(exports, "AppPortalCapability", { enumerable: true, get: function() {
      return appPortalCapability_1.AppPortalCapability;
    } });
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    Object.defineProperty(exports, "BackgroundTaskStatus", { enumerable: true, get: function() {
      return backgroundTaskStatus_1.BackgroundTaskStatus;
    } });
    var backgroundTaskType_1 = require_backgroundTaskType();
    Object.defineProperty(exports, "BackgroundTaskType", { enumerable: true, get: function() {
      return backgroundTaskType_1.BackgroundTaskType;
    } });
    var connectorKind_1 = require_connectorKind();
    Object.defineProperty(exports, "ConnectorKind", { enumerable: true, get: function() {
      return connectorKind_1.ConnectorKind;
    } });
    var connectorProduct_1 = require_connectorProduct();
    Object.defineProperty(exports, "ConnectorProduct", { enumerable: true, get: function() {
      return connectorProduct_1.ConnectorProduct;
    } });
    var endpointDisabledTrigger_1 = require_endpointDisabledTrigger();
    Object.defineProperty(exports, "EndpointDisabledTrigger", { enumerable: true, get: function() {
      return endpointDisabledTrigger_1.EndpointDisabledTrigger;
    } });
    var messageAttemptTriggerType_1 = require_messageAttemptTriggerType();
    Object.defineProperty(exports, "MessageAttemptTriggerType", { enumerable: true, get: function() {
      return messageAttemptTriggerType_1.MessageAttemptTriggerType;
    } });
    var messageStatus_1 = require_messageStatus();
    Object.defineProperty(exports, "MessageStatus", { enumerable: true, get: function() {
      return messageStatus_1.MessageStatus;
    } });
    var messageStatusText_1 = require_messageStatusText();
    Object.defineProperty(exports, "MessageStatusText", { enumerable: true, get: function() {
      return messageStatusText_1.MessageStatusText;
    } });
    var ordering_1 = require_ordering();
    Object.defineProperty(exports, "Ordering", { enumerable: true, get: function() {
      return ordering_1.Ordering;
    } });
    var sinkStatus_1 = require_sinkStatus();
    Object.defineProperty(exports, "SinkStatus", { enumerable: true, get: function() {
      return sinkStatus_1.SinkStatus;
    } });
    var sinkStatusIn_1 = require_sinkStatusIn();
    Object.defineProperty(exports, "SinkStatusIn", { enumerable: true, get: function() {
      return sinkStatusIn_1.SinkStatusIn;
    } });
    var statusCodeClass_1 = require_statusCodeClass();
    Object.defineProperty(exports, "StatusCodeClass", { enumerable: true, get: function() {
      return statusCodeClass_1.StatusCodeClass;
    } });
  }
});

// ../../node_modules/svix/dist/index.js
var require_dist2 = __commonJS({
  "../../node_modules/svix/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Svix = exports.messageInRaw = exports.ValidationError = exports.HttpErrorOut = exports.HTTPValidationError = exports.ApiException = void 0;
    var application_1 = require_application();
    var authentication_1 = require_authentication();
    var backgroundTask_1 = require_backgroundTask();
    var connector_1 = require_connector();
    var endpoint_1 = require_endpoint();
    var environment_1 = require_environment();
    var eventType_1 = require_eventType();
    var health_1 = require_health();
    var ingest_1 = require_ingest();
    var integration_1 = require_integration();
    var message_1 = require_message();
    var messageAttempt_1 = require_messageAttempt();
    var operationalWebhook_1 = require_operationalWebhook();
    var statistics_1 = require_statistics();
    var streaming_1 = require_streaming();
    var operationalWebhookEndpoint_1 = require_operationalWebhookEndpoint();
    var util_1 = require_util();
    Object.defineProperty(exports, "ApiException", { enumerable: true, get: function() {
      return util_1.ApiException;
    } });
    var HttpErrors_1 = require_HttpErrors();
    Object.defineProperty(exports, "HTTPValidationError", { enumerable: true, get: function() {
      return HttpErrors_1.HTTPValidationError;
    } });
    Object.defineProperty(exports, "HttpErrorOut", { enumerable: true, get: function() {
      return HttpErrors_1.HttpErrorOut;
    } });
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return HttpErrors_1.ValidationError;
    } });
    __exportStar(require_webhook(), exports);
    __exportStar(require_models(), exports);
    var message_2 = require_message();
    Object.defineProperty(exports, "messageInRaw", { enumerable: true, get: function() {
      return message_2.messageInRaw;
    } });
    var REGIONS = [
      { region: "us", url: "https://api.us.svix.com" },
      { region: "eu", url: "https://api.eu.svix.com" },
      { region: "in", url: "https://api.in.svix.com" },
      { region: "ca", url: "https://api.ca.svix.com" },
      { region: "au", url: "https://api.au.svix.com" }
    ];
    var Svix = class {
      constructor(token, options = {}) {
        var _a, _b, _c;
        const regionalUrl = (_a = REGIONS.find((x) => x.region === token.split(".")[1])) === null || _a === void 0 ? void 0 : _a.url;
        const baseUrl2 = (_c = (_b = options.serverUrl) !== null && _b !== void 0 ? _b : regionalUrl) !== null && _c !== void 0 ? _c : "https://api.svix.com";
        if (options.retryScheduleInMs) {
          this.requestCtx = {
            baseUrl: baseUrl2,
            token,
            timeout: options.requestTimeout,
            retryScheduleInMs: options.retryScheduleInMs,
            fetch: options.fetch
          };
          return;
        }
        if (options.numRetries) {
          this.requestCtx = {
            baseUrl: baseUrl2,
            token,
            timeout: options.requestTimeout,
            numRetries: options.numRetries,
            fetch: options.fetch
          };
          return;
        }
        this.requestCtx = {
          baseUrl: baseUrl2,
          token,
          timeout: options.requestTimeout,
          fetch: options.fetch
        };
      }
      get application() {
        return new application_1.Application(this.requestCtx);
      }
      get authentication() {
        return new authentication_1.Authentication(this.requestCtx);
      }
      get backgroundTask() {
        return new backgroundTask_1.BackgroundTask(this.requestCtx);
      }
      get connector() {
        return new connector_1.Connector(this.requestCtx);
      }
      get endpoint() {
        return new endpoint_1.Endpoint(this.requestCtx);
      }
      get environment() {
        return new environment_1.Environment(this.requestCtx);
      }
      get eventType() {
        return new eventType_1.EventType(this.requestCtx);
      }
      get health() {
        return new health_1.Health(this.requestCtx);
      }
      get ingest() {
        return new ingest_1.Ingest(this.requestCtx);
      }
      get integration() {
        return new integration_1.Integration(this.requestCtx);
      }
      get message() {
        return new message_1.Message(this.requestCtx);
      }
      get messageAttempt() {
        return new messageAttempt_1.MessageAttempt(this.requestCtx);
      }
      get operationalWebhook() {
        return new operationalWebhook_1.OperationalWebhook(this.requestCtx);
      }
      get statistics() {
        return new statistics_1.Statistics(this.requestCtx);
      }
      get streaming() {
        return new streaming_1.Streaming(this.requestCtx);
      }
      get operationalWebhookEndpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    };
    exports.Svix = Svix;
  }
});

// ../../node_modules/resend/dist/index.mjs
function buildPaginationQuery(options) {
  const searchParams = new URLSearchParams();
  if (options.limit !== void 0) searchParams.set("limit", options.limit.toString());
  if ("after" in options && options.after !== void 0) searchParams.set("after", options.after);
  if ("before" in options && options.before !== void 0) searchParams.set("before", options.before);
  return searchParams.toString();
}
function parseAttachments(attachments) {
  return attachments?.map((attachment) => ({
    content: attachment.content,
    filename: attachment.filename,
    path: attachment.path,
    content_type: attachment.contentType,
    content_id: attachment.contentId
  }));
}
function parseEmailToApiOptions(email) {
  return {
    attachments: parseAttachments(email.attachments),
    bcc: email.bcc,
    cc: email.cc,
    from: email.from,
    headers: email.headers,
    html: email.html,
    reply_to: email.replyTo,
    scheduled_at: email.scheduledAt,
    subject: email.subject,
    tags: email.tags,
    text: email.text,
    to: email.to,
    template: email.template ? {
      id: email.template.id,
      variables: email.template.variables
    } : void 0,
    topic_id: email.topicId
  };
}
async function render(node) {
  let render2;
  try {
    ({ render: render2 } = await import("@react-email/render"));
  } catch {
    throw new Error("Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`.");
  }
  return render2(node);
}
function parseContactPropertyFromApi(contactProperty) {
  return {
    id: contactProperty.id,
    key: contactProperty.key,
    createdAt: contactProperty.created_at,
    type: contactProperty.type,
    fallbackValue: contactProperty.fallback_value
  };
}
function parseContactPropertyToApiOptions(contactProperty) {
  if ("key" in contactProperty) return {
    key: contactProperty.key,
    type: contactProperty.type,
    fallback_value: contactProperty.fallbackValue
  };
  return { fallback_value: contactProperty.fallbackValue };
}
function parseDomainToApiOptions(domain) {
  return {
    name: domain.name,
    region: domain.region,
    custom_return_path: domain.customReturnPath,
    capabilities: domain.capabilities,
    open_tracking: domain.openTracking,
    click_tracking: domain.clickTracking,
    tls: domain.tls
  };
}
function getPaginationQueryProperties(options = {}) {
  const query = new URLSearchParams();
  if (options.before) query.set("before", options.before);
  if (options.after) query.set("after", options.after);
  if (options.limit) query.set("limit", options.limit.toString());
  return query.size > 0 ? `?${query.toString()}` : "";
}
function parseVariables(variables) {
  return variables?.map((variable) => ({
    key: variable.key,
    type: variable.type,
    fallback_value: variable.fallbackValue
  }));
}
function parseTemplateToApiOptions(template) {
  return {
    name: "name" in template ? template.name : void 0,
    subject: template.subject,
    html: template.html,
    text: template.text,
    alias: template.alias,
    from: template.from,
    reply_to: template.replyTo,
    variables: parseVariables(template.variables)
  };
}
var import_svix, version2, ApiKeys, Batch, Broadcasts, ContactProperties, ContactSegments, ContactTopics, Contacts, Domains, Attachments$1, Attachments, Receiving, Emails, Segments, ChainableTemplateResult, Templates, Topics, Webhooks, defaultBaseUrl, defaultUserAgent, baseUrl, userAgent, Resend;
var init_dist = __esm({
  "../../node_modules/resend/dist/index.mjs"() {
    init_postal_mime();
    import_svix = __toESM(require_dist2(), 1);
    version2 = "6.9.3";
    ApiKeys = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(payload, options = {}) {
        return await this.resend.post("/api-keys", payload, options);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/api-keys?${queryString}` : "/api-keys";
        return await this.resend.get(url);
      }
      async remove(id) {
        return await this.resend.delete(`/api-keys/${id}`);
      }
    };
    Batch = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async send(payload, options) {
        return this.create(payload, options);
      }
      async create(payload, options) {
        const emails = [];
        for (const email of payload) {
          if (email.react) {
            email.html = await render(email.react);
            email.react = void 0;
          }
          emails.push(parseEmailToApiOptions(email));
        }
        return await this.resend.post("/emails/batch", emails, {
          ...options,
          headers: {
            "x-batch-validation": options?.batchValidation ?? "strict",
            ...options?.headers
          }
        });
      }
    };
    Broadcasts = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(payload, options = {}) {
        if (payload.react) payload.html = await render(payload.react);
        return await this.resend.post("/broadcasts", {
          name: payload.name,
          segment_id: payload.segmentId,
          audience_id: payload.audienceId,
          preview_text: payload.previewText,
          from: payload.from,
          html: payload.html,
          reply_to: payload.replyTo,
          subject: payload.subject,
          text: payload.text,
          topic_id: payload.topicId,
          send: payload.send,
          scheduled_at: payload.scheduledAt
        }, options);
      }
      async send(id, payload) {
        return await this.resend.post(`/broadcasts/${id}/send`, { scheduled_at: payload?.scheduledAt });
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/broadcasts?${queryString}` : "/broadcasts";
        return await this.resend.get(url);
      }
      async get(id) {
        return await this.resend.get(`/broadcasts/${id}`);
      }
      async remove(id) {
        return await this.resend.delete(`/broadcasts/${id}`);
      }
      async update(id, payload) {
        if (payload.react) payload.html = await render(payload.react);
        return await this.resend.patch(`/broadcasts/${id}`, {
          name: payload.name,
          segment_id: payload.segmentId,
          audience_id: payload.audienceId,
          from: payload.from,
          html: payload.html,
          text: payload.text,
          subject: payload.subject,
          reply_to: payload.replyTo,
          preview_text: payload.previewText,
          topic_id: payload.topicId
        });
      }
    };
    ContactProperties = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(options) {
        const apiOptions = parseContactPropertyToApiOptions(options);
        return await this.resend.post("/contact-properties", apiOptions);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/contact-properties?${queryString}` : "/contact-properties";
        const response = await this.resend.get(url);
        if (response.data) return {
          data: {
            ...response.data,
            data: response.data.data.map((apiContactProperty) => parseContactPropertyFromApi(apiContactProperty))
          },
          headers: response.headers,
          error: null
        };
        return response;
      }
      async get(id) {
        if (!id) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const response = await this.resend.get(`/contact-properties/${id}`);
        if (response.data) return {
          data: {
            object: "contact_property",
            ...parseContactPropertyFromApi(response.data)
          },
          headers: response.headers,
          error: null
        };
        return response;
      }
      async update(payload) {
        if (!payload.id) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const apiOptions = parseContactPropertyToApiOptions(payload);
        return await this.resend.patch(`/contact-properties/${payload.id}`, apiOptions);
      }
      async remove(id) {
        if (!id) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        return await this.resend.delete(`/contact-properties/${id}`);
      }
    };
    ContactSegments = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async list(options) {
        if (!options.contactId && !options.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const identifier = options.email ? options.email : options.contactId;
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/contacts/${identifier}/segments?${queryString}` : `/contacts/${identifier}/segments`;
        return await this.resend.get(url);
      }
      async add(options) {
        if (!options.contactId && !options.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const identifier = options.email ? options.email : options.contactId;
        return this.resend.post(`/contacts/${identifier}/segments/${options.segmentId}`);
      }
      async remove(options) {
        if (!options.contactId && !options.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const identifier = options.email ? options.email : options.contactId;
        return this.resend.delete(`/contacts/${identifier}/segments/${options.segmentId}`);
      }
    };
    ContactTopics = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async update(payload) {
        if (!payload.id && !payload.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const identifier = payload.email ? payload.email : payload.id;
        return this.resend.patch(`/contacts/${identifier}/topics`, payload.topics);
      }
      async list(options) {
        if (!options.id && !options.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        const identifier = options.email ? options.email : options.id;
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/contacts/${identifier}/topics?${queryString}` : `/contacts/${identifier}/topics`;
        return this.resend.get(url);
      }
    };
    Contacts = class {
      constructor(resend2) {
        this.resend = resend2;
        this.topics = new ContactTopics(this.resend);
        this.segments = new ContactSegments(this.resend);
      }
      async create(payload, options = {}) {
        if ("audienceId" in payload) {
          if ("segments" in payload || "topics" in payload) return {
            data: null,
            headers: null,
            error: {
              message: "`audienceId` is deprecated, and cannot be used together with `segments` or `topics`. Use `segments` instead to add one or more segments to the new contact.",
              statusCode: null,
              name: "invalid_parameter"
            }
          };
          return await this.resend.post(`/audiences/${payload.audienceId}/contacts`, {
            unsubscribed: payload.unsubscribed,
            email: payload.email,
            first_name: payload.firstName,
            last_name: payload.lastName,
            properties: payload.properties
          }, options);
        }
        return await this.resend.post("/contacts", {
          unsubscribed: payload.unsubscribed,
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName,
          properties: payload.properties,
          segments: payload.segments,
          topics: payload.topics
        }, options);
      }
      async list(options = {}) {
        const segmentId = options.segmentId ?? options.audienceId;
        if (!segmentId) {
          const queryString2 = buildPaginationQuery(options);
          const url2 = queryString2 ? `/contacts?${queryString2}` : "/contacts";
          return await this.resend.get(url2);
        }
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/segments/${segmentId}/contacts?${queryString}` : `/segments/${segmentId}/contacts`;
        return await this.resend.get(url);
      }
      async get(options) {
        if (typeof options === "string") return this.resend.get(`/contacts/${options}`);
        if (!options.id && !options.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        if (!options.audienceId) return this.resend.get(`/contacts/${options?.email ? options?.email : options?.id}`);
        return this.resend.get(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`);
      }
      async update(options) {
        if (!options.id && !options.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        if (!options.audienceId) return await this.resend.patch(`/contacts/${options?.email ? options?.email : options?.id}`, {
          unsubscribed: options.unsubscribed,
          first_name: options.firstName,
          last_name: options.lastName,
          properties: options.properties
        });
        return await this.resend.patch(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`, {
          unsubscribed: options.unsubscribed,
          first_name: options.firstName,
          last_name: options.lastName,
          properties: options.properties
        });
      }
      async remove(payload) {
        if (typeof payload === "string") return this.resend.delete(`/contacts/${payload}`);
        if (!payload.id && !payload.email) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` or `email` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        if (!payload.audienceId) return this.resend.delete(`/contacts/${payload?.email ? payload?.email : payload?.id}`);
        return this.resend.delete(`/audiences/${payload.audienceId}/contacts/${payload?.email ? payload?.email : payload?.id}`);
      }
    };
    Domains = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(payload, options = {}) {
        return await this.resend.post("/domains", parseDomainToApiOptions(payload), options);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/domains?${queryString}` : "/domains";
        return await this.resend.get(url);
      }
      async get(id) {
        return await this.resend.get(`/domains/${id}`);
      }
      async update(payload) {
        return await this.resend.patch(`/domains/${payload.id}`, {
          click_tracking: payload.clickTracking,
          open_tracking: payload.openTracking,
          tls: payload.tls,
          capabilities: payload.capabilities
        });
      }
      async remove(id) {
        return await this.resend.delete(`/domains/${id}`);
      }
      async verify(id) {
        return await this.resend.post(`/domains/${id}/verify`);
      }
    };
    Attachments$1 = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async get(options) {
        const { emailId, id } = options;
        return await this.resend.get(`/emails/${emailId}/attachments/${id}`);
      }
      async list(options) {
        const { emailId } = options;
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/emails/${emailId}/attachments?${queryString}` : `/emails/${emailId}/attachments`;
        return await this.resend.get(url);
      }
    };
    Attachments = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async get(options) {
        const { emailId, id } = options;
        return await this.resend.get(`/emails/receiving/${emailId}/attachments/${id}`);
      }
      async list(options) {
        const { emailId } = options;
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/emails/receiving/${emailId}/attachments?${queryString}` : `/emails/receiving/${emailId}/attachments`;
        return await this.resend.get(url);
      }
    };
    Receiving = class {
      constructor(resend2) {
        this.resend = resend2;
        this.attachments = new Attachments(resend2);
      }
      async get(id) {
        return await this.resend.get(`/emails/receiving/${id}`);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/emails/receiving?${queryString}` : "/emails/receiving";
        return await this.resend.get(url);
      }
      async forward(options) {
        const { emailId, to, from } = options;
        const passthrough = options.passthrough !== false;
        const emailResponse = await this.get(emailId);
        if (emailResponse.error) return {
          data: null,
          error: emailResponse.error,
          headers: emailResponse.headers
        };
        const email = emailResponse.data;
        const originalSubject = email.subject || "(no subject)";
        if (passthrough) return this.forwardPassthrough(email, {
          to,
          from,
          subject: originalSubject
        });
        const forwardSubject = originalSubject.startsWith("Fwd:") ? originalSubject : `Fwd: ${originalSubject}`;
        return this.forwardWrapped(email, {
          to,
          from,
          subject: forwardSubject,
          text: "text" in options ? options.text : void 0,
          html: "html" in options ? options.html : void 0
        });
      }
      async forwardPassthrough(email, options) {
        const { to, from, subject } = options;
        if (!email.raw?.download_url) return {
          data: null,
          error: {
            name: "validation_error",
            message: "Raw email content is not available for this email",
            statusCode: 400
          },
          headers: null
        };
        const rawResponse = await fetch(email.raw.download_url);
        if (!rawResponse.ok) return {
          data: null,
          error: {
            name: "application_error",
            message: "Failed to download raw email content",
            statusCode: rawResponse.status
          },
          headers: null
        };
        const rawEmailContent = await rawResponse.text();
        const parsed = await PostalMime.parse(rawEmailContent, { attachmentEncoding: "base64" });
        const attachments = parsed.attachments.map((attachment) => {
          const contentId = attachment.contentId ? attachment.contentId.replace(/^<|>$/g, "") : void 0;
          return {
            filename: attachment.filename,
            content: attachment.content.toString(),
            content_type: attachment.mimeType,
            content_id: contentId || void 0
          };
        });
        return await this.resend.post("/emails", {
          from,
          to,
          subject,
          text: parsed.text || void 0,
          html: parsed.html || void 0,
          attachments: attachments.length > 0 ? attachments : void 0
        });
      }
      async forwardWrapped(email, options) {
        const { to, from, subject, text, html } = options;
        if (!email.raw?.download_url) return {
          data: null,
          error: {
            name: "validation_error",
            message: "Raw email content is not available for this email",
            statusCode: 400
          },
          headers: null
        };
        const rawResponse = await fetch(email.raw.download_url);
        if (!rawResponse.ok) return {
          data: null,
          error: {
            name: "application_error",
            message: "Failed to download raw email content",
            statusCode: rawResponse.status
          },
          headers: null
        };
        const rawEmailContent = await rawResponse.text();
        return await this.resend.post("/emails", {
          from,
          to,
          subject,
          text,
          html,
          attachments: [{
            filename: "forwarded_message.eml",
            content: Buffer.from(rawEmailContent).toString("base64"),
            content_type: "message/rfc822"
          }]
        });
      }
    };
    Emails = class {
      constructor(resend2) {
        this.resend = resend2;
        this.attachments = new Attachments$1(resend2);
        this.receiving = new Receiving(resend2);
      }
      async send(payload, options = {}) {
        return this.create(payload, options);
      }
      async create(payload, options = {}) {
        if (payload.react) payload.html = await render(payload.react);
        return await this.resend.post("/emails", parseEmailToApiOptions(payload), options);
      }
      async get(id) {
        return await this.resend.get(`/emails/${id}`);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/emails?${queryString}` : "/emails";
        return await this.resend.get(url);
      }
      async update(payload) {
        return await this.resend.patch(`/emails/${payload.id}`, { scheduled_at: payload.scheduledAt });
      }
      async cancel(id) {
        return await this.resend.post(`/emails/${id}/cancel`);
      }
    };
    Segments = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(payload, options = {}) {
        return await this.resend.post("/segments", payload, options);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/segments?${queryString}` : "/segments";
        return await this.resend.get(url);
      }
      async get(id) {
        return await this.resend.get(`/segments/${id}`);
      }
      async remove(id) {
        return await this.resend.delete(`/segments/${id}`);
      }
    };
    ChainableTemplateResult = class {
      constructor(promise, publishFn) {
        this.promise = promise;
        this.publishFn = publishFn;
      }
      then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
      }
      async publish() {
        const { data, error } = await this.promise;
        if (error) return {
          data: null,
          headers: null,
          error
        };
        return this.publishFn(data.id);
      }
    };
    Templates = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      create(payload) {
        return new ChainableTemplateResult(this.performCreate(payload), this.publish.bind(this));
      }
      async performCreate(payload) {
        if (payload.react) {
          if (!this.renderAsync) try {
            const { renderAsync } = await import("@react-email/render");
            this.renderAsync = renderAsync;
          } catch {
            throw new Error("Failed to render React component. Make sure to install `@react-email/render`");
          }
          payload.html = await this.renderAsync(payload.react);
        }
        return this.resend.post("/templates", parseTemplateToApiOptions(payload));
      }
      async remove(identifier) {
        return await this.resend.delete(`/templates/${identifier}`);
      }
      async get(identifier) {
        return await this.resend.get(`/templates/${identifier}`);
      }
      async list(options = {}) {
        return this.resend.get(`/templates${getPaginationQueryProperties(options)}`);
      }
      duplicate(identifier) {
        return new ChainableTemplateResult(this.resend.post(`/templates/${identifier}/duplicate`), this.publish.bind(this));
      }
      async publish(identifier) {
        return await this.resend.post(`/templates/${identifier}/publish`);
      }
      async update(identifier, payload) {
        return await this.resend.patch(`/templates/${identifier}`, parseTemplateToApiOptions(payload));
      }
    };
    Topics = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(payload) {
        const { defaultSubscription, ...body } = payload;
        return await this.resend.post("/topics", {
          ...body,
          default_subscription: defaultSubscription
        });
      }
      async list() {
        return await this.resend.get("/topics");
      }
      async get(id) {
        if (!id) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        return await this.resend.get(`/topics/${id}`);
      }
      async update(payload) {
        if (!payload.id) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        return await this.resend.patch(`/topics/${payload.id}`, payload);
      }
      async remove(id) {
        if (!id) return {
          data: null,
          headers: null,
          error: {
            message: "Missing `id` field.",
            statusCode: null,
            name: "missing_required_field"
          }
        };
        return await this.resend.delete(`/topics/${id}`);
      }
    };
    Webhooks = class {
      constructor(resend2) {
        this.resend = resend2;
      }
      async create(payload, options = {}) {
        return await this.resend.post("/webhooks", payload, options);
      }
      async get(id) {
        return await this.resend.get(`/webhooks/${id}`);
      }
      async list(options = {}) {
        const queryString = buildPaginationQuery(options);
        const url = queryString ? `/webhooks?${queryString}` : "/webhooks";
        return await this.resend.get(url);
      }
      async update(id, payload) {
        return await this.resend.patch(`/webhooks/${id}`, payload);
      }
      async remove(id) {
        return await this.resend.delete(`/webhooks/${id}`);
      }
      verify(payload) {
        return new import_svix.Webhook(payload.webhookSecret).verify(payload.payload, {
          "svix-id": payload.headers.id,
          "svix-timestamp": payload.headers.timestamp,
          "svix-signature": payload.headers.signature
        });
      }
    };
    defaultBaseUrl = "https://api.resend.com";
    defaultUserAgent = `resend-node:${version2}`;
    baseUrl = typeof process !== "undefined" && process.env ? process.env.RESEND_BASE_URL || defaultBaseUrl : defaultBaseUrl;
    userAgent = typeof process !== "undefined" && process.env ? process.env.RESEND_USER_AGENT || defaultUserAgent : defaultUserAgent;
    Resend = class {
      constructor(key) {
        this.key = key;
        this.apiKeys = new ApiKeys(this);
        this.segments = new Segments(this);
        this.audiences = this.segments;
        this.batch = new Batch(this);
        this.broadcasts = new Broadcasts(this);
        this.contacts = new Contacts(this);
        this.contactProperties = new ContactProperties(this);
        this.domains = new Domains(this);
        this.emails = new Emails(this);
        this.webhooks = new Webhooks(this);
        this.templates = new Templates(this);
        this.topics = new Topics(this);
        if (!key) {
          if (typeof process !== "undefined" && process.env) this.key = process.env.RESEND_API_KEY;
          if (!this.key) throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
        }
        this.headers = new Headers({
          Authorization: `Bearer ${this.key}`,
          "User-Agent": userAgent,
          "Content-Type": "application/json"
        });
      }
      async fetchRequest(path5, options = {}) {
        try {
          const response = await fetch(`${baseUrl}${path5}`, options);
          if (!response.ok) try {
            const rawError = await response.text();
            return {
              data: null,
              error: JSON.parse(rawError),
              headers: Object.fromEntries(response.headers.entries())
            };
          } catch (err) {
            if (err instanceof SyntaxError) return {
              data: null,
              error: {
                name: "application_error",
                statusCode: response.status,
                message: "Internal server error. We are unable to process your request right now, please try again later."
              },
              headers: Object.fromEntries(response.headers.entries())
            };
            const error = {
              message: response.statusText,
              statusCode: response.status,
              name: "application_error"
            };
            if (err instanceof Error) return {
              data: null,
              error: {
                ...error,
                message: err.message
              },
              headers: Object.fromEntries(response.headers.entries())
            };
            return {
              data: null,
              error,
              headers: Object.fromEntries(response.headers.entries())
            };
          }
          return {
            data: await response.json(),
            error: null,
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch {
          return {
            data: null,
            error: {
              name: "application_error",
              statusCode: null,
              message: "Unable to fetch data. The request could not be resolved."
            },
            headers: null
          };
        }
      }
      async post(path5, entity, options = {}) {
        const headers = new Headers(this.headers);
        if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
        if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
        const requestOptions = {
          method: "POST",
          body: JSON.stringify(entity),
          ...options,
          headers
        };
        return this.fetchRequest(path5, requestOptions);
      }
      async get(path5, options = {}) {
        const headers = new Headers(this.headers);
        if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
        const requestOptions = {
          method: "GET",
          ...options,
          headers
        };
        return this.fetchRequest(path5, requestOptions);
      }
      async put(path5, entity, options = {}) {
        const headers = new Headers(this.headers);
        if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
        const requestOptions = {
          method: "PUT",
          body: JSON.stringify(entity),
          ...options,
          headers
        };
        return this.fetchRequest(path5, requestOptions);
      }
      async patch(path5, entity, options = {}) {
        const headers = new Headers(this.headers);
        if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
        const requestOptions = {
          method: "PATCH",
          body: JSON.stringify(entity),
          ...options,
          headers
        };
        return this.fetchRequest(path5, requestOptions);
      }
      async delete(path5, query) {
        const requestOptions = {
          method: "DELETE",
          body: JSON.stringify(query),
          headers: this.headers
        };
        return this.fetchRequest(path5, requestOptions);
      }
    };
  }
});

// src/lib/email.ts
var email_exports = {};
__export(email_exports, {
  sendTransferCompleteEmail: () => sendTransferCompleteEmail,
  sendVerificationCodeEmail: () => sendVerificationCodeEmail
});
async function sendVerificationCodeEmail(to, code) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV] C\xF3digo de verificaci\xF3n de email para", to, ":", code);
    }
    return { ok: true };
  }
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: "Tu c\xF3digo de verificaci\xF3n - Tickets Transfer",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Verificaci\xF3n de email</h2>
        <p>Tu c\xF3digo de verificaci\xF3n es:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">Este c\xF3digo expira en 10 minutos. Si no solicitaste este c\xF3digo, no hagas nada.</p>
        <p style="color: #64748b; font-size: 12px;">\u2014 Tickets Transfer</p>
      </div>
    `
  });
  if (error) {
    console.error("[Email] Error al enviar:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
async function sendTransferCompleteEmail(to, params) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV] Notificaci\xF3n de pago liberado para", to, params);
    }
    return { ok: true };
  }
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: "Pago liberado - Tickets Transfer",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Pago liberado</h2>
        <p>Se realiz\xF3 la transferencia del pago de tu venta (orden ${params.orderId}).</p>
        <p style="font-size: 20px; font-weight: bold; color: #22c55e;">${params.currency} ${params.amount.toLocaleString("es-AR")}</p>
        <p style="color: #64748b; font-size: 14px;">El dinero deber\xEDa acreditarse en tu cuenta en 1-3 d\xEDas h\xE1biles.</p>
        <p style="color: #64748b; font-size: 12px;">\u2014 Tickets Transfer</p>
      </div>
    `
  });
  if (error) {
    console.error("[Email] Error al enviar notificaci\xF3n de transferencia:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
var resend, FROM_EMAIL;
var init_email = __esm({
  "src/lib/email.ts"() {
    "use strict";
    init_dist();
    resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    FROM_EMAIL = process.env.EMAIL_FROM_VERIFICATION || "Tickets Transfer <onboarding@resend.dev>";
  }
});

// src/lib/sms.ts
var sms_exports = {};
__export(sms_exports, {
  sendVerificationSms: () => sendVerificationSms
});
import twilio from "twilio";
function normalizePhone(phone) {
  let p = phone.replace(/\s/g, "").replace(/-/g, "");
  if (!p.startsWith("+")) {
    if (p.startsWith("0")) p = p.slice(1);
    if (!p.startsWith("54")) p = "54" + p;
    p = "+" + p;
  }
  return p;
}
async function sendVerificationSms(phone, code) {
  if (!client2 || !fromNumber) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[DEV] C\xF3digo de verificaci\xF3n para", phone, ":", code);
      return { ok: true };
    }
    return { ok: false, error: "SMS no configurado. Configur\xE1 Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)." };
  }
  try {
    const to = normalizePhone(phone);
    const body = `Tu c\xF3digo de verificaci\xF3n Tickets Transfer: ${code}. V\xE1lido 10 minutos.`;
    await client2.messages.create({
      body,
      from: fromNumber,
      to
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[SMS] Error al enviar:", e);
    return { ok: false, error: msg };
  }
}
var accountSid, authToken, fromNumber, client2;
var init_sms = __esm({
  "src/lib/sms.ts"() {
    "use strict";
    accountSid = process.env.TWILIO_ACCOUNT_SID;
    authToken = process.env.TWILIO_AUTH_TOKEN;
    fromNumber = process.env.TWILIO_PHONE_NUMBER;
    client2 = accountSid && authToken ? twilio(accountSid, authToken) : null;
  }
});

// src/index.ts
init_firebase_admin();
import "dotenv/config";
import express from "express";
import path4 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// src/routes/auth.ts
init_firebase_admin();
import { createHash } from "crypto";
import { Router } from "express";

// src/lib/firestore.ts
init_firebase_admin();
var db = () => getFirestore();
var COLLECTIONS = {
  USERS: "users",
  EMAIL_VERIFICATION_CODES: "emailVerificationCodes",
  USER_ONBOARDING: "userOnboarding",
  KYC_VERIFICATIONS: "kycVerifications",
  TICKET_LISTINGS: "ticketListings",
  ORDERS: "orders",
  ORDER_RATINGS: "orderRatings",
  DISPUTES: "disputes",
  DISPUTE_MESSAGES: "disputeMessages",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  PLATFORM_SETTINGS: "platformSettings",
  SELLER_TRANSFERS: "sellerTransfers",
  /** Solicitudes de factura por transacción (usuarios → revisión admin). */
  TRANSACTION_INVOICE_REQUESTS: "transactionInvoiceRequests"
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
  const { data, path: path5, errorMaps, issueData } = params;
  const fullPath = [...path5, ...issueData.path || []];
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
  constructor(parent, value, path5, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path5;
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
function isValidIP(ip, version3) {
  if ((version3 === "v4" || !version3) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version3 === "v6" || !version3) && ipv6Regex.test(ip)) {
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
function isValidCidr(ip, version3) {
  if ((version3 === "v4" || !version3) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version3 === "v6" || !version3) && ipv6CidrRegex.test(ip)) {
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
  agreeTerms: external_exports.boolean().refine((v) => v === true, "Debes aceptar la pol\xEDtica de privacidad"),
  isAdmin: external_exports.boolean().optional(),
  role: external_exports.enum(["user", "admin"]).optional()
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
var listingVisibilitySchema = external_exports.enum(["PUBLIC", "PRIVATE"]);
function normalizeEventDate(val) {
  const s = String(val ?? "").trim();
  if (!s) return val;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return val;
}
var createTicketListingSchema = external_exports.object({
  eventName: external_exports.string().min(2, "Nombre del evento requerido"),
  eventDate: external_exports.preprocess(normalizeEventDate, external_exports.string().regex(/^\d{4}-\d{2}-\d{2}/, "Fecha inv\xE1lida (usa AAAA-MM-DD o DD/MM/AAAA)")),
  eventPlace: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  sector: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  row: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  seat: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  quantityEntries: external_exports.union([external_exports.string(), external_exports.number()]).optional(),
  tipoEntrada: tipoEntradaEnum,
  price: external_exports.coerce.number().positive("Precio debe ser positivo"),
  currency: external_exports.string().length(3).default("ARS"),
  ticketera: ticketeraEnum,
  appBoletos: appBoletosEnum,
  orderRef: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  category: external_exports.union([categoriaEventoEnum, external_exports.literal("")]).optional().transform((v) => v === "" ? void 0 : v),
  /** Si no se envía, la API trata la publicación como legada (mismo comportamiento que antes). */
  visibility: listingVisibilitySchema.optional()
});
var updateTicketListingSchema = createTicketListingSchema.partial().extend({
  publicationPassword: external_exports.string().nullable().optional().transform((s) => s === "" ? null : s),
  ticketeraOtra: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  appBoletosOtra: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  tipoEntradaOtro: external_exports.string().optional().transform((s) => s === "" ? void 0 : s)
});
var createOrderSchema = external_exports.object({
  ticketListingId: external_exports.string().min(1, "ID de publicaci\xF3n requerido"),
  paymentMethod: external_exports.enum(["mercadopago", "stripe"]),
  /** Medio principal donde el comprador recibirá la transferencia del ticket */
  deliveryMethod: external_exports.enum(["usuario", "id", "email", "telefono", "otro"]).optional(),
  deliveryUsername: external_exports.string().max(400).optional().transform((s) => s != null && String(s).trim() ? String(s).trim() : void 0),
  deliveryIdNumber: external_exports.string().max(200).optional().transform((s) => s != null && String(s).trim() ? String(s).trim() : void 0),
  deliveryEmail: external_exports.string().max(320).optional().transform((s) => s != null && String(s).trim() ? String(s).trim() : void 0),
  deliveryPhone: external_exports.string().max(40).optional().transform((s) => s != null && String(s).trim() ? String(s).trim() : void 0),
  deliveryOther: external_exports.string().max(500).optional().transform((s) => s != null && String(s).trim() ? String(s).trim() : void 0),
  /** Compatibilidad con clientes que envían un solo texto (p. ej. app móvil antigua con OTRO) */
  deliveryDetail: external_exports.string().max(500).optional().transform((s) => s != null && String(s).trim() ? String(s).trim() : void 0)
});
var confirmReceivedSchema = external_exports.object({
  orderId: external_exports.string().uuid(),
  received: external_exports.boolean()
});
var openDisputeSchema = external_exports.object({
  orderId: external_exports.string().uuid(),
  reason: external_exports.string().min(10, "Describe el motivo de la disputa")
});
var pixelateRegionSchema = external_exports.object({
  x: external_exports.number().min(0).max(1),
  y: external_exports.number().min(0).max(1),
  width: external_exports.number().min(0.01).max(1),
  height: external_exports.number().min(0.01).max(1)
});
var pixelateRegionsSchema = external_exports.array(pixelateRegionSchema).optional();

// src/middleware/auth.ts
init_firebase_admin();
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
function emailDocId(email) {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 32);
}
function toDateSafe(val) {
  if (val == null) return null;
  if (val instanceof Date) return val;
  const v = val;
  if (typeof v.toDate === "function") return v.toDate();
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  return null;
}
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
  const body = parsed.data;
  const isAdmin = body.role === "admin" || body.isAdmin === true;
  const docId = emailDocId(email);
  const verificationDoc = await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).get();
  const verificationData = verificationDoc.data();
  const verifiedDate = toDateSafe(verificationData?.verifiedAt);
  const emailVerified = !!verificationData?.verified && verifiedDate && Date.now() - verifiedDate.getTime() < 15 * 60 * 1e3;
  if (emailVerified) {
    await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).delete();
  }
  const normalizedDateOfBirth = dateOfBirth ? (() => {
    const s = String(dateOfBirth).trim();
    const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const [, d, m, y] = match;
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s.slice(0, 10));
    return null;
  })() : null;
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
    dateOfBirth: normalizedDateOfBirth,
    city: city || null,
    province: province || null,
    postalCode: postalCode || null,
    role: isAdmin ? "admin" : "user",
    emailVerified: emailVerified || false,
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
router.post("/email/send-code", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Email inv\xE1lido" });
    return;
  }
  const usersRef = db().collection(COLLECTIONS.USERS);
  const existing = await usersRef.where("email", "==", email).limit(1).get();
  if (!existing.empty) {
    res.status(409).json({ error: "Ya existe una cuenta con ese email" });
    return;
  }
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  const docId = emailDocId(email);
  await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).set({
    email,
    code,
    expiresAt,
    createdAt: /* @__PURE__ */ new Date()
  });
  const { sendVerificationCodeEmail: sendVerificationCodeEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
  const { ok, error: sendError } = await sendVerificationCodeEmail2(email, code);
  if (!ok) {
    console.error("[Email] Error:", sendError);
    res.status(500).json({ error: "Error al enviar el email. Intent\xE1 de nuevo." });
    return;
  }
  res.json({ ok: true, message: "C\xF3digo enviado" });
});
router.post("/email/verify-code", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : null;
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : null;
  if (!email || !code || code.length !== 6) {
    res.status(400).json({ error: "Email y c\xF3digo de 6 d\xEDgitos requeridos" });
    return;
  }
  const docId = emailDocId(email);
  const doc = await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).get();
  const data = doc.data();
  if (!data || data.email !== email) {
    res.status(400).json({ error: "Solicit\xE1 primero un c\xF3digo de verificaci\xF3n" });
    return;
  }
  const expDate = toDateSafe(data.expiresAt);
  if (!expDate || /* @__PURE__ */ new Date() > expDate) {
    res.status(400).json({ error: "El c\xF3digo expir\xF3. Solicit\xE1 uno nuevo." });
    return;
  }
  if (data.code !== code) {
    res.status(400).json({ error: "C\xF3digo incorrecto" });
    return;
  }
  await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).update({
    verifiedAt: /* @__PURE__ */ new Date(),
    verified: true
  });
  res.json({ ok: true, emailVerified: true });
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
router.get("/email-for-login", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: "Ingres\xE1 email o usuario (m\xEDn. 2 caracteres)" });
    return;
  }
  const usersRef = db().collection(COLLECTIONS.USERS);
  if (q.includes("@")) {
    const email2 = q.toLowerCase();
    const existing = await usersRef.where("email", "==", email2).limit(1).get();
    if (existing.empty) {
      res.status(404).json({ error: "No existe cuenta con ese email" });
      return;
    }
    return res.json({ email: email2 });
  }
  const byUsername = await usersRef.where("username", "==", q).limit(1).get();
  if (byUsername.empty) {
    res.status(404).json({ error: "No existe cuenta con ese usuario" });
    return;
  }
  const email = byUsername.docs[0].data().email;
  res.json({ email });
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
    phoneVerified: data.phoneVerified ?? false,
    emailVerified: data.emailVerified ?? false,
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
init_firebase_admin();

// src/lib/firebase-storage.ts
init_firebase_admin();
import { writeFileSync, mkdirSync as mkdirSync2, existsSync as existsSync2 } from "fs";
import path2 from "path";

// src/lib/uploads.ts
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var uploadsDir = process.env.UPLOADS_PATH || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, "..", "uploads");
function ensureUploadsDir() {
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
}

// src/lib/firebase-storage.ts
var PLACEHOLDER_BUCKET = "tu-proyecto.appspot.com";
var USE_LOCAL = !process.env.VERCEL && process.env.STORAGE_FALLBACK === "local";
function resolveBucketName() {
  const env = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (env && env !== PLACEHOLDER_BUCKET) return env;
  const storage = getStorage();
  const opts = storage.app.options;
  if (opts.storageBucket && opts.storageBucket !== PLACEHOLDER_BUCKET) return opts.storageBucket;
  const projectId = opts.projectId || process.env.GCLOUD_PROJECT;
  if (projectId) {
    return `${projectId}.firebasestorage.app`;
  }
  throw new Error(
    "FIREBASE_STORAGE_BUCKET no configurado. Definilo en .env con el bucket real (ej: tu-proyecto.firebasestorage.app)"
  );
}
function getStorageBucket() {
  const storage = getStorage();
  const bucketName = resolveBucketName();
  return storage.bucket(bucketName);
}
async function uploadFileLocal(filePath, buffer) {
  ensureUploadsDir();
  const fullPath = path2.join(uploadsDir, filePath);
  const dir = path2.dirname(fullPath);
  if (!existsSync2(dir)) mkdirSync2(dir, { recursive: true });
  writeFileSync(fullPath, buffer);
  const baseUrl2 = (process.env.APP_URL || "http://localhost:3001").replace(/\/$/, "");
  return `${baseUrl2}/uploads/${filePath}`;
}
async function uploadFile(filePath, buffer, contentType) {
  if (USE_LOCAL) {
    return uploadFileLocal(filePath, buffer);
  }
  try {
    const bucket = getStorageBucket();
    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType } });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const full = typeof err === "object" && err !== null ? JSON.stringify(err) : msg;
    const isBillingOrBucket = /403|404|accountDisabled|bucket does not exist|billing.*disabled|delinquent/i.test(msg + full);
    if (isBillingOrBucket && USE_LOCAL) {
      console.warn("Firebase Storage fall\xF3 (billing/bucket). Usando almacenamiento local:", msg);
      return uploadFileLocal(filePath, buffer);
    }
    if (isBillingOrBucket && process.env.VERCEL) {
      console.error("En Vercel se requiere Firebase Storage. No se puede usar fallback local.");
    }
    throw err;
  }
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
async function getDiditSessionDecision(sessionId) {
  if (!DIDIT_API_KEY) {
    return { ok: false, status: 0, message: "DIDIT_API_KEY no configurado" };
  }
  if (!sessionId?.trim()) {
    return { ok: false, status: 0, message: "sessionId vac\xEDo" };
  }
  const url = `${DIDIT_BASE}/v3/session/${encodeURIComponent(sessionId.trim())}/decision/`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-Api-Key": DIDIT_API_KEY }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail ?? data.message ?? JSON.stringify(data);
    return {
      ok: false,
      status: res.status,
      message: res.status === 401 ? "API key inv\xE1lida (401). Verific\xE1 DIDIT_API_KEY en Vercel." : res.status === 404 ? `Sesi\xF3n no encontrada en Didit (404). Session ID: ${sessionId.slice(0, 8)}...` : `Didit respondi\xF3 ${res.status}: ${String(detail).slice(0, 200)}`,
      detail: String(detail).slice(0, 300)
    };
  }
  return { ok: true, data };
}
async function updateDiditSessionStatus(sessionId, params) {
  if (!DIDIT_API_KEY) {
    return { ok: false, error: "DIDIT_API_KEY no configurado" };
  }
  if (!sessionId) return { ok: false, error: "sessionId requerido" };
  const res = await fetch(`${DIDIT_BASE}/v3/session/${sessionId}/update-status/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": DIDIT_API_KEY
    },
    body: JSON.stringify({
      new_status: params.new_status,
      ...params.comment && { comment: params.comment },
      ...params.send_email && { send_email: params.send_email },
      ...params.email_address && { email_address: params.email_address },
      ...params.email_language && { email_language: params.email_language }
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.message || "Error Didit";
    return { ok: false, error: msg };
  }
  return { ok: true };
}
function shortenFloats(data) {
  if (Array.isArray(data)) {
    return data.map(shortenFloats);
  }
  if (data !== null && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, shortenFloats(v)])
    );
  }
  if (typeof data === "number" && !Number.isInteger(data) && data % 1 === 0) {
    return Math.trunc(data);
  }
  return data;
}
function sortKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = sortKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}
async function verifyDiditWebhookSignature(rawBody, signature, timestamp, secretKey) {
  if (!signature || !timestamp || !secretKey) return false;
  const WEBHOOK_MAX_AGE_SEC = 300;
  const currentTime = Math.floor(Date.now() / 1e3);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;
  const crypto6 = await import("crypto");
  const hmac = crypto6.createHmac("sha256", secretKey);
  const expectedSignature = hmac.update(rawBody, "utf8").digest("hex");
  try {
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(signature, "utf8");
    return expectedBuf.length === providedBuf.length && crypto6.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}
async function verifyDiditWebhookSignatureV2(jsonBody, signature, timestamp, secretKey) {
  if (!signature || !timestamp || !secretKey) return false;
  const WEBHOOK_MAX_AGE_SEC = 300;
  const currentTime = Math.floor(Date.now() / 1e3);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;
  const processed = shortenFloats(jsonBody);
  const canonical = JSON.stringify(sortKeys(processed));
  const crypto6 = await import("crypto");
  const hmac = crypto6.createHmac("sha256", secretKey);
  const expectedSignature = hmac.update(canonical, "utf8").digest("hex");
  try {
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(signature, "utf8");
    return expectedBuf.length === providedBuf.length && crypto6.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}
async function verifyDiditWebhookSignatureSimple(jsonBody, signature, timestamp, secretKey) {
  if (!signature || !timestamp || !secretKey) return false;
  const WEBHOOK_MAX_AGE_SEC = 300;
  const currentTime = Math.floor(Date.now() / 1e3);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;
  const canonical = [
    String(jsonBody.timestamp ?? ""),
    String(jsonBody.session_id ?? ""),
    String(jsonBody.status ?? ""),
    String(jsonBody.webhook_type ?? "")
  ].join(":");
  const crypto6 = await import("crypto");
  const hmac = crypto6.createHmac("sha256", secretKey);
  const expectedSignature = hmac.update(canonical, "utf8").digest("hex");
  try {
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(signature, "utf8");
    return expectedBuf.length === providedBuf.length && crypto6.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

// src/lib/mercadopago.ts
import crypto5 from "crypto";
import { MercadoPagoConfig, Preference, Payment, Customer } from "mercadopago";

// src/lib/settings.ts
var DEFAULTS = {
  commissionPercentage: 6.5,
  marketplaceHomePublicListingsLimit: 6,
  mercadopago: {
    enabled: false,
    accessToken: "",
    publicKey: "",
    webhookSecret: "",
    sandboxMode: true,
    backUrlBase: "",
    sandboxUsePayerTestCom: false,
    sandboxUseRealEmail: false
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
    marketplaceHomePublicListingsLimit: Math.min(
      50,
      Math.max(1, Number(d.marketplaceHomePublicListingsLimit) || DEFAULTS.marketplaceHomePublicListingsLimit)
    ),
    mercadopago: {
      enabled: d.mercadopago?.enabled ?? DEFAULTS.mercadopago.enabled,
      accessToken: d.mercadopago?.accessToken ?? "",
      publicKey: d.mercadopago?.publicKey ?? "",
      webhookSecret: d.mercadopago?.webhookSecret ?? "",
      sandboxMode: d.mercadopago?.sandboxMode ?? true,
      backUrlBase: d.mercadopago?.backUrlBase ?? "",
      sandboxUsePayerTestCom: d.mercadopago?.sandboxUsePayerTestCom ?? false,
      sandboxUseRealEmail: d.mercadopago?.sandboxUseRealEmail ?? false
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
async function getMarketplaceHomePublicListingsLimit() {
  const s = await getPlatformSettings();
  return s.marketplaceHomePublicListingsLimit;
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
  const sandboxMode = settings.mercadopago.sandboxMode;
  const usePayerTestCom = settings.mercadopago.sandboxUsePayerTestCom;
  const payerEmail = params.payerEmail && sandboxMode && usePayerTestCom ? "test_payer_1@testuser.com" : params.payerEmail && params.payerUserId && sandboxMode ? getCustomerEmailForMp(params.payerUserId, params.payerEmail, true) : params.payerEmail;
  const backBase = settings.mercadopago.backUrlBase || process.env.MOBILE_DEEP_LINK_BASE || process.env.APP_DEEP_LINK_SCHEME || process.env.WEB_URL || "ticketTransfer://";
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
      payer: payerEmail ? { email: payerEmail } : void 0
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
  const hash = crypto5.createHmac("sha256", secret).update(manifest).digest("hex");
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
  const hash = userId.split("").reduce((acc, c) => acc * 31 + c.charCodeAt(0) >>> 0, 0);
  const num = hash % 9999999999 + 1;
  return `test_payer_${num}@testuser.com`;
}
async function getOrCreateCustomer(userId, email, sandboxMode = false) {
  const { customer } = await getMercadoPagoClient();
  const settings = await getPlatformSettings();
  const usePayerTestCom = settings.mercadopago.sandboxUsePayerTestCom;
  const useRealEmail = settings.mercadopago.sandboxUseRealEmail;
  const mpEmail = useRealEmail ? email : sandboxMode && usePayerTestCom ? "test_payer_1@testuser.com" : getCustomerEmailForMp(userId, email, sandboxMode);
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
  const rawCards = Array.isArray(result) ? result : result?.data ?? [];
  const cards = rawCards;
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
  const settings = await getPlatformSettings();
  const sandboxMode = settings.mercadopago.sandboxMode;
  const usePayerTestCom = settings.mercadopago.sandboxUsePayerTestCom;
  const mpPayerEmail = sandboxMode && usePayerTestCom ? "test_payer_1@testuser.com" : params.payerUserId && sandboxMode ? getCustomerEmailForMp(params.payerUserId, params.payerEmail, true) : params.payerEmail;
  const body = {
    transaction_amount: params.amount,
    token: params.token,
    payment_method_id: params.paymentMethodId,
    payer: { email: mpPayerEmail },
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
function profileDateOfBirthToApi(val) {
  if (val == null) return null;
  if (val instanceof Date && !Number.isNaN(val.getTime())) return val.toISOString().slice(0, 10);
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const ts = val;
  if (typeof ts.toDate === "function") {
    const d = ts.toDate();
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const sec = ts.seconds ?? ts._seconds;
  if (typeof sec === "number") {
    const d = new Date(sec * 1e3);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  return null;
}
function profileAddressToApi(data) {
  const direct = typeof data.address === "string" ? data.address.trim() : typeof data.domicilio === "string" ? data.domicilio.trim() : "";
  if (direct) return direct;
  const parts = [data.street, data.streetNumber, data.calle, data.altura].map((p) => typeof p === "string" ? p.trim() : "").filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
router2.use(requireAuth);
function normalizeBiometricMethod(value) {
  if (value === "face" || value === "fingerprint" || value === "device") return value;
  return null;
}
router2.get("/security/biometric-preference", async (req, res) => {
  const userId = req.user.id;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: "No encontrado" });
  const data = userDoc.data();
  res.json({
    biometricEnabled: Boolean(data.biometricEnabled),
    biometricMethod: normalizeBiometricMethod(data.biometricMethod),
    biometricUpdatedAt: data.biometricUpdatedAt ?? null
  });
});
router2.patch("/security/biometric-preference", async (req, res) => {
  const enabled = req.body?.enabled;
  const method = req.body?.method;
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ error: "enabled debe ser boolean" });
  }
  const normalizedMethod = normalizeBiometricMethod(method);
  if (method != null && normalizedMethod == null) {
    return res.status(400).json({ error: "method inv\xE1lido" });
  }
  const userId = req.user.id;
  await db().collection(COLLECTIONS.USERS).doc(userId).set(
    {
      biometricEnabled: enabled,
      biometricMethod: enabled ? normalizedMethod : null,
      biometricUpdatedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    },
    { merge: true }
  );
  return res.json({
    ok: true,
    biometricEnabled: enabled,
    biometricMethod: enabled ? normalizedMethod : null
  });
});
router2.get("/profile", async (req, res) => {
  const userId = req.user.id;
  const [userDoc, kycDoc, firebaseUser] = await Promise.all([
    db().collection(COLLECTIONS.USERS).doc(userId).get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get(),
    getAuth().getUser(userId).catch(() => null)
  ]);
  if (!userDoc.exists) return res.status(404).json({ error: "No encontrado" });
  let data = userDoc.data();
  if (!data.numeroId) {
    const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
    await db().collection(COLLECTIONS.USERS).doc(userId).update({ numeroId, updatedAt: /* @__PURE__ */ new Date() });
    data = { ...data, numeroId };
  }
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  const phone = data.phone?.replace(/\+549\s*\+549/, "+549") ?? data.phone;
  const emailVerified = data.emailVerified ?? firebaseUser?.emailVerified ?? false;
  const raw = data;
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
    emailVerified,
    dateOfBirth: profileDateOfBirthToApi(data.dateOfBirth),
    city: data.city ?? null,
    province: data.province ?? null,
    postalCode: data.postalCode ?? null,
    address: profileAddressToApi(raw),
    reputationScore: data.reputationScore ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    cbuCvu: data.cbuCvu ?? null,
    bankName: data.bankName ?? null,
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
  const { sendVerificationSms: sendVerificationSms2 } = await Promise.resolve().then(() => (init_sms(), sms_exports));
  const result = await sendVerificationSms2(phone, code);
  if (!result.ok) {
    console.error("[SMS] Error al enviar c\xF3digo:", result.error);
    res.status(500).json({ error: "Error al enviar el SMS. Intent\xE1 de nuevo." });
    return;
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
  const path5 = `avatars/${req.user.id}/${Date.now()}.${ext}`;
  const profileImageUrl = await uploadFile(path5, file.buffer, file.mimetype || "image/jpeg");
  await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
    profileImageUrl,
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ profileImageUrl });
});
router2.patch("/profile", async (req, res) => {
  const body = req.body || {};
  const { username, firstName, lastName, phone, city, province, postalCode, address, domicilio, fcmToken, cbuCvu, bankName } = body;
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (firstName !== void 0) updateData.firstName = firstName;
  if (lastName !== void 0) updateData.lastName = lastName;
  if (phone !== void 0) updateData.phone = phone;
  if (city !== void 0) updateData.city = city;
  if (province !== void 0) updateData.province = province;
  if (postalCode !== void 0) updateData.postalCode = postalCode;
  if (address !== void 0 || domicilio !== void 0) {
    const raw = typeof address === "string" ? address : typeof domicilio === "string" ? domicilio : "";
    updateData.address = raw.trim() || null;
  }
  if (fcmToken !== void 0) updateData.fcmToken = fcmToken;
  if (cbuCvu !== void 0) {
    const val = typeof cbuCvu === "string" ? cbuCvu.replace(/\D/g, "").trim() || null : null;
    updateData.cbuCvu = val && val.length === 22 ? val : null;
  }
  if (bankName !== void 0) updateData.bankName = typeof bankName === "string" ? bankName.trim() || null : null;
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
      const path5 = `kyc/${uid}/dni_front_${Date.now()}.jpg`;
      updates.dniFrontUrl = await uploadFile(path5, files.dniFront[0].buffer, files.dniFront[0].mimetype || "image/jpeg");
    }
    if (files.dniBack?.[0]) {
      const path5 = `kyc/${uid}/dni_back_${Date.now()}.jpg`;
      updates.dniBackUrl = await uploadFile(path5, files.dniBack[0].buffer, files.dniBack[0].mimetype || "image/jpeg");
    }
    if (files.selfie?.[0]) {
      const path5 = `kyc/${uid}/selfie_${Date.now()}.jpg`;
      updates.selfieUrl = await uploadFile(path5, files.selfie[0].buffer, files.selfie[0].mimetype || "image/jpeg");
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
    let customerId = userData?.mpCustomerId;
    if (!customerId) {
      customerId = await getOrCreateCustomer(req.user.id, email, settings.mercadopago.sandboxMode);
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
    await db().collection(COLLECTIONS.USERS).doc(req.user.id).update({
      mpCustomerId: customerId,
      updatedAt: /* @__PURE__ */ new Date()
    });
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
init_firebase_admin();

// src/lib/image-redaction.ts
import { Jimp } from "jimp";
var DEFAULT_REGIONS = [
  { x: 0.7, y: 0, width: 0.3, height: 0.28 },
  // Zona típica QR: esquina superior derecha
  { x: 0.08, y: 0.35, width: 0.84, height: 0.18 },
  // Franja central: nombres / datos personales
  { x: 0.08, y: 0.58, width: 0.84, height: 0.12 }
  // Segunda franja: domicilio / referencia
];
var PIXELATE_BLOCK_SIZE = 12;
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function toPixelRegion(region, imgWidth, imgHeight) {
  const x = Math.floor(clamp01(region.x) * imgWidth);
  const y = Math.floor(clamp01(region.y) * imgHeight);
  const w = Math.max(8, Math.floor(clamp01(region.width) * imgWidth));
  const h = Math.max(8, Math.floor(clamp01(region.height) * imgHeight));
  const x2 = Math.min(imgWidth, x + w);
  const y2 = Math.min(imgHeight, y + h);
  return {
    x,
    y,
    w: x2 - x,
    h: y2 - y
  };
}
async function redactImage(buffer, options) {
  const image = await Jimp.read(buffer);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const regions = options?.regions && options.regions.length > 0 ? options.regions : DEFAULT_REGIONS;
  for (const region of regions) {
    const { x, y, w: rw, h: rh } = toPixelRegion(region, w, h);
    if (rw > 0 && rh > 0) {
      image.pixelate({ size: PIXELATE_BLOCK_SIZE, x, y, w: rw, h: rh });
    }
  }
  const outBuffer = await image.getBuffer("image/jpeg", { quality: 90 });
  return { buffer: Buffer.from(outBuffer), mimeType: "image/jpeg" };
}
function parsePixelateRegionsFromBody(body) {
  const raw = body.pixelateRegions ?? body.pixelate_regions;
  if (raw == null) return void 0;
  if (Array.isArray(raw)) {
    return raw.filter(
      (r) => r != null && typeof r === "object" && typeof r.x === "number" && typeof r.y === "number" && typeof r.width === "number" && typeof r.height === "number"
    );
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return void 0;
      return parsed.filter(
        (r) => r != null && typeof r === "object" && typeof r.x === "number" && typeof r.y === "number" && typeof r.width === "number" && typeof r.height === "number"
      );
    } catch {
      return void 0;
    }
  }
  return void 0;
}

// src/routes/tickets.ts
var updateTicketListingSchema2 = createTicketListingSchema.partial().extend({
  publicationPassword: external_exports.string().nullable().optional().transform((s) => s === "" ? null : s),
  ticketeraOtra: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  appBoletosOtra: external_exports.string().optional().transform((s) => s === "" ? void 0 : s),
  tipoEntradaOtro: external_exports.string().optional().transform((s) => s === "" ? void 0 : s)
});
var router3 = Router3();
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
router3.get("/", async (_req, res) => {
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").where("visibility", "==", "PUBLIC").orderBy("createdAt", "desc").limit(50).get();
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
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").where("visibility", "==", "PUBLIC").orderBy("eventDate", "asc").limit(200).get();
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
router3.get("/marketplace/public", async (req, res) => {
  const scope = typeof req.query.scope === "string" ? req.query.scope : "";
  const homeLimit = await getMarketplaceHomePublicListingsLimit();
  const limit = scope === "store" ? 100 : Math.min(100, homeLimit);
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").where("visibility", "==", "PUBLIC").orderBy("createdAt", "desc").limit(limit).get();
  const items = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const sellerData = sellerDoc.data();
      const eventDate = d.eventDate?.toDate?.() ?? d.eventDate;
      const name = sellerData && ([sellerData.firstName, sellerData.lastName].filter(Boolean).join(" ") || sellerData.username || "Vendedor");
      return {
        id: doc.id,
        eventName: d.eventName,
        eventDate,
        eventPlace: d.eventPlace ?? null,
        quantityEntries: d.quantityEntries ?? null,
        seller: sellerData ? {
          id: d.sellerId,
          displayName: name,
          reputationScore: sellerData.reputationScore ?? 0
        } : { id: d.sellerId, displayName: "Vendedor", reputationScore: 0 }
      };
    })
  );
  res.json({ limit, items, scope: scope === "store" ? "store" : "home" });
});
router3.get("/:id", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.status !== "DISPONIBLE") return res.status(404).json({ error: "No encontrado" });
  const password = req.query.password;
  const pubPassword = d.publicationPassword;
  const isPublicListing = d.visibility === "PUBLIC";
  const showFull = isPublicListing || !pubPassword || password != null && password === pubPassword;
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
  delete out.publicationPassword;
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
    const userId = req.user.id;
    const [userDoc, kycDoc, firebaseUser] = await Promise.all([
      db().collection(COLLECTIONS.USERS).doc(userId).get(),
      db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get(),
      getAuth().getUser(userId).catch(() => null)
    ]);
    const userData = userDoc.exists ? userDoc.data() : null;
    const kycData = kycDoc.exists ? kycDoc.data() : null;
    const kycStatus = kycData?.status ?? "PENDIENTE";
    const emailVerified = userData?.emailVerified ?? firebaseUser?.emailVerified ?? false;
    const phoneVerified = userData?.phoneVerified ?? false;
    if (kycStatus !== "APROBADO") {
      res.status(403).json({
        error: "Para publicar tickets deb\xE9s tener la verificaci\xF3n KYC aprobada.",
        code: "KYC_REQUIRED"
      });
      return;
    }
    if (!emailVerified) {
      res.status(403).json({
        error: "Para publicar tickets deb\xE9s tener el email verificado.",
        code: "EMAIL_VERIFICATION_REQUIRED"
      });
      return;
    }
    if (!phoneVerified) {
      res.status(403).json({
        error: "Para publicar tickets deb\xE9s tener el tel\xE9fono verificado.",
        code: "PHONE_VERIFICATION_REQUIRED"
      });
      return;
    }
    const body = { ...req.body, price: req.body.price != null ? Number(req.body.price) : void 0 };
    const parsed = createTicketListingSchema.safeParse(body);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrs = flat.fieldErrors;
      const firstKey = Object.keys(fieldErrs)[0];
      const firstMsg = firstKey ? fieldErrs[firstKey]?.[0] : flat.formErrors?.[0];
      const msg = firstMsg ? `Datos inv\xE1lidos: ${firstMsg}` : "Datos inv\xE1lidos";
      res.status(400).json({ error: msg, details: flat });
      return;
    }
    const files = req.files;
    const listingId = db().collection(COLLECTIONS.TICKET_LISTINGS).doc().id;
    const pixelateRegions = parsePixelateRegionsFromBody(req.body);
    let captureTicketUrl;
    let captureOwnershipUrl;
    if (files.captureTicket?.[0]) {
      const file = files.captureTicket[0];
      const { buffer, mimeType } = await redactImage(file.buffer, {
        regions: pixelateRegions
      });
      captureTicketUrl = await uploadFile(
        `tickets/${listingId}/capture_${Date.now()}.jpg`,
        buffer,
        mimeType
      );
    }
    if (files.captureOwnership?.[0]) {
      const file = files.captureOwnership[0];
      const { buffer, mimeType } = await redactImage(file.buffer, {
        regions: pixelateRegions
      });
      captureOwnershipUrl = await uploadFile(
        `tickets/${listingId}/ownership_${Date.now()}.jpg`,
        buffer,
        mimeType
      );
    }
    let publicationPassword = req.body.publicationPassword?.trim() || null;
    const vis = parsed.data.visibility;
    let visibility;
    if (vis === "PUBLIC") {
      visibility = "PUBLIC";
      publicationPassword = null;
    } else if (vis === "PRIVATE") {
      visibility = "PRIVATE";
      if (!publicationPassword || publicationPassword.length < 4) {
        res.status(400).json({
          error: "Las publicaciones privadas requieren una contrase\xF1a de al menos 4 caracteres.",
          code: "PRIVATE_PASSWORD_REQUIRED"
        });
        return;
      }
    } else {
      visibility = void 0;
    }
    const ticketeraOtra = req.body.ticketeraOtra?.trim() || null;
    const appBoletosOtra = req.body.appBoletosOtra?.trim() || null;
    const tipoEntradaOtro = req.body.tipoEntradaOtro?.trim() || null;
    const quantityEntries = parsed.data.quantityEntries != null ? String(parsed.data.quantityEntries) : null;
    const listingData = {
      sellerId: req.user.id,
      eventName: parsed.data.eventName,
      eventDate: new Date(parsed.data.eventDate),
      eventPlace: parsed.data.eventPlace ?? null,
      sector: parsed.data.sector ?? null,
      row: parsed.data.row ?? null,
      seat: parsed.data.seat ?? null,
      quantityEntries,
      tipoEntrada: parsed.data.tipoEntrada,
      price: parsed.data.price,
      currency: parsed.data.currency ?? "ARS",
      ticketera: parsed.data.ticketera,
      appBoletos: parsed.data.appBoletos,
      orderRef: parsed.data.orderRef ?? null,
      category: parsed.data.category ?? "OTRO",
      status: "DISPONIBLE",
      ...visibility !== void 0 ? { visibility } : {},
      captureTicketUrl: captureTicketUrl ?? null,
      captureOwnershipUrl: captureOwnershipUrl ?? null,
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
router3.get("/mine/:listingId", requireAuth, async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user.id) {
    return res.status(404).json({ error: "No encontrado" });
  }
  const d = doc.data();
  res.json({
    id: doc.id,
    ...d,
    publicationPassword: d.publicationPassword ?? null,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate
  });
});
router3.patch("/mine/:listingId", requireAuth, async (req, res) => {
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).get();
  if (!doc.exists || doc.data()?.sellerId !== req.user.id) {
    return res.status(404).json({ error: "No encontrado" });
  }
  const d = doc.data();
  const parsed = updateTicketListingSchema2.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg = flat.formErrors[0] || "Datos inv\xE1lidos";
    return res.status(400).json({ error: msg, details: flat });
  }
  const payload = parsed.data;
  const updates = { updatedAt: /* @__PURE__ */ new Date() };
  if (payload.eventName !== void 0) updates.eventName = payload.eventName;
  if (payload.eventPlace !== void 0) updates.eventPlace = payload.eventPlace ?? null;
  if (payload.sector !== void 0) updates.sector = payload.sector ?? null;
  if (payload.row !== void 0) updates.row = payload.row ?? null;
  if (payload.seat !== void 0) updates.seat = payload.seat ?? null;
  if (payload.orderRef !== void 0) updates.orderRef = payload.orderRef ?? null;
  if (payload.ticketera !== void 0) updates.ticketera = payload.ticketera;
  if (payload.appBoletos !== void 0) updates.appBoletos = payload.appBoletos;
  if (payload.tipoEntrada !== void 0) updates.tipoEntrada = payload.tipoEntrada;
  if (payload.currency !== void 0) updates.currency = payload.currency;
  if (payload.category !== void 0) updates.category = payload.category ?? null;
  if (payload.ticketeraOtra !== void 0) updates.ticketeraOtra = payload.ticketeraOtra ?? null;
  if (payload.appBoletosOtra !== void 0) updates.appBoletosOtra = payload.appBoletosOtra ?? null;
  if (payload.tipoEntradaOtro !== void 0) updates.tipoEntradaOtro = payload.tipoEntradaOtro ?? null;
  if (payload.eventDate !== void 0) updates.eventDate = new Date(payload.eventDate);
  if (payload.price !== void 0) updates.price = payload.price;
  if (payload.quantityEntries !== void 0) {
    updates.quantityEntries = payload.quantityEntries === "" || payload.quantityEntries == null ? null : String(payload.quantityEntries);
  }
  if (payload.visibility !== void 0) updates.visibility = payload.visibility;
  if (payload.publicationPassword !== void 0) {
    updates.publicationPassword = payload.publicationPassword == null || payload.publicationPassword === "" ? null : String(payload.publicationPassword).trim();
  }
  const nextVis = updates.visibility ?? d.visibility;
  const nextPwd = updates.publicationPassword !== void 0 ? String(updates.publicationPassword ?? "").trim() : String(d.publicationPassword || "").trim();
  if (nextVis === "PUBLIC") {
    updates.visibility = "PUBLIC";
    updates.publicationPassword = null;
  } else if (nextVis === "PRIVATE") {
    if (nextPwd.length < 4) {
      return res.status(400).json({
        error: "Publicaci\xF3n privada: indic\xE1 una contrase\xF1a de al menos 4 caracteres.",
        code: "PRIVATE_PASSWORD_REQUIRED"
      });
    }
  } else {
    const legacyOpen = d.visibility == null && !String(d.publicationPassword || "").trim();
    if (payload.visibility === "PRIVATE") {
      if (nextPwd.length < 4) {
        return res.status(400).json({
          error: "Publicaci\xF3n privada: indic\xE1 una contrase\xF1a de al menos 4 caracteres.",
          code: "PRIVATE_PASSWORD_REQUIRED"
        });
      }
      updates.visibility = "PRIVATE";
    } else if (!legacyOpen && nextPwd.length < 4) {
      return res.status(400).json({
        error: "Publicaci\xF3n privada: indic\xE1 una contrase\xF1a de al menos 4 caracteres.",
        code: "PRIVATE_PASSWORD_REQUIRED"
      });
    } else if (legacyOpen && payload.publicationPassword !== void 0 && nextPwd.length > 0 && nextPwd.length < 4) {
      return res.status(400).json({
        error: "La contrase\xF1a debe tener al menos 4 caracteres.",
        code: "PRIVATE_PASSWORD_REQUIRED"
      });
    }
  }
  const keys = Object.keys(updates).filter((k) => k !== "updatedAt");
  if (keys.length === 0) {
    return res.status(400).json({ error: "Ning\xFAn campo para actualizar" });
  }
  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).update(updates);
  const refreshed = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(req.params.listingId).get();
  const refreshedData = refreshed.data();
  res.json({
    id: refreshed.id,
    ...refreshedData,
    publicationPassword: refreshedData.publicationPassword ?? null,
    createdAt: refreshedData.createdAt?.toDate?.() ?? refreshedData.createdAt,
    updatedAt: refreshedData.updatedAt?.toDate?.() ?? refreshedData.updatedAt,
    eventDate: refreshedData.eventDate?.toDate?.() ?? refreshedData.eventDate
  });
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
function normalizeUid(u) {
  return u == null ? "" : String(u).trim();
}
var createOrderRequestSchema = createOrderSchema.extend({
  deliveryMethod: external_exports.enum(["usuario", "id", "email", "telefono", "otro"]).optional(),
  deliveryUsername: external_exports.string().max(400).optional(),
  deliveryIdNumber: external_exports.string().max(200).optional(),
  deliveryEmail: external_exports.string().max(320).optional(),
  deliveryPhone: external_exports.string().max(40).optional(),
  deliveryOther: external_exports.string().max(500).optional(),
  deliveryDetail: external_exports.string().max(500).optional()
});
function asTrimmedOptionalString(v) {
  if (typeof v !== "string") return void 0;
  const t = v.trim();
  return t.length > 0 ? t : void 0;
}
function asPositiveNumber(v) {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
async function processTransactionInvoiceRequest(req, res, orderIdRaw) {
  const orderId = orderIdRaw.trim();
  if (!orderId) {
    res.status(400).json({ error: "Identificador de orden inv\xE1lido" });
    return;
  }
  const uid = normalizeUid(req.user.id);
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!doc.exists) {
    res.status(404).json({ error: "No encontrado" });
    return;
  }
  const d = doc.data();
  const buyerId = normalizeUid(d.buyerId);
  const sellerId = normalizeUid(d.sellerId);
  if (buyerId !== uid && sellerId !== uid) {
    res.status(404).json({ error: "No encontrado" });
    return;
  }
  const role = buyerId === uid ? "buyer" : "seller";
  const noteRaw = req.body && typeof req.body === "object" ? req.body.note : void 0;
  const note = typeof noteRaw === "string" ? noteRaw.trim().slice(0, 500) : "";
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(String(d.ticketListingId)).get();
  const eventName = listingDoc.exists && listingDoc.data()?.eventName || "";
  const requesterDoc = await db().collection(COLLECTIONS.USERS).doc(uid).get();
  const requesterEmail = requesterDoc.exists ? requesterDoc.data()?.email ?? "" : "";
  const existingSnap = await db().collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS).where("orderId", "==", orderId).get();
  const pendingDup = existingSnap.docs.find((x) => {
    const row = x.data();
    return normalizeUid(row.requestedByUserId) === uid && row.status === "PENDIENTE";
  });
  if (pendingDup) {
    res.json({
      ok: true,
      id: pendingDup.id,
      alreadyExists: true,
      status: "PENDIENTE"
    });
    return;
  }
  const requestId = db().collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS).doc().id;
  await db().collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS).doc(requestId).set({
    id: requestId,
    orderId,
    requestedByUserId: uid,
    requesterEmail,
    role,
    status: "PENDIENTE",
    orderStatus: d.status,
    totalAmount: d.totalAmount,
    currency: d.currency || "ARS",
    eventName,
    note: note || null,
    createdAt: /* @__PURE__ */ new Date()
  });
  res.status(201).json({ ok: true, id: requestId, alreadyExists: false });
}
router4.use(requireAuth);
router4.post("/", async (req, res) => {
  const parsed = createOrderRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.flatten() });
    return;
  }
  const pd = parsed.data;
  const { ticketListingId, paymentMethod } = pd;
  const hasDelivery = pd.deliveryMethod != null || pd.deliveryUsername || pd.deliveryIdNumber || pd.deliveryEmail || pd.deliveryPhone || pd.deliveryOther || pd.deliveryDetail;
  const hasStructuredContact = pd.deliveryUsername || pd.deliveryIdNumber || pd.deliveryEmail || pd.deliveryPhone;
  const inferredDeliveryMethod = pd.deliveryMethod ?? ((pd.deliveryDetail || pd.deliveryOther) && !hasStructuredContact ? "otro" : null);
  const deliveryFields = !hasDelivery ? {} : {
    deliveryMethod: inferredDeliveryMethod,
    deliveryUsername: pd.deliveryUsername ?? null,
    deliveryIdNumber: pd.deliveryIdNumber ?? null,
    deliveryEmail: pd.deliveryEmail ?? null,
    deliveryPhone: pd.deliveryPhone ?? null,
    deliveryOther: pd.deliveryOther ?? null,
    deliveryDetail: pd.deliveryDetail ?? null
  };
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
  const listingPrice = asPositiveNumber(listing.price);
  if (listingPrice == null) {
    res.status(409).json({ error: "La publicaci\xF3n tiene un precio inv\xE1lido. Edit\xE1 y volv\xE9 a publicar el ticket." });
    return;
  }
  const listingCurrency = asTrimmedOptionalString(listing.currency) ?? "ARS";
  const listingEventName = asTrimmedOptionalString(listing.eventName) ?? "Ticket";
  const sellerIdCandidates = [listing.sellerId, listing.userId, listing.seller?.id];
  const sellerId = sellerIdCandidates.find((v) => typeof v === "string" && v.trim().length > 0)?.trim();
  const buyerId = req.user.id.trim();
  if (!sellerId) {
    res.status(409).json({ error: "La publicaci\xF3n no tiene vendedor asignado. Volv\xE9 a publicar el ticket." });
    return;
  }
  if (sellerId === buyerId) {
    res.status(400).json({ error: "No puedes comprar tu propio ticket" });
    return;
  }
  const commissionRate = await getCommissionPercentage() / 100;
  const commissionAmount = listingPrice * commissionRate;
  const totalAmount = listingPrice + commissionAmount;
  const transferDeadline = /* @__PURE__ */ new Date();
  transferDeadline.setHours(transferDeadline.getHours() + HORAS_MAX_TRANSFERENCIA_VENDEDOR);
  const orderId = db().collection(COLLECTIONS.ORDERS).doc().id;
  const orderData = {
    ticketListingId,
    buyerId,
    sellerId,
    status: "PENDIENTE_PAGO",
    totalAmount,
    commissionAmount,
    currency: listingCurrency,
    paymentMethod,
    transferDeadline,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date(),
    ...deliveryFields
  };
  await db().collection(COLLECTIONS.ORDERS).doc(orderId).set(orderData);
  let checkoutUrl;
  if (paymentMethod === "mercadopago" && await isMercadoPagoConfigured()) {
    try {
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
      const { initPoint, preferenceId: prefId } = await createCheckoutPreference({
        orderId,
        title: listingEventName,
        unitPrice: totalAmount,
        quantity: 1,
        currency: listingCurrency,
        payerEmail: buyerDoc.data()?.email,
        payerUserId: req.user.id
      });
      checkoutUrl = initPoint;
      await db().collection(COLLECTIONS.ORDERS).doc(orderId).update({
        mercadopagoPreferenceId: prefId,
        mercadopagoCheckoutUrl: initPoint,
        updatedAt: /* @__PURE__ */ new Date()
      });
    } catch (e) {
      console.error("Error creando preferencia MercadoPago:", e);
      res.status(500).json({ error: "No se pudo iniciar el checkout. Intent? de nuevo." });
      return;
    }
  } else if (paymentMethod === "stripe") {
    res.status(400).json({ error: "Stripe a?n no est? disponible. Us? Mercado Pago." });
    return;
  } else if (paymentMethod === "mercadopago" && !await isMercadoPagoConfigured()) {
    res.status(503).json({ error: "Mercado Pago no est? configurado. Contact? al administrador." });
    return;
  }
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(sellerId).get();
  const order = {
    id: orderId,
    ...orderData,
    ticketListing: { id: listingDoc.id, ...listing },
    seller: { id: sellerId, email: sellerDoc.data()?.email }
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
router4.post("/invoice-request", async (req, res) => {
  const body = req.body;
  const oid = typeof body?.orderId === "string" ? body.orderId : "";
  await processTransactionInvoiceRequest(req, res, oid);
});
router4.get("/:id/checkout-url", async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  if (d.status !== "PENDIENTE_PAGO") return res.status(400).json({ error: "La orden ya no est? pendiente de pago" });
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
        payerEmail: buyerDoc.data()?.email,
        payerUserId: d.buyerId
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
router4.post("/:id/invoice-request", async (req, res) => {
  await processTransactionInvoiceRequest(req, res, req.params.id ?? "");
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
    return res.status(400).json({ error: "La orden ya no est? pendiente de pago" });
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
      payerUserId: req.user.id,
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
      error: 'El pago se confirma al completar el checkout de Mercado Pago. Us? el bot?n "Pagar con Mercado Pago".'
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
  if (typeof req.body?.received !== "boolean") {
    res.status(400).json({ error: "Datos inv\xE1lidos" });
    return;
  }
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  if (d.buyerId !== req.user.id) return res.status(404).json({ error: "No encontrado" });
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({
    status: req.body.received ? "ESPERANDO_CONFIRMACION_COMPRADOR" : d.status,
    buyerConfirmedAt: req.body.received ? /* @__PURE__ */ new Date() : null,
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ ok: true });
});
router4.post("/:id/evidence", upload3.single("evidence"), async (req, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  const d = doc.data();
  const isBuyer = d.buyerId === req.user.id;
  const isSeller = d.sellerId === req.user.id;
  if (!isBuyer && !isSeller) return res.status(404).json({ error: "No encontrado" });
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
  const patch = {
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (isBuyer) {
    patch.buyerEvidenceUrl = evidenceUrl;
    patch.evidenceUrl = evidenceUrl;
    patch.status = "EVIDENCIA_SUBIDA";
  } else {
    patch.sellerEvidenceUrl = evidenceUrl;
  }
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update(patch);
  res.json({ ok: true, status: String(patch.status ?? d.status) });
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
import { FieldValue } from "firebase-admin/firestore";

// src/lib/firebase-messaging.ts
init_firebase_admin();
var INVALID_TOKEN_CODES = [
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token"
];
async function sendPushNotification(fcmToken, title, body, data) {
  if (!fcmToken || fcmToken.length < 10) return { success: false };
  try {
    const messaging = getMessaging();
    const dataPayload = data && Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === void 0 || v === null ? "" : String(v)])
    );
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: dataPayload || {},
      android: { priority: "high" },
      apns: {
        headers: { "apns-priority": "10" },
        payload: { aps: { sound: "default", badge: 1 } }
      }
    };
    await messaging.send(message);
    return { success: true };
  } catch (e) {
    const code = e?.errorInfo?.code;
    if (code && INVALID_TOKEN_CODES.includes(code)) {
      console.warn("Token FCM inv\xE1lido (se eliminar\xE1 del usuario):", code);
      return { success: false, tokenInvalid: true };
    }
    console.error("Error enviando push:", e);
    return { success: false };
  }
}

// src/routes/messages.ts
var router6 = Router6();
router6.use(requireAuth);
router6.use((_req, res, next) => {
  res.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  next();
});
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
          numeroId: other?.numeroId,
          profileImageUrl: other?.profileImageUrl ?? null
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
      numeroId: otherUserData.numeroId,
      profileImageUrl: otherUserData.profileImageUrl ?? null
    },
    createdAt: convData.createdAt?.toDate?.() ?? convData.createdAt
  });
});
router6.get("/conversations/:id", async (req, res) => {
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
  const otherId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
  const otherDoc = await db().collection(COLLECTIONS.USERS).doc(otherId).get();
  const other = otherDoc.data();
  res.json({
    id: convId,
    otherUser: {
      id: otherId,
      email: other?.email,
      firstName: other?.firstName,
      lastName: other?.lastName,
      username: other?.username,
      numeroId: other?.numeroId,
      profileImageUrl: other?.profileImageUrl ?? null
    }
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
  const skipMarkRead = req.query.skipMarkRead === "1" || String(req.query.skipMarkRead).toLowerCase() === "true";
  if (!skipMarkRead) {
    await db().collection(COLLECTIONS.MESSAGES).where("conversationId", "==", convId).where("senderId", "!=", userId).get().then((snap) => {
      const batch = db().batch();
      snap.docs.forEach((d) => {
        if (!d.data().readAt) batch.update(d.ref, { readAt: /* @__PURE__ */ new Date() });
      });
      return batch.commit();
    }).catch(() => {
    });
  }
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
    const pushResult = await sendPushNotification(fcmToken, "Nuevo mensaje", `${senderName}: ${content.trim().slice(0, 50)}`, {
      type: "new_message",
      conversationId: convId
    });
    if (pushResult.tokenInvalid) {
      await db().collection(COLLECTIONS.USERS).doc(recipientId).update({ fcmToken: FieldValue.delete() });
    }
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

// src/lib/payouts.ts
init_email();
function getSellerAmount(totalAmount, commissionAmount) {
  return Math.round((totalAmount - commissionAmount) * 100) / 100;
}
function generateIdempotencyKey(orderId) {
  return `tt-payout-${orderId}-${Date.now()}`;
}
async function createPayoutToSeller(params) {
  const transferId = db().collection(COLLECTIONS.SELLER_TRANSFERS).doc().id;
  const record = {
    orderId: params.orderId,
    sellerId: params.sellerId,
    amount: params.amount,
    currency: params.currency,
    status: "PENDIENTE",
    idempotencyKey: params.idempotencyKey
  };
  const now = /* @__PURE__ */ new Date();
  await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).set({
    ...record,
    createdAt: now,
    updatedAt: now
  });
  const cbuCvu = params.cbuCvu.replace(/\D/g, "");
  if (!cbuCvu || cbuCvu.length !== 22) {
    await updateTransferStatus(transferId, "PENDIENTE_MANUAL", null, "Vendedor sin CBU/CVU registrado");
    return { success: false, transferId, error: "Vendedor sin CBU/CVU. Realizar transferencia manual." };
  }
  try {
    const settings = await getPlatformSettings();
    const token = settings.mercadopago.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      await updateTransferStatus(transferId, "PENDIENTE_MANUAL", null, "MercadoPago no configurado");
      return { success: false, transferId, error: "MercadoPago no configurado" };
    }
    const body = {
      amount: params.amount,
      currency_id: params.currency,
      external_reference: params.orderId,
      description: `Pago al vendedor - Orden ${params.orderId}`,
      beneficiary: {
        entity_type: "individual",
        bank_account: {
          account_holder_name: params.accountHolderName || "Vendedor",
          cbu: cbuCvu
        }
      }
    };
    const response = await fetch("https://api.mercadopago.com/v1/payouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": params.idempotencyKey
      },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.id) {
      await updateTransferStatus(transferId, "ENVIADO", data.id);
      await notifySellerTransferComplete(transferId, params.orderId, params.amount, params.currency);
      return { success: true, transferId, payoutId: data.id };
    }
    const errorMsg = data.message || data.cause?.[0]?.description || `HTTP ${response.status}`;
    await updateTransferStatus(transferId, "FALLIDO", null, errorMsg);
    return { success: false, transferId, error: errorMsg };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Error inesperado";
    await updateTransferStatus(transferId, "PENDIENTE_MANUAL", null, errorMsg);
    return { success: false, transferId, error: errorMsg };
  }
}
async function updateTransferStatus(transferId, status, payoutId, errorMessage) {
  const updates = {
    status,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (payoutId) updates.payoutId = payoutId;
  if (errorMessage !== void 0) updates.errorMessage = errorMessage || null;
  if (status === "COMPLETADO" || status === "ENVIADO" || status === "ENVIADO_MANUAL") {
    updates.completedAt = /* @__PURE__ */ new Date();
  }
  await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).update(updates);
}
async function markTransferAsManualComplete(transferId, adminUserId) {
  const doc = await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).get();
  const t = doc.exists ? doc.data() : null;
  await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).update({
    status: "ENVIADO_MANUAL",
    completedAt: /* @__PURE__ */ new Date(),
    completedBy: adminUserId,
    updatedAt: /* @__PURE__ */ new Date()
  });
  if (t) {
    await notifySellerTransferComplete(transferId, t.orderId, t.amount, t.currency || "ARS");
  }
}
async function notifySellerTransferComplete(transferId, orderId, amount, currency) {
  const doc = await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).get();
  const sellerId = doc.exists ? doc.data()?.sellerId : null;
  if (!sellerId) return;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(sellerId).get();
  const email = userDoc.exists ? userDoc.data()?.email : null;
  if (email) {
    await sendTransferCompleteEmail(email, { orderId, amount, currency });
  }
}
async function retryTransfer(transferId) {
  const doc = await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).get();
  if (!doc.exists) return { success: false, error: "Transferencia no encontrada" };
  const t = doc.data();
  if (t.status !== "FALLIDO" && t.status !== "PENDIENTE_MANUAL") {
    return { success: false, error: "Solo se pueden reintentar transferencias fallidas o pendientes manual" };
  }
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(t.sellerId).get();
  const userData = userDoc.data();
  const cbuCvu = userData?.cbuCvu;
  if (!cbuCvu || typeof cbuCvu !== "string") {
    return { success: false, error: "El vendedor no tiene CBU/CVU registrado" };
  }
  const result = await createPayoutToSeller({
    orderId: t.orderId,
    sellerId: t.sellerId,
    amount: t.amount,
    currency: t.currency || "ARS",
    cbuCvu,
    accountHolderName: userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : void 0,
    idempotencyKey: generateIdempotencyKey(t.orderId)
  });
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error };
}

// src/routes/admin.ts
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
  if (typeof body.marketplaceHomePublicListingsLimit === "number") {
    const n = Math.floor(body.marketplaceHomePublicListingsLimit);
    if (n >= 1 && n <= 50) {
      updates.marketplaceHomePublicListingsLimit = n;
    }
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
      backUrlBase: typeof mp.backUrlBase === "string" ? mp.backUrlBase : current.mercadopago.backUrlBase ?? "",
      sandboxUsePayerTestCom: typeof mp.sandboxUsePayerTestCom === "boolean" ? mp.sandboxUsePayerTestCom : current.mercadopago.sandboxUsePayerTestCom ?? false,
      sandboxUseRealEmail: typeof mp.sandboxUseRealEmail === "boolean" ? mp.sandboxUseRealEmail : current.mercadopago.sandboxUseRealEmail ?? false
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
  const [usersSnap, ordersSnap, disputesSnap, kycSnap, listingsSnap, ordersCompletedSnap, ticketsPendingSnap] = await Promise.all([
    db().collection(COLLECTIONS.USERS).get(),
    db().collection(COLLECTIONS.ORDERS).get(),
    db().collection(COLLECTIONS.DISPUTES).where("status", "in", ["ABIERTA", "EN_REVISION", "ESPERANDO_INFO"]).get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("status", "==", "EN_REVISION").get(),
    db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "DISPONIBLE").get(),
    db().collection(COLLECTIONS.ORDERS).where("status", "==", "COMPLETADA").get(),
    db().collection(COLLECTIONS.TICKET_LISTINGS).where("status", "==", "PENDIENTE_VERIFICACION").get()
  ]);
  res.json({
    usersCount: usersSnap.size,
    ordersCount: ordersSnap.size,
    ordersCompleted: ordersCompletedSnap.size,
    disputesOpen: disputesSnap.size,
    kycPending: kycSnap.size,
    listingsCount: listingsSnap.size,
    ticketsPending: ticketsPendingSnap.size
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
router7.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: "Usuario no encontrado" });
  const d = userDoc.data();
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  const user = {
    id: userDoc.id,
    ...d,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    dateOfBirth: d.dateOfBirth?.toDate?.() ?? d.dateOfBirth,
    kyc: kyc ? {
      status: kyc.status,
      rejectionReason: kyc.rejectionReason,
      diditSessionId: kyc.diditSessionId,
      reviewedAt: kyc.reviewedAt?.toDate?.() ?? kyc.reviewedAt,
      updatedAt: kyc.updatedAt?.toDate?.() ?? kyc.updatedAt
    } : null
  };
  res.json(user);
});
router7.patch("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const body = req.body;
  const docRef = db().collection(COLLECTIONS.USERS).doc(userId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Usuario no encontrado" });
  const updates = { updatedAt: /* @__PURE__ */ new Date() };
  const allowed = [
    "firstName",
    "lastName",
    "username",
    "country",
    "tipoDocumento",
    "documentNumber",
    "sexo",
    "phone",
    "city",
    "province",
    "postalCode",
    "role",
    "reputationScore",
    "cbuCvu",
    "bankName"
  ];
  for (const key of allowed) {
    if (body[key] !== void 0) {
      if (key === "cbuCvu") {
        const val = typeof body[key] === "string" ? body[key].replace(/\D/g, "").trim() || null : null;
        updates[key] = val && val.length === 22 ? val : null;
      } else {
        updates[key] = body[key] === "" || body[key] === null ? null : body[key];
      }
    }
  }
  await docRef.update(updates);
  const updated = await docRef.get();
  const d = updated.data();
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  res.json({
    id: updated.id,
    ...d,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    dateOfBirth: d.dateOfBirth?.toDate?.() ?? d.dateOfBirth,
    kyc: kyc ? { status: kyc.status, rejectionReason: kyc.rejectionReason } : null
  });
});
router7.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id) {
    return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
  }
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  if (!userDoc.exists) return res.status(404).json({ error: "Usuario no encontrado" });
  const { getAuth: getAuth2 } = await Promise.resolve().then(() => (init_firebase_admin(), firebase_admin_exports));
  try {
    await getAuth2().deleteUser(userId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar de Firebase Auth";
    return res.status(500).json({ error: msg });
  }
  await db().collection(COLLECTIONS.USERS).doc(userId).delete();
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).delete();
  res.json({ ok: true });
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
  const [enRevisionSnap, pendienteSnap] = await Promise.all([
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("status", "==", "EN_REVISION").get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("status", "==", "PENDIENTE").get()
  ]);
  const allDocs = [...enRevisionSnap.docs, ...pendienteSnap.docs];
  const filteredDocs = allDocs.filter((doc) => {
    const d = doc.data();
    if (d.status === "EN_REVISION") return true;
    if (d.status === "PENDIENTE") {
      return !!(d.diditSessionId || d.dniFrontUrl || d.dniBackUrl || d.selfieUrl);
    }
    return false;
  });
  const list = await Promise.all(
    filteredDocs.map(async (doc) => {
      const d = doc.data();
      const userDoc = await db().collection(COLLECTIONS.USERS).doc(d.userId || doc.id).get();
      const user = userDoc.data();
      const item = {
        id: doc.id,
        ...d,
        user: user ? { id: userDoc.id, email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
      if (d.diditSessionId) {
        const result = await getDiditSessionDecision(d.diditSessionId);
        item.diditSession = result.ok ? result.data : null;
      }
      return item;
    })
  );
  res.json(list);
});
router7.get("/kyc/:userId/detail", async (req, res) => {
  const { userId } = req.params;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  if (!kycDoc.exists) return res.status(404).json({ error: "Verificaci\xF3n KYC no encontrada" });
  const d = kycDoc.data();
  const sessionId = d.diditSessionId;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  const user = userDoc.exists ? userDoc.data() : null;
  const base = {
    id: userId,
    status: d.status || "PENDIENTE",
    rejectionReason: d.rejectionReason ?? null,
    dniFrontUrl: d.dniFrontUrl ?? null,
    dniBackUrl: d.dniBackUrl ?? null,
    selfieUrl: d.selfieUrl ?? null,
    diditSessionId: sessionId ?? null,
    reviewedAt: d.reviewedAt?.toDate?.() ?? d.reviewedAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    user: user ? { id: userId, email: user.email, firstName: user.firstName, lastName: user.lastName } : null
  };
  if (!sessionId) {
    return res.json({ ...base, hasDiditSession: false, didit: null });
  }
  const result = await getDiditSessionDecision(sessionId);
  res.json({ ...base, hasDiditSession: true, didit: result.ok ? result.data : null });
});
router7.post("/kyc/:userId/sync-didit", async (req, res) => {
  const { userId } = req.params;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  if (!kycDoc.exists) return res.status(404).json({ error: "Verificaci\xF3n KYC no encontrada" });
  const kycData = kycDoc.data();
  const sessionId = kycData.diditSessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "Esta verificaci\xF3n no tiene sesi\xF3n Didit" });
  }
  const result = await getDiditSessionDecision(sessionId);
  if (!result.ok) {
    const status2 = result.status >= 400 ? result.status : 502;
    return res.status(status2).json({ error: result.message });
  }
  const status = result.data.status ?? "";
  const mapStatus = (s) => {
    if (s === "Approved") return "APROBADO";
    if (s === "Declined") return "RECHAZADO";
    if (s === "In Review") return "EN_REVISION";
    return "PENDIENTE";
  };
  const ourStatus = mapStatus(status);
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
    {
      status: ourStatus,
      ...ourStatus === "APROBADO" || ourStatus === "RECHAZADO" ? { reviewedAt: /* @__PURE__ */ new Date() } : {},
      updatedAt: /* @__PURE__ */ new Date()
    },
    { merge: true }
  );
  res.json({
    ok: true,
    status: ourStatus,
    diditStatus: status,
    message: `Sincronizado desde Didit: ${ourStatus}`
  });
});
router7.patch("/kyc/:userId", async (req, res) => {
  const { userId } = req.params;
  const { status, rejectionReason, sendEmail, comment } = req.body;
  if (status !== "APROBADO" && status !== "RECHAZADO" && status !== "RESUBMIT") {
    res.status(400).json({ error: "status debe ser APROBADO, RECHAZADO o RESUBMIT" });
    return;
  }
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  if (!kycDoc.exists) return res.status(404).json({ error: "Verificaci\xF3n KYC no encontrada" });
  const kycData = kycDoc.data();
  const diditSessionId = kycData.diditSessionId;
  if (diditSessionId && (status === "APROBADO" || status === "RECHAZADO" || status === "RESUBMIT")) {
    const diditStatus = status === "APROBADO" ? "Approved" : status === "RECHAZADO" ? "Declined" : "Resubmitted";
    const userDoc2 = await db().collection(COLLECTIONS.USERS).doc(userId).get();
    const userEmail = userDoc2.exists ? userDoc2.data()?.email : void 0;
    const result = await updateDiditSessionStatus(diditSessionId, {
      new_status: diditStatus,
      comment: comment || rejectionReason || (status === "APROBADO" ? "Aprobado manualmente" : status === "RECHAZADO" ? "Rechazado por el administrador" : "Reenviar documentaci\xF3n"),
      send_email: sendEmail === true,
      email_address: sendEmail ? userEmail : void 0,
      email_language: "es"
    });
    if (!result.ok) {
      return res.status(500).json({ error: result.error || "Error al actualizar Didit" });
    }
  }
  if (status !== "RESUBMIT") {
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      {
        status: status === "APROBADO" ? "APROBADO" : "RECHAZADO",
        rejectionReason: status === "RECHAZADO" ? rejectionReason || comment || "Rechazado por el administrador" : null,
        reviewedAt: /* @__PURE__ */ new Date(),
        reviewedBy: req.user.id,
        updatedAt: /* @__PURE__ */ new Date()
      },
      { merge: true }
    );
  } else {
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      { status: "PENDIENTE", rejectionReason: null, updatedAt: /* @__PURE__ */ new Date() },
      { merge: true }
    );
  }
  const updatedKyc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get();
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  res.json({
    ...updatedKyc.data(),
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
router7.get("/tickets/pending", async (_req, res) => {
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).orderBy("createdAt", "desc").limit(200).get();
  const docs = snap.docs.filter((d) => {
    const s = d.data().status;
    return s === "PENDIENTE_VERIFICACION" || s === void 0 || s === null;
  });
  const tickets = await Promise.all(
    docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const seller = sellerDoc.exists ? sellerDoc.data() : null;
      return {
        id: doc.id,
        ...d,
        seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
        eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
    })
  );
  res.json({ tickets });
});
router7.get("/tickets", async (req, res) => {
  const { status, page = "1", limit = "50" } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const statusFilter = typeof status === "string" && status && status !== "TODOS" ? status : null;
  const snap = await db().collection(COLLECTIONS.TICKET_LISTINGS).orderBy("createdAt", "desc").limit(500).get();
  let docs = [...snap.docs];
  if (statusFilter) {
    docs = docs.filter((d) => (d.data().status ?? "PENDIENTE_VERIFICACION") === statusFilter);
  }
  const total = docs.length;
  const skip = (pageNum - 1) * limitNum;
  const paginated = docs.slice(skip, skip + limitNum);
  const tickets = await Promise.all(
    paginated.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const seller = sellerDoc.exists ? sellerDoc.data() : null;
      return {
        id: doc.id,
        ...d,
        seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
        eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
      };
    })
  );
  res.json({ tickets, total });
});
router7.get("/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id).get();
  if (!doc.exists) return res.status(404).json({ error: "Ticket no encontrado" });
  const d = doc.data();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const seller = sellerDoc.exists ? sellerDoc.data() : null;
  res.json({
    id: doc.id,
    ...d,
    seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
  });
});
router7.patch("/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Ticket no encontrado" });
  const updates = { updatedAt: /* @__PURE__ */ new Date() };
  const allowed = ["eventName", "eventDate", "eventPlace", "sector", "row", "seat", "quantityEntries", "tipoEntrada", "tipoEntradaOtro", "price", "currency", "ticketera", "ticketeraOtra", "appBoletos", "appBoletosOtra", "orderRef", "category", "status"];
  for (const key of allowed) {
    if (body[key] !== void 0) {
      if (key === "eventDate" && body[key]) {
        updates[key] = new Date(body[key]);
      } else if (key === "price" && body[key] !== void 0) {
        updates[key] = Number(body[key]);
      } else {
        updates[key] = body[key] === "" || body[key] === null ? null : body[key];
      }
    }
  }
  await docRef.update(updates);
  const updated = await docRef.get();
  const d = updated.data();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const seller = sellerDoc.exists ? sellerDoc.data() : null;
  res.json({
    id: updated.id,
    ...d,
    seller: seller ? { id: d.sellerId, email: seller.email, firstName: seller.firstName, lastName: seller.lastName } : null,
    eventDate: d.eventDate?.toDate?.() ?? d.eventDate,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
  });
});
router7.delete("/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Ticket no encontrado" });
  await docRef.update({
    status: "ELIMINADO",
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ ok: true });
});
router7.patch("/tickets/:id/approve", async (req, res) => {
  const { id } = req.params;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Ticket no encontrado" });
  const data = doc.data();
  const status = data.status ?? "PENDIENTE_VERIFICACION";
  if (status !== "PENDIENTE_VERIFICACION") {
    return res.status(400).json({ error: "El ticket no est\xE1 pendiente de verificaci\xF3n" });
  }
  await docRef.update({
    status: "DISPONIBLE",
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewedBy: req.user.id,
    rejectionReason: null,
    updatedAt: /* @__PURE__ */ new Date()
  });
  const updated = await docRef.get();
  res.json(updated.data());
});
router7.patch("/tickets/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const docRef = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Ticket no encontrado" });
  const data = doc.data();
  const status = data.status ?? "PENDIENTE_VERIFICACION";
  if (status !== "PENDIENTE_VERIFICACION") {
    return res.status(400).json({ error: "El ticket no est\xE1 pendiente de verificaci\xF3n" });
  }
  await docRef.update({
    status: "RECHAZADO",
    rejectionReason: typeof rejectionReason === "string" ? rejectionReason.trim() || "Rechazado por el administrador" : "Rechazado por el administrador",
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewedBy: req.user.id,
    updatedAt: /* @__PURE__ */ new Date()
  });
  const updated = await docRef.get();
  res.json(updated.data());
});
router7.get("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderDoc.exists) return res.status(404).json({ error: "Orden no encontrada" });
  const d = orderDoc.data();
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  const listing = listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null;
  const buyer = buyerDoc.exists ? { id: d.buyerId, ...buyerDoc.data() } : null;
  const seller = sellerDoc.exists ? { id: d.sellerId, ...sellerDoc.data() } : null;
  const disputeDoc = await db().collection(COLLECTIONS.DISPUTES).where("orderId", "==", orderId).limit(1).get();
  const dispute = disputeDoc.empty ? null : { id: disputeDoc.docs[0].id, ...disputeDoc.docs[0].data() };
  res.json({
    id: orderDoc.id,
    ...d,
    ticketListing: listing,
    buyer,
    seller,
    dispute,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline
  });
});
router7.patch("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const body = req.body;
  const docRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Orden no encontrada" });
  const prevData = doc.data();
  const newStatus = body.status;
  const statusBecomesCompleted = newStatus === "COMPLETADA" && prevData.status !== "COMPLETADA";
  const updates = { updatedAt: /* @__PURE__ */ new Date() };
  const allowed = ["status", "totalAmount", "commissionAmount"];
  for (const key of allowed) {
    if (body[key] !== void 0) {
      if (key === "totalAmount" || key === "commissionAmount") {
        updates[key] = Number(body[key]);
      } else {
        updates[key] = body[key];
      }
    }
  }
  await docRef.update(updates);
  const updated = await docRef.get();
  const d = updated.data();
  if (statusBecomesCompleted) {
    const totalAmount = d.totalAmount ?? 0;
    const commissionAmount = d.commissionAmount ?? 0;
    const sellerAmount = getSellerAmount(totalAmount, commissionAmount);
    const sellerId = d.sellerId;
    const currency = d.currency || "ARS";
    const existingTransfer = await db().collection(COLLECTIONS.SELLER_TRANSFERS).where("orderId", "==", orderId).where("status", "in", ["ENVIADO", "COMPLETADO", "ENVIADO_MANUAL"]).limit(1).get();
    if (existingTransfer.empty && sellerAmount > 0) {
      const sellerDoc2 = await db().collection(COLLECTIONS.USERS).doc(sellerId).get();
      const sellerData = sellerDoc2.data();
      const cbuCvu = sellerData?.cbuCvu;
      const result = await createPayoutToSeller({
        orderId,
        sellerId,
        amount: sellerAmount,
        currency,
        cbuCvu: (cbuCvu && typeof cbuCvu === "string" ? cbuCvu : "") || "",
        accountHolderName: sellerData?.firstName && sellerData?.lastName ? `${sellerData.firstName} ${sellerData.lastName}` : void 0,
        idempotencyKey: generateIdempotencyKey(orderId),
        performedBy: req.user.id
      });
      if (result.success) {
        await docRef.update({ sellerTransferId: result.transferId });
      }
    }
  }
  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
  res.json({
    id: updated.id,
    ...d,
    ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
    buyer: buyerDoc.exists ? { email: buyerDoc.data()?.email } : null,
    seller: sellerDoc.exists ? { email: sellerDoc.data()?.email } : null,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt
  });
});
router7.delete("/orders/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const docRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "Orden no encontrada" });
  const data = doc.data();
  const status = data.status ?? "PENDIENTE_PAGO";
  if (status === "COMPLETADA") {
    return res.status(400).json({ error: "No se puede cancelar una orden completada" });
  }
  await docRef.update({
    status: "CANCELADA",
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.json({ ok: true });
});
router7.get("/transfers", async (req, res) => {
  const { page = "1", limit = "30", status } = req.query;
  const pageNum = Number(page);
  const limitNum = Math.min(Number(limit), 100);
  const skip = (pageNum - 1) * limitNum;
  let query = db().collection(COLLECTIONS.SELLER_TRANSFERS).orderBy("createdAt", "desc");
  if (typeof status === "string" && status) {
    query = query.where("status", "==", status);
  }
  const snap = await query.limit(skip + limitNum).get();
  const transfers = await Promise.all(
    snap.docs.slice(skip, skip + limitNum).map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(d.orderId).get();
      return {
        id: doc.id,
        ...d,
        seller: sellerDoc.exists ? { id: d.sellerId, email: sellerDoc.data()?.email, firstName: sellerDoc.data()?.firstName, lastName: sellerDoc.data()?.lastName, cbuCvu: sellerDoc.data()?.cbuCvu } : null,
        order: orderDoc.exists ? { id: d.orderId, totalAmount: orderDoc.data()?.totalAmount } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        completedAt: d.completedAt?.toDate?.() ?? d.completedAt
      };
    })
  );
  res.json({ transfers, total: snap.size });
});
router7.post("/transfers/:transferId/manual-complete", async (req, res) => {
  const { transferId } = req.params;
  await markTransferAsManualComplete(transferId, req.user.id);
  res.json({ ok: true });
});
router7.post("/transfers/:transferId/retry", async (req, res) => {
  const { transferId } = req.params;
  const result = await retryTransfer(transferId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ ok: true });
});
router7.post("/orders/:orderId/transfer-manual", async (req, res) => {
  const { orderId } = req.params;
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!orderDoc.exists) return res.status(404).json({ error: "Orden no encontrada" });
  const orderData = orderDoc.data();
  if (orderData.status !== "COMPLETADA") {
    return res.status(400).json({ error: "Solo se puede crear transferencia manual para \xF3rdenes completadas" });
  }
  const existing = await db().collection(COLLECTIONS.SELLER_TRANSFERS).where("orderId", "==", orderId).limit(1).get();
  if (!existing.empty) {
    const t = existing.docs[0].data();
    if (["ENVIADO", "COMPLETADO", "ENVIADO_MANUAL"].includes(t.status)) {
      return res.status(400).json({ error: "Ya existe una transferencia completada para esta orden" });
    }
  }
  const totalAmount = orderData.totalAmount ?? 0;
  const commissionAmount = orderData.commissionAmount ?? 0;
  const sellerAmount = getSellerAmount(totalAmount, commissionAmount);
  const transferId = db().collection(COLLECTIONS.SELLER_TRANSFERS).doc().id;
  await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).set({
    orderId,
    sellerId: orderData.sellerId,
    amount: sellerAmount,
    currency: orderData.currency || "ARS",
    status: "PENDIENTE_MANUAL",
    idempotencyKey: generateIdempotencyKey(orderId),
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  res.status(201).json({ transferId, amount: sellerAmount, currency: orderData.currency || "ARS" });
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
router7.get("/invoice-requests", async (_req, res) => {
  const snap = await db().collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS).orderBy("createdAt", "desc").limit(500).get();
  const items = snap.docs.map((doc) => {
    const x = doc.data();
    return {
      id: doc.id,
      orderId: x.orderId,
      requestedByUserId: x.requestedByUserId,
      requesterEmail: x.requesterEmail ?? "",
      role: x.role,
      status: x.status ?? "PENDIENTE",
      orderStatus: x.orderStatus,
      totalAmount: x.totalAmount,
      currency: x.currency ?? "ARS",
      eventName: x.eventName ?? "",
      note: x.note ?? null,
      createdAt: x.createdAt?.toDate?.() ?? x.createdAt,
      updatedAt: x.updatedAt?.toDate?.() ?? x.updatedAt ?? null
    };
  });
  res.json({ items });
});
router7.patch("/invoice-requests/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const status = req.body?.status;
  if (status !== "PENDIENTE" && status !== "ATENDIDA") {
    return res.status(400).json({ error: "status debe ser PENDIENTE o ATENDIDA" });
  }
  const docRef = db().collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS).doc(requestId);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: "No encontrado" });
  await docRef.update({ status, updatedAt: /* @__PURE__ */ new Date(), handledByUserId: req.user.id });
  const updated = await docRef.get();
  const x = updated.data();
  res.json({
    id: updated.id,
    ...x,
    createdAt: x.createdAt?.toDate?.() ?? x.createdAt,
    updatedAt: x.updatedAt?.toDate?.() ?? x.updatedAt
  });
});
var adminRouter = router7;

// src/routes/health.ts
init_firebase_admin();
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
  let body;
  try {
    body = rawBody ? JSON.parse(rawBody) : req.body;
  } catch {
    body = req.body;
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "JSON inv\xE1lido" });
  }
  const signature = req.get("x-signature") ?? req.get("X-Signature");
  const signatureV2 = req.get("x-signature-v2") ?? req.get("X-Signature-V2");
  const signatureSimple = req.get("x-signature-simple") ?? req.get("X-Signature-Simple");
  const timestamp = req.get("x-timestamp") ?? req.get("X-Timestamp");
  if (!WEBHOOK_SECRET) {
    console.error("DIDIT_WEBHOOK_SECRET_KEY no configurado");
    return res.status(500).json({ error: "Webhook no configurado" });
  }
  if (!timestamp) {
    return res.status(401).json({ error: "Header X-Timestamp requerido" });
  }
  let isValid2 = false;
  if (rawBody && signature && await verifyDiditWebhookSignature(rawBody, signature, timestamp, WEBHOOK_SECRET)) {
    isValid2 = true;
  } else if (signatureV2 && await verifyDiditWebhookSignatureV2(body, signatureV2, timestamp, WEBHOOK_SECRET)) {
    isValid2 = true;
  } else if (signatureSimple && await verifyDiditWebhookSignatureSimple(body, signatureSimple, timestamp, WEBHOOK_SECRET)) {
    isValid2 = true;
  }
  if (!isValid2) {
    return res.status(401).json({ error: "Firma inv\xE1lida" });
  }
  const { status, vendor_data, session_id } = body;
  let userId = vendor_data ?? null;
  if (!userId && session_id) {
    const bySession = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).where("diditSessionId", "==", session_id).limit(1).get();
    if (!bySession.empty) {
      userId = bySession.docs[0].id;
    }
  }
  if (!userId) {
    return res.status(400).json({ error: "vendor_data o session_id no encontrado" });
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
    let v12 = "";
    for (const part of parts) {
      const [key, val] = part.split("=").map((s) => s.trim());
      if (key === "ts") ts = val;
      if (key === "v1") v12 = val;
    }
    const dataId = paymentId.toLowerCase();
    const isValid2 = verifyMercadoPagoWebhookSignature(dataId, xRequestId, ts, webhookSecret, v12);
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
  const orderRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const orderDoc = await orderRef.get();
  if (orderDoc.exists && orderDoc.data()?.status === "PENDIENTE_PAGO") {
    if (payment.status === "approved") {
      await orderRef.update({
        status: "ESPERANDO_TRANSFERENCIA",
        paymentIntentId: paymentId,
        mercadopagoPaymentId: paymentId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    } else if (payment.status === "pending" || payment.status === "in_process") {
      await orderRef.update({
        mercadopagoPaymentId: paymentId,
        mercadopagoPaymentStatus: payment.status,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
  }
  return res.status(200).json({ received: true });
});
var webhooksRouter = router8;

// src/routes/mercadopago.ts
import { Router as Router10 } from "express";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path3.dirname(fileURLToPath2(import.meta.url));
var router9 = Router10();
router9.get("/public-key", async (_req, res) => {
  try {
    const publicKey = await getMercadoPagoPublicKey();
    res.json({ publicKey });
  } catch (e) {
    res.status(503).json({ error: "Mercado Pago no configurado" });
  }
});
router9.get("/payer-email", requireAuth, async (req, res) => {
  const settings = await getPlatformSettings();
  if (settings.mercadopago.sandboxUseRealEmail) {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user.id).get();
    const email = userDoc.data()?.email;
    if (email && typeof email === "string") {
      return res.json({ payerEmail: email });
    }
  }
  res.json({ payerEmail: "test_payer_1@testuser.com" });
});
router9.get("/card-form", (_req, res) => {
  res.sendFile(path3.join(__dirname2, "..", "public", "card-form.html"));
});
var mercadopagoRouter = router9;

// src/routes/settings.ts
import { Router as Router11 } from "express";
var settingsRouter = Router11();
settingsRouter.get("/commission", requireAuth, async (_req, res) => {
  const commissionPercentage = await getCommissionPercentage();
  res.json({ commissionPercentage });
});
settingsRouter.get("/marketplace-home", requireAuth, async (_req, res) => {
  const homePublicListingsLimit = await getMarketplaceHomePublicListingsLimit();
  res.json({ homePublicListingsLimit });
});

// src/routes/cron.ts
import { Router as Router12 } from "express";
var router10 = Router12();
var CRON_SECRET = process.env.CRON_SECRET;
function isAuthorized(req) {
  if (!CRON_SECRET) return false;
  const auth = req.get("Authorization") || req.get("authorization");
  return auth === `Bearer ${CRON_SECRET}`;
}
router10.get("/retry-failed-transfers", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "No autorizado" });
  }
  const limit = 5;
  const snap = await db().collection(COLLECTIONS.SELLER_TRANSFERS).where("status", "==", "FALLIDO").orderBy("createdAt", "asc").limit(limit).get();
  const results = [];
  for (const doc of snap.docs) {
    const r = await retryTransfer(doc.id);
    results.push({ id: doc.id, success: r.success, error: r.error });
  }
  res.json({
    ok: true,
    processed: results.length,
    results
  });
});
var cronRouter = router10;

// src/index.ts
var isVercel = Boolean(process.env.VERCEL);
var __dirname3 = path4.dirname(fileURLToPath3(import.meta.url));
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
var messagesPathPrefix = "/api/messages";
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 400,
  message: { error: "Demasiadas solicitudes" },
  skip: (req) => req.path.startsWith(messagesPathPrefix)
});
var messagesLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 4e3,
  message: { error: "Demasiadas solicitudes" }
});
app2.use(generalLimiter);
invalidateSettingsCache();
try {
  getFirebaseAdmin();
  console.log("Firebase inicializado");
} catch (e) {
  console.warn("Firebase no configurado. Defin\xED GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON.");
}
if (!isVercel) {
  ensureUploadsDir();
  app2.use(
    "/uploads",
    express.static(uploadsDir, {
      setHeaders: (res) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    })
  );
}
app2.use("/api/health", healthRouter);
app2.use("/api/auth", authRouter);
app2.use("/api/webhooks", webhooksRouter);
app2.use("/api/mercadopago", mercadopagoRouter);
app2.use("/api/settings", settingsRouter);
app2.use("/api/cron", cronRouter);
app2.use("/api/users", usersRouter);
app2.use("/api/tickets", ticketsRouter);
app2.use("/api/orders", ordersRouter);
app2.use("/api/disputes", disputesRouter);
app2.use("/api/messages", messagesLimiter, messagesRouter);
app2.use("/api/admin", adminRouter);
app2.use((_req, res) => {
  res.status(404).json({ error: "No encontrado" });
});
app2.use((err, _req, res) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
var index_default = app2;
if (!isVercel) {
  app2.listen(PORT, () => {
    console.log(`API Tickets Transfer v2 en http://localhost:${PORT}`);
  });
}
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
