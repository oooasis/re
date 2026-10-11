// Soul 私聊：解除私聊限制 + 阅后即焚照片推送原图
// 逻辑取自 ishowshu/qx script/soul.js 的 /chat/limitInfo、/snapchat/url 分支

(() => {
  const url = $request.url;
  try {
    const obj = JSON.parse($response.body);
    const data = obj && obj.data;

    if (url.includes("/chat/limitInfo")) {
      if (!data) return $done({});
      for (const k of ["subMsg", "extMsg", "abValue", "freeEquityStatus", "msg", "remainFreeCount", "type"]) delete data[k];
      data.limit = false;
      return $done({ body: JSON.stringify(obj) });
    }

    if (url.includes("/snapchat/url")) {
      const img = data && data.url;
      if (typeof img === "string" && img) {
        if (typeof $notification !== "undefined")
          $notification.post("Soul 阅后即焚", "点击查看原图", img, { openUrl: img, mediaUrl: img });
        else if (typeof $notify !== "undefined")
          $notify("Soul 阅后即焚", "点击查看原图", img, { "open-url": img, "media-url": img });
      }
    }
  } catch (e) {
    console.log("Soul chat: " + e.message);
  }
  $done({});
})();
