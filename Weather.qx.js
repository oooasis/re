const ENDPOINT = "https://weatherkit.pages.dev";
const ORIGIN_RE = /^https?:\/\/weatherkit\.apple\.com/i;
const REASON = { 200: "OK", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
                 404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error",
                 502: "Bad Gateway", 503: "Service Unavailable" };

(function () {
  const src = $request.url || "";
  if (!ORIGIN_RE.test(src)) return $done({});   // 防止 target 等于 src 造成自取

  const headers = {};
  for (const k in $request.headers) {
    if (k.toLowerCase() !== "host") headers[k] = $request.headers[k];
  }

  $task.fetch({ url: src.replace(ORIGIN_RE, ENDPOINT), method: $request.method, headers: headers }).then(
    function (r) {
      const out = {
        status: "HTTP/1.1 " + r.statusCode + " " + (REASON[r.statusCode] || ""),
        headers: r.headers,
      };
      if (r.bodyBytes) out.bodyBytes = r.bodyBytes;
      else if (r.body) out.body = r.body;
      $done(out);
    },
    function (reason) {
      console.log("[WeatherKit.qx] " + reason);
      $done({});
    }
  );
})();
