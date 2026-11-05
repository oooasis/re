/**
 * 临时实机测试：WeatherKit 单次请求中继，协商 gzip。
 * 仅用于 Weather.qx.gzip-test.conf；测试结束后删除远程文件。
 * 日志不含 URL、坐标、认证头或响应正文；不重试、不回落 Apple。
 * r2：每条日志带 "v":"r2"，用于确认设备实际运行的是本轮内容而非旧缓存。
 */

const ENDPOINT = "https://weatherkit.pages.dev";
const ORIGIN_RE = /^https?:\/\/weatherkit\.apple\.com(?=\/)/i;
const TIMEOUT_MS = 12000;
const VERSION = "r2";
const REASON = { 200: "OK", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
  404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error",
  502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout" };
const STRIP_REQ = ["host", "connection", "keep-alive", "proxy-connection", "transfer-encoding", "content-length", "accept-encoding"];
const STRIP_RESP = ["connection", "keep-alive", "transfer-encoding", "content-length", "content-encoding"];

function pick(headers, strip) {
  const out = {};
  for (const key in headers) if (strip.indexOf(key.toLowerCase()) < 0) out[key] = headers[key];
  return out;
}
function header(headers, name) {
  for (const key in headers) if (key.toLowerCase() === name) return String(headers[key]);
  return "";
}
function status(code) { return "HTTP/1.1 " + code + " " + (REASON[code] || ""); }
function fail(code, why) {
  return { status: status(code), headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: why }) };
}
function bytesOf(value) {
  if (!value) return null;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (Object.prototype.toString.call(value) === "[object ArrayBuffer]") return new Uint8Array(value);
  return null;
}

// 仅检查根表和 vtable 的边界，不替代完整 WeatherKit 解码。
// vtable 的有符号相对偏移可以为负数（去重后位于表后方）。
function rootIsValid(bytes) {
  if (!bytes || bytes.byteLength < 12) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const root = view.getUint32(0, true);
  if (root < 4 || root > bytes.byteLength - 4) return false;
  const distance = view.getInt32(root, true);
  const vtable = root - distance;
  if (distance === 0 || vtable < 4 || vtable > bytes.byteLength - 4) return false;
  const vtableSize = view.getUint16(vtable, true);
  const objectSize = view.getUint16(vtable + 2, true);
  if (vtableSize < 4 || vtableSize % 2 || objectSize < 4 ||
      vtable + vtableSize > bytes.byteLength || root + objectSize > bytes.byteLength) return false;
  for (let pos = vtable + 4; pos < vtable + vtableSize; pos += 2) {
    const offset = view.getUint16(pos, true);
    if (offset !== 0 && (offset < 4 || offset >= objectSize)) return false;
  }
  return true;
}
function log(record) { console.log("[WeatherKit.gzip.test] " + JSON.stringify(record)); }

(function () {
  const src = $request.url || "";
  if (!ORIGIN_RE.test(src)) return $done({});
  let finished = false;
  function finish(response) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    $done(response);
  }
  const request = {
    url: src.replace(ORIGIN_RE, ENDPOINT),
    method: $request.method || "GET",
    headers: pick($request.headers || {}, STRIP_REQ),
    opts: { "auto-cookie": false }
  };
  request.headers["Accept-Encoding"] = "gzip";
  const timer = setTimeout(function () {
    log({ v: VERSION, result: "TIMEOUT", timeout_ms: TIMEOUT_MS });
    finish(fail(504, "RELAY_TIMEOUT"));
  }, TIMEOUT_MS);

  $task.fetch(request).then(function (response) {
    if (finished) return;
    const code = response && typeof response.statusCode === "number" ? response.statusCode : 502;
    const headers = (response && response.headers) || {};
    const bytes = bytesOf(response && response.bodyBytes);
    const encoding = header(headers, "content-encoding").toLowerCase().trim();
    const declaredLength = header(headers, "content-length");
    const isFlatbuffer = /^application\/vnd\.apple\.flatbuffer(?:\s*;|$)/i.test(header(headers, "content-type"));
    const gzipMagic = !!(bytes && bytes.byteLength >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b);
    const rootValid = isFlatbuffer && code >= 200 && code < 300 ? rootIsValid(bytes) : null;
    const unsupportedEncoding = !!encoding && encoding !== "gzip" && encoding !== "identity";
    const result = gzipMagic ? "RAW_GZIP" : unsupportedEncoding ? "UNSUPPORTED_ENCODING" :
      code < 200 || code >= 300 ? "HTTP_ERROR" : !isFlatbuffer ? "UNEXPECTED_CONTENT_TYPE" :
      !rootValid ? "INVALID_FLATBUFFER_ROOT" : encoding === "gzip" ? "GZIP_DECODED_FLATBUFFER" : "UNCOMPRESSED_FLATBUFFER";
    log({ v: VERSION, result: result, status: code, content_encoding: encoding || "none",
      content_length: /^\d+$/.test(declaredLength) ? Number(declaredLength) : null,
      body_bytes: bytes ? bytes.byteLength : null, gzip_magic: gzipMagic, root_valid: rootValid });
    if (gzipMagic || unsupportedEncoding) return finish(fail(502, "RELAY_ENCODING_UNSUPPORTED"));
    if (isFlatbuffer && code >= 200 && code < 300 && !rootValid) return finish(fail(502, "RELAY_INVALID_BODY"));
    const out = { status: status(code), headers: pick(headers, STRIP_RESP) };
    if (response && response.bodyBytes) out.bodyBytes = response.bodyBytes;
    else if (response && response.body) out.body = response.body;
    finish(out);
  }, function () {
    if (finished) return;
    log({ v: VERSION, result: "FETCH_FAILED" });
    finish(fail(502, "RELAY_FAILED"));
  });
})();
