/**
 * iRingo WeatherKit —— Rewrite 版的 Quantumult X 等价实现
 *
 * 背景：官方 Rewrite 版靠 Surge/Loon 的 `header` 类型做内部 URL 改写，
 *       把请求原样（含 Authorization: Bearer <JWT>）转到 weatherkit.pages.dev。
 *       QX 没有这个重写类型：
 *         - `url 302/307` 是客户端可见跳转，跨域会被剥离 Authorization
 *         - `script-request-header` 的 $done 只能改 path，改不了目标主机
 *       所以改用 script-echo-response：QX 不去连 Apple，
 *       由脚本用 $task.fetch 直接向 pages.dev 取回响应，请求头原样透传。
 *
 * 依赖的官方 API（均来自 crossutility/Quantumult-X 示例）：
 *   $request.url / .method / .headers          sample-rewrite-request-header.js
 *   $done({status, headers, body})             sample-echo-response.js
 *   $task.fetch({url,method,headers}) → bodyBytes   sample-bytes-rewrite.js
 *
 * 注意：WeatherKit 响应是 FlatBuffer 二进制，必须走 bodyBytes，不能用 body。
 */

const ENDPOINT = "https://weatherkit.pages.dev";
const ORIGIN_RE = /^https?:\/\/weatherkit\.apple\.com/i;

function statusLine(code) {
  const t = { 200: "OK", 204: "No Content", 400: "Bad Request", 401: "Unauthorized",
              403: "Forbidden", 404: "Not Found", 429: "Too Many Requests",
              500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable" };
  return "HTTP/1.1 " + code + " " + (t[code] || "");
}

(function () {
  const src = $request.url || "";
  if (!ORIGIN_RE.test(src)) return $done({});   // 不该我管，放行

  // 复制请求头，去掉 Host —— 否则可能覆盖 fetch 目标的 Host
  const headers = {};
  for (const k in $request.headers) {
    if (k.toLowerCase() === "host") continue;
    headers[k] = $request.headers[k];
  }

  const target = src.replace(ORIGIN_RE, ENDPOINT);

  $task.fetch({ url: target, method: $request.method || "GET", headers: headers }).then(
    (r) => {
      const out = { status: statusLine(r.statusCode), headers: r.headers };
      if (r.bodyBytes) out.bodyBytes = r.bodyBytes;
      else if (r.body) out.body = r.body;
      $done(out);
    },
    (reason) => {
      console.log("[iRingo.WeatherKit.qx] fetch 失败: " + reason);
      $done({});   // 失败则回落，QX 正常请求 Apple
    }
  );
})();
