// Soul 私聊阅后即焚照片：取出原图地址推送通知（带预览，点开看原图），响应原样放行
// 逻辑取自 ishowshu/qx script/soul.js 的 /snapchat/url 分支

(() => {
  try {
    const obj = JSON.parse($response.body);
    const img = obj && obj.data && obj.data.url;
    if (typeof img === "string" && img) {
      if (typeof $notification !== "undefined")
        $notification.post("Soul 阅后即焚", "点击查看原图", img, { openUrl: img, mediaUrl: img });
      else if (typeof $notify !== "undefined")
        $notify("Soul 阅后即焚", "点击查看原图", img, { "open-url": img, "media-url": img });
    }
  } catch (e) {
    console.log("Soul snapchat: " + e.message);
  }
  $done({});
})();
