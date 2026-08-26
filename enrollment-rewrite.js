// Quantumult X：将学籍测试响应改写为“本科 / 在籍”
// 仅修改客户端收到的响应，不会向服务端写入数据。

let body = $response.body || "";

try {
  const trimmed = body.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    // 学籍列表接口返回 JSON，只修改学籍列表，不影响学历、学位等数据。
    const data = JSON.parse(body);
    const list = data && data.data && data.data.xj && data.data.xj.dataList;

    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item && typeof item === "object") {
          item.cc = "本科";
          if (Object.prototype.hasOwnProperty.call(item, "xjzt")) {
            item.xjzt = "在籍";
          }
        }
      });
    }

    body = JSON.stringify(data);
  } else {
    // 学籍详情由服务端把 resultJson 嵌入 HTML；替换其中的层次和学籍状态。
    body = body
      .replace(/("cc"\s*:\s*)"[^"]*"/g, '$1"本科"')
      .replace(/("xjzt"\s*:\s*)"[^"]*"/g, '$1"在籍"');
  }
} catch (error) {
  console.log("enrollment rewrite error: " + error);
}

$done({ body });
