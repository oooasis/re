// Spotify bootstrap / customize 响应改写（protobuf）
// 改写逻辑与 daozen/rules js/spotify-proto.js 一致；
// 不加载 protobufjs，只解析到目标字段，其余字节原样拷贝。
// Loon/Surge：binary_body_mode=true，读写 $response.body(Uint8Array)
// QX：读写 $response.bodyBytes(ArrayBuffer)

(() => {
  const isQX = typeof $task !== "undefined";
  const status = $response.status !== undefined ? $response.status : $response.statusCode;
  const url = $request.url;
  const isBoot = url.includes("bootstrap/v1/bootstrap");
  if (status !== 200 || $request.method !== "POST" || (!isBoot && !url.includes("user-customization-service/v1/customize")))
    return $done({});

  const raw = isQX ? $response.bodyBytes : $response.body;
  if (!raw || typeof raw === "string") {
    console.log("Spotify: 未拿到二进制 Body，请开启 binary_body_mode");
    return $done({});
  }
  const buf = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  let P = 0; // protobuf 读游标
  let TXT = null; // 整包 latin1 文本，按需构建一次

  const now = Date.now();
  const expiry = new Date(now + 365 * 24 * 60 * 60 * 1000).toISOString();

  // AccountAttribute: 2 bool, 3 int64, 4 string
  const B = (v) => [0x10, v ? 1 : 0], L = (v) => [0x18, ...vbytes(v)], S = (v) => [0x22, ...lenBytes(ascii(v))];
  const ATTRS = {
    "player-license": S("premium"),
    "player-license-v2": S("premium"),
    mobile: B(true),
    "streaming-rules": S(""),
    "financial-product": S("pr:premium,tc:0"),
    "license-acceptance-grace-days": L(30),
    "mobile-login": B(true),
    name: S("Spotify Premium"),
    "on-demand": B(true),
    ads: B(false),
    catalogue: S("premium"),
    "high-bitrate": B(true),
    libspotify: B(true),
    "nft-disabled": S("1"),
    "shuffle-eligible": B(true),
    "audio-quality": S("1"),
    offline: B(true),
    "pause-after": L(0),
    can_use_superbird: B(true),
    type: S("premium"),
    "social-session": B(true),
    "social-session-free-tier": B(false),
    unrestricted: B(true),
    "product-expiry": S(expiry),
    "subscription-enddate": S(expiry),
    "is-eligible-premium-unboxing": B(true),
    "com.spotify.madprops.use.ucs.product.state": B(true),
  };
  const ATTR_DROP = new Set(Object.keys(ATTRS).concat(["ad-use-adlogic", "ad-catalogues", "payment-state", "last-premium-activation-date", "shuffle"]));
  // map 条目：field 1 { 1 key, 2 value }
  const ATTR_ENTRIES = Object.keys(ATTRS).map((k) => bytes(len(1, [...len(1, ascii(k)), ...len(2, ATTRS[k])])));

  // AssignedValue 改值：bool → field 3 {1 bool}；enum → field 5 {1 string}
  const SET = new Map(Object.entries({
    enable_pick_and_shuffle_common_capping: len(5, len(1, ascii("Disabled"))),
    enable_pick_and_shuffle_dynamic_cap: len(3, [0x08, 0]),
    enable_playback_timeout_service: len(3, [0x08, 0]),
    enable_playback_timeout_error_ui: len(3, [0x08, 0]),
    playback_timeout_action: len(5, len(1, ascii("Nothing"))),
    is_enabled_for_on_demand_trial: len(3, [0x08, 1]),
    enable_call_trials_facade: len(3, [0x08, 1]),
    shuffle_eligible: len(3, [0x08, 1]),
    shuffle_enabled: len(3, [0x08, 1]),
  }));
  const REMOVE_NAMES = new Set([
    "enable_common_capping", "enable_pns_common_capping", "enable_pick_and_shuffle_common_capping",
    "enable_pick_and_shuffle_dynamic_cap", "enable_free_on_demand_experiment",
    "enable_free_on_demand_context_menu_experiment", "pick_and_shuffle_timecap", "enable_mft_plus_queue",
    "enable_mft_plus_extended_queue", "is_remove_from_queue_enabled_for_mft_plus",
    "is_reordering_for_mft_plus_allowed", "should_nova_scroll_use_scrollsita", "enable_sillywalk_rules",
    "is_premium_only", "init_retry_amount", "enable_upsell",
  ]);
  const REMOVE_SCOPES = new Set([
    "ios-feature-queue", "core-common-capping", "ios-feature-shuffletoggleupsell", "ios-system-smartshuffle",
    "ios-feature-audiobook-capping", "core-audiobook-sequence-provider-feature", "ios-feature-smartshuffle",
    "ios-feature-upsell",
  ]);
  const KEYWORDS = /upsell|capping|timecap|limit|restrict|shuffle_eligible_toggle|pick_and_shuffle|premium_only|reinventfree/i;

  let set = 0, removed = 0;
  try {
    const out = isBoot
      // BootstrapResponse: 2 ucsResponseV0{1 success{1 customization}}，3 trialsFacadeResponseV1 删除
      ? rewrite(0, buf.length, (f, wt, vs, ve) =>
          f === 3 ? null
          : f === 2 && wt === 2 ? lenField(2, rewrite(vs, ve, (g, w, s, e) =>
              g === 1 && w === 2 ? lenField(1, rewrite(s, e, (h, x, s2, e2) =>
                h === 1 && x === 2 ? lenField(1, wrapper(s2, e2)) : undefined)) : undefined))
          : undefined)
      : wrapper(0, buf.length);
    const body = flatten(out);
    console.log(`Spotify: ${isBoot ? "bootstrap" : "customize"} 改值 ${set}，移除 ${removed}`);
    $done(isQX ? { bodyBytes: body.buffer.slice(body.byteOffset, body.byteOffset + body.length) } : { body });
  } catch (e) {
    console.log("Spotify: " + e.message);
    $done({});
  }

  // UcsResponseWrapper: 1 success(UcsResponse)；没有 success 时补一个
  function wrapper(s, e) {
    let has = false;
    return rewrite(s, e, (f, wt, vs, ve) => {
      if (f === 1 && wt === 2) { has = true; return lenField(1, ucs(vs, ve)); }
    }, () => has ? [] : [lenField(1, ucs(0, 0))]);
  }

  // UcsResponse: 1 resolveSuccess{1 configuration}，3 accountAttributesSuccess{1 map}，5 fetchTimeMillis
  function ucs(s, e) {
    let hasAttrs = false;
    return rewrite(s, e, (f, wt, vs, ve) => {
      if (f === 5) return null;
      if (wt !== 2) return;
      if (f === 1) return lenField(1, rewrite(vs, ve, (g, w, s2, e2) => g === 1 && w === 2 ? lenField(1, config(s2, e2)) : undefined));
      if (f === 3) { hasAttrs = true; return lenField(3, attrs(vs, ve)); }
    }, () => [...(hasAttrs ? [] : [lenField(3, attrs(0, 0))]), bytes(varField(5, now))]);
  }

  function attrs(s, e) {
    return rewrite(s, e, (f, wt, vs, ve) => f === 1 && wt === 2 && ATTR_DROP.has(mapKey(vs, ve)) ? null : undefined, () => ATTR_ENTRIES);
  }

  // Configuration: 1 configurationAssignmentId，2 fetchTimeMillis，3 assignedValues[]
  function config(s, e) {
    return rewrite(s, e, (f, wt, vs, ve) => {
      if (f === 1 || f === 2) return null;
      if (f === 3 && wt === 2) return assigned(vs, ve);
    }, () => [bytes(len(1, ascii("premium-fixed-id-2025"))), bytes(varField(2, now))]);
  }

  // AssignedValue: 1 propertyId{1 scope, 2 name}，3 bool / 4 int / 5 enum（oneof）
  function assigned(s, e) {
    let scope = "", name = "";
    each(s, e, (f, wt, vs, ve) => {
      if (f === 1 && wt === 2) each(vs, ve, (g, w, a, b) => {
        if (w !== 2) return;
        if (g === 1) scope = str(a, b);
        else if (g === 2) name = str(a, b);
      });
    });
    const v = SET.get(name);
    if (v) {
      set++;
      return lenField(3, rewrite(s, e, (f) => f === 3 || f === 4 || f === 5 ? null : undefined, () => [bytes(v)]));
    }
    if (REMOVE_SCOPES.has(scope) || REMOVE_NAMES.has(name) || KEYWORDS.test(scope ? scope + "/" + name : name)) {
      removed++;
      return null;
    }
  }

  // ---- protobuf 工具 ----
  function varint() {
    if (P >= buf.length) throw Error("varint 越界");
    if (buf[P] < 0x80) return buf[P++];
    let v = 0, m = 1, b;
    do {
      if (P >= buf.length) throw Error("varint 越界");
      b = buf[P++];
      v += (b & 0x7f) * m;
      m *= 128;
    } while (b & 0x80);
    return v;
  }

  // 逐字段回调 cb(field, wireType, valueStart, valueEnd, fieldStart)
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
  function rewrite(s, e, fn, extra) {
    const parts = [];
    let keep = -1;
    each(s, e, (f, wt, vs, ve, start) => {
      const r = fn(f, wt, vs, ve);
      if (r === undefined) { if (keep < 0) keep = start; return; }
      if (keep >= 0) { parts.push(buf.subarray(keep, start)); keep = -1; }
      if (r !== null) parts.push(r);
    });
    if (keep >= 0) parts.push(buf.subarray(keep, e));
    if (extra) parts.push(...extra());
    return node(parts);
  }

  function node(parts) {
    let length = 0;
    for (const p of parts) length += p.length;
    return { length, parts };
  }

  function lenField(f, n) {
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

  function mapKey(s, e) {
    let k;
    each(s, e, (f, wt, vs, ve) => { if (f === 1 && wt === 2) k = str(vs, ve); });
    return k;
  }

  // 键名、属性名均为 ASCII
  function str(s, e) {
    if (TXT === null) {
      const c = [];
      for (let i = 0; i < buf.length; i += 8192) c.push(String.fromCharCode.apply(null, buf.subarray(i, i + 8192)));
      TXT = c.join("");
    }
    return TXT.slice(s, e);
  }

  function vbytes(n) {
    const a = [];
    while (n > 127) { a.push((n % 128) | 0x80); n = Math.floor(n / 128); }
    a.push(n);
    return a;
  }

  function len(f, a) { return [...vbytes(f * 8 + 2), ...vbytes(a.length), ...a]; }
  function varField(f, v) { return [...vbytes(f * 8), ...vbytes(v)]; }
  function lenBytes(a) { return [...vbytes(a.length), ...a]; }
  function ascii(s) { return Array.from(s, (c) => c.charCodeAt(0)); }
  function bytes(a) { return Uint8Array.from(a); }
})();
