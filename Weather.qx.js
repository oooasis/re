/**
 * iRingo WeatherKit (Rewrite) —— Quantumult X 版
 *
 * QX 没有 Surge/Loon 的 header 内部改写类型，改用 script-echo-response：
 * QX 不去连 Apple，由脚本带着原始请求头（含 Authorization: Bearer <JWT>）
 * 向 weatherkit.pages.dev 取回响应原样返回。
 *
 * 与上游 Rewrite 版行为一致：端点不可用时不回落 Apple。
 * 完整背景见同目录 README.md。
 */

const ENDPOINT   = "https://weatherkit.pages.dev";
const ORIGIN_RE  = /^https?:\/\/weatherkit\.apple\.com/i;
const TIMEOUT_MS = 12000;   // 超时前给客户端一个干净的 504，避免脚本引擎超时报错
const RETRY      = 1;       // 仅网络层失败重试一次；HTTP 4xx/5xx 不重试

const REASON = { 200: "OK", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
                 404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error",
                 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout" };

// 逐跳头（RFC 9110 §7.6.1）与长度/编码头在中继时必须剥掉；长度由 QX 按实际 body 重算
const STRIP_REQ  = ["host", "connection", "keep-alive", "proxy-connection", "transfer-encoding", "content-length", "accept-encoding"];
const STRIP_RESP = ["connection", "keep-alive", "transfer-encoding", "content-length", "content-encoding"];

function pick(h, strip) {
  const o = {};
  for (const k in h) if (strip.indexOf(k.toLowerCase()) < 0) o[k] = h[k];
  return o;
}
function status(code) { return "HTTP/1.1 " + code + " " + (REASON[code] || ""); }
function fail(code, why) {
  return { status: status(code), headers: { "Content-Type": "application/json" }, body: '{"reason":"' + why + '"}' };
}

(function () {
  const src = $request.url || "";
  if (!ORIGIN_RE.test(src)) return $done({});   // 防止 target 等于 src 造成自取

  let finished = false;
  function finish(resp) { if (finished) return; finished = true; $done(resp); }

  const req = {
    url: src.replace(ORIGIN_RE, ENDPOINT),
    method: $request.method || "GET",
    headers: pick($request.headers || {}, STRIP_REQ),
    opts: { "auto-cookie": false }              // 无状态中继，不攒 cookie（build ≥ 934）
  };
  req.headers["Accept-Encoding"] = "identity";  // 让上游发未压缩体，消除 $task.fetch 是否解压的歧义

  const timer = setTimeout(function () {
    console.log("[WeatherKit.qx] timeout " + TIMEOUT_MS + "ms " + req.url);
    finish(fail(504, "RELAY_TIMEOUT"));
  }, TIMEOUT_MS);

  function attempt(left) {
    $task.fetch(req).then(
      function (r) {
        clearTimeout(timer);
        const code = (r && typeof r.statusCode === "number") ? r.statusCode : 502;
        const out  = { status: status(code), headers: pick((r && r.headers) || {}, STRIP_RESP) };
        if (r && r.bodyBytes) out.bodyBytes = r.bodyBytes;
        else if (r && r.body) out.body = r.body;
        finish(out);
      },
      function (reason) {
        const msg = (reason && reason.error) ? reason.error : String(reason);   // 官方样例：reason.error
        if (left > 0 && !finished) {
          console.log("[WeatherKit.qx] retry after: " + msg);
          return attempt(left - 1);
        }
        clearTimeout(timer);
        console.log("[WeatherKit.qx] fetch failed: " + msg);
        finish(fail(502, "RELAY_FAILED"));
      }
    );
  }
  attempt(RETRY);
})();
