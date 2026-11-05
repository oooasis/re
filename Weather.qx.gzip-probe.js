/**
 * QX gzip 手动探针：只请求固定的公开文件，不使用天气 URL、坐标或 JWT。
 * 在 Quantumult X 中手动运行一次，查看 [QX.gzip.probe] 日志。
 * 不要将此文件绑定到日常重写或周期任务。
 */
(function () {
  const URL = "https://raw.githubusercontent.com/oooasis/re/f2dc8f87493eee34df9ff6fe621f3a46af9d5cc7/Weather.qx.js";
  const EXPECTED_BYTES = 3205;
  let finished = false;
  const timer = setTimeout(function () { finish("TIMEOUT"); }, 18000);

  function log(value) { console.log("[QX.gzip.probe] " + JSON.stringify(value)); }
  function finish(result, error) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    log({ result: result, error: error || undefined });
    $done();
  }
  function header(headers, name) {
    for (const key in headers) if (key.toLowerCase() === name) return String(headers[key]);
    return "";
  }
  function bytes(response) {
    if (response.bodyBytes instanceof ArrayBuffer) return new Uint8Array(response.bodyBytes);
    if (ArrayBuffer.isView(response.bodyBytes)) {
      const body = response.bodyBytes;
      return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    }
    throw new Error("MISSING_BODY_BYTES");
  }
  function equal(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function request(encoding) {
    return $task.fetch({
      url: URL,
      method: "GET",
      headers: { "Accept-Encoding": encoding },
      opts: { "auto-cookie": false }
    }).then(function (response) {
      if (finished) return;
      const body = bytes(response);
      const headers = response.headers || {};
      const info = {
        phase: encoding,
        status: response.statusCode,
        content_encoding: header(headers, "content-encoding") || "none",
        content_length: header(headers, "content-length") || "unknown",
        body_bytes: body.length,
        gzip_magic: body[0] === 0x1f && body[1] === 0x8b
      };
      log(info);
      if (response.statusCode !== 200) throw new Error("HTTP_" + response.statusCode);
      return { body: body, info: info };
    });
  }

  request("identity").then(function (baseline) {
    if (finished || !baseline) return;
    if (baseline.info.gzip_magic || baseline.body.length !== EXPECTED_BYTES) {
      finish("INVALID_BASELINE");
      return;
    }
    return request("gzip").then(function (encoded) {
      if (finished || !encoded) return;
      if (encoded.info.gzip_magic) return finish("RAW_GZIP_BYTES");
      if (!equal(baseline.body, encoded.body)) return finish("BODY_MISMATCH");
      if (/\bgzip\b/i.test(encoded.info.content_encoding)) return finish("AUTO_DECOMPRESSED");
      const declared = Number(encoded.info.content_length);
      if (declared > 0 && declared < encoded.body.length) return finish("DECOMPRESSION_INDICATED_CHECK_HAR");
      finish("MATCH_BUT_GZIP_NOT_PROVEN");
    });
  }).catch(function (reason) {
    if (finished) return;
    finish("FAILED", reason && reason.error ? String(reason.error) : String(reason));
  });
})();
