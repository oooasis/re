// Spotify bootstrap / user-customization-service 响应改写（protobuf）
// 只解析到要改的字段，其余字节原样拷贝：不丢未知字段，也不做整包重编码。
// Loon/Surge：binary_body_mode=true，读写 $response.body(Uint8Array)
// QX：读写 $response.bodyBytes(ArrayBuffer)

(() => {
  const isQX = typeof $task !== "undefined";
  const status = $response.status !== undefined ? $response.status : $response.statusCode;
  if (status !== 200) return $done({});

  const raw = isQX ? $response.bodyBytes : $response.body;
  if (!raw || typeof raw === "string") {
    console.log("Spotify: 未拿到二进制 Body，请开启 binary_body_mode");
    return $done({});
  }
  const buf = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  let P = 0; // protobuf 读游标

  const arg = parseArg();
  const ATTRS = {
    ads: boolVal(false),
    "com.spotify.madprops.use.ucs.product.state": boolVal(true),
    "nft-disabled": strVal("1"),
    offline: boolVal(true),
    "player-license": strVal("premium"),
    "streaming-rules": strVal(""),
    type: strVal("premium"),
    "publish-playlist": boolVal(false),
  };
  const ATTR_KEYS = Object.keys(ATTRS).map(ascii);
  // map<string, AccountAttribute> 条目：field 1 { 1 key, 2 value }
  const ATTR_ENTRIES = Object.keys(ATTRS).map((k) =>
    bytes([0x0a, ...lenBytes([0x0a, ...lenBytes(ascii(k)), 0x12, ...lenBytes(ATTRS[k])])]));

  const TAB = { scope: ascii("ios-feature-navigation"), name: ascii("tab_configuration") };
  const SHARE = { scope: ascii("ios-feature-share"), name: ascii("is_useractivity_sharing_enabled") };
  const patchTab = arg.tab, patchShare = !arg.useractivity;

  const only = (f, next) => (g, wt, vs, ve) => g === f && wt === 2 ? sub(g, vs, ve, next) : undefined;

  try {
    const wrapper = only(1, ucsResponse);
    // bootstrap: 2 ucsResponseV0{1 success{1 customization = UcsResponseWrapper}}
    const root = $request.url.includes("/user-customization-service") ? wrapper : only(2, only(1, only(1, wrapper)));
    const body = flatten(rewrite(0, buf.length, root));
    $done(isQX ? { bodyBytes: body.buffer.slice(body.byteOffset, body.byteOffset + body.length) } : { body });
  } catch (e) {
    console.log("Spotify: " + e.message);
    $done({});
  }

  // UcsResponse: 1 resolveSuccess{1 configuration{3 assignedValues[]}}, 3 accountAttributesSuccess{1 map}
  function ucsResponse(f, wt, vs, ve) {
    if (wt !== 2) return;
    if (f === 1 && (patchTab || patchShare)) return sub(f, vs, ve, only(1, assignedValues));
    if (f === 3) return sub(f, vs, ve, (g, w, s, e) => g === 1 && w === 2 && isOverridden(s, e) ? null : undefined, ATTR_ENTRIES);
  }

  function assignedValues(f, wt, vs, ve) {
    if (f === 3 && wt === 2) return assignedValue(vs, ve);
  }

  // AssignedValue: 1 propertyId{1 scope, 2 name}, 3 boolValue{1}, 5 enumValue{1}
  function assignedValue(vs, ve) {
    let ps = -1, pe = -1;
    each(vs, ve, (f, wt, s, e) => { if (f === 1 && wt === 2) { ps = s; pe = e; } });
    if (ps < 0) return;
    if (patchTab && isProperty(ps, pe, TAB))
      return sub(3, vs, ve, (f, wt) => f === 5 && wt === 2 ? lenField(5, [bytes([0x0a, 0x00])]) : undefined, null, true);
    if (patchShare && isProperty(ps, pe, SHARE))
      return sub(3, vs, ve, (f, wt) => f === 3 && wt === 2 ? lenField(3, [bytes([0x08, 0x00])]) : undefined, null, true);
  }

  function isProperty(s, e, want) {
    let scope = false, name = false;
    each(s, e, (f, wt, vs, ve) => {
      if (wt !== 2) return;
      if (f === 1) scope = eq(vs, ve, want.scope);
      else if (f === 2) name = eq(vs, ve, want.name);
    });
    return scope && name;
  }

  function isOverridden(s, e) {
    let hit = false;
    each(s, e, (f, wt, vs, ve) => {
      if (f === 1 && wt === 2) for (const k of ATTR_KEYS) if (eq(vs, ve, k)) { hit = true; break; }
    });
    return hit;
  }

  // ---- protobuf 工具 ----

  function varint() {
    let v = 0, m = 1, b;
    do {
      if (P >= buf.length) throw Error("varint 越界");
      b = buf[P++];
      v += (b & 0x7f) * m;
      m *= 128;
    } while (b & 0x80);
    return v;
  }

  // 逐字段回调 cb(field, wireType, valueStart, valueEnd, fieldStart)，不分配中间对象
  function each(s, e, cb) {
    P = s;
    while (P < e) {
      const start = P, tag = varint(), wt = tag & 7;
      let vs = P;
      if (wt === 0) varint();
      else if (wt === 2) { const n = varint(); vs = P; P += n; }
      else if (wt === 1) P += 8;
      else if (wt === 5) P += 4;
      else throw Error("未知 wire type " + wt);
      if (P > e) throw Error("字段越界");
      const end = P;
      cb(Math.floor(tag / 8), wt, vs, end, start);
      P = end;
    }
  }

  // fn 返回 undefined 保留原字节；null 删除；否则替换。连续保留的字段合并为一段视图
  function rewrite(s, e, fn, extra, wantChange) {
    const parts = [];
    let keep = -1, changed = false;
    each(s, e, (f, wt, vs, ve, start) => {
      const r = fn(f, wt, vs, ve);
      if (r === undefined) { if (keep < 0) keep = start; return; }
      changed = true;
      if (keep >= 0) { parts.push(buf.subarray(keep, start)); keep = -1; }
      if (r !== null) parts.push(r);
    });
    if (wantChange && !changed) return undefined;
    if (keep >= 0) parts.push(buf.subarray(keep, e));
    if (extra) parts.push(...extra);
    return node(parts);
  }

  // wantChange：子消息没有任何改动时返回 undefined，让上层沿用原字节
  function sub(f, vs, ve, fn, extra, wantChange) {
    const n = rewrite(vs, ve, fn, extra, wantChange);
    return n && lenField(f, [n]);
  }

  function node(parts) {
    let length = 0;
    for (const p of parts) length += p.length;
    return { length, parts };
  }

  function lenField(f, parts) {
    const n = node(parts);
    return node([bytes([...vbytes(f * 8 + 2), ...vbytes(n.length)]), n]);
  }

  function flatten(n) {
    const out = new Uint8Array(n.length);
    let o = 0;
    (function w(x) {
      if (x instanceof Uint8Array) { out.set(x, o); o += x.length; }
      else for (const p of x.parts) w(p);
    })(n);
    return out;
  }

  function vbytes(n) {
    const a = [];
    while (n > 127) { a.push((n & 0x7f) | 0x80); n = Math.floor(n / 128); }
    a.push(n);
    return a;
  }

  function eq(s, e, a) {
    if (e - s !== a.length) return false;
    for (let i = 0; i < a.length; i++) if (buf[s + i] !== a[i]) return false;
    return true;
  }

  function ascii(s) { return Array.from(s, (c) => c.charCodeAt(0)); }
  function lenBytes(a) { return [...vbytes(a.length), ...a]; }
  function bytes(a) { return Uint8Array.from(a); }
  function boolVal(b) { return [0x10, b ? 1 : 0]; }
  function strVal(s) { return [0x22, ...lenBytes(ascii(s))]; }

  // 参数：Loon 插件对象 / JSON 字符串 / a=1&b=0；缺省 tab=false, useractivity=true
  function parseArg() {
    let a = typeof $argument !== "undefined" ? $argument : null;
    if (typeof a === "string") {
      try { a = JSON.parse(a); }
      catch (_) { a = Object.fromEntries(a.split("&").map((kv) => kv.split("="))); }
    }
    a = a && typeof a === "object" ? a : {};
    const on = (v, d) => v === undefined || v === null ? d : v === true || v === "true" || v === "1" || v === 1;
    return { tab: on(a.tab, false), useractivity: on(a.useractivity, true) };
  }
})();
