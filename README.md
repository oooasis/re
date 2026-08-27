# re

Quantumult X / Loon 自用重写与分流资源。**扁平结构，不建子目录** —— 文件路径即 raw 地址，
移动会让设备上引用的链接全部失效。

raw 地址前缀：

```
https://raw.githubusercontent.com/oooasis/re/refs/heads/main/<文件名>
```

## 自己维护的

| 文件 | 用途 | 备注 |
|---|---|---|
| `rewrite-demo.conf` | 学信网学籍显示改写 | 依赖 `enrollment-rewrite.js`，两者不可分开移动 |
| `enrollment-rewrite.js` | 上面那条的响应改写脚本 | 只改客户端收到的响应，不写服务端 |
| `u净.conf` | 智能洗衣房 去黑名单校验 | 1 条规则 |
| `Weather.qx.conf` | iRingo WeatherKit Rewrite 版 —— QX 实现 | 依赖 `Weather.qx.js`；4 条正则与上游 `iRingo.WeatherKit.Rewrite.lpx` 逐字一致 |
| `Weather.qx.js` | 上面那条的中继脚本 | `script-echo-response` + `$task.fetch`，1.5 KB |
| `ChinaMobile.qx.conf` | 中国移动 去开屏广告 | 取自 Loon `ChinaMobile.lpx` 的 `[Rewrite]` 段，正则逐字未改；MITM 2 台 |
| `xhs.conf` | 小红书 去首页视频（排除法） | 通配符 + 排除 9 台，与显式 6 台等价 |
| `spotfiy.conf` | Spotify 改写 | 文件名有拼写错误，因可能已被引用故未改名 |
| `Spotify.Crack.Dev.modified.js` | Spotify 脚本 | |
| `apple_ota.list` | 屏蔽系统更新推送 | 2 行 |

## 第三方资源的副本

都有上游，留作离线备份。上游更新时本副本不会跟随。

| 文件 | 来源 |
|---|---|
| `Global.list` | DivineEngine/Profiles |
| `StartUp.conf` | 墨鱼去开屏 V2.0 @ddgksf2013 |
| `整合.txt` | 广告拦截合集 @奶思 (fmz200/wool_scripts) |
| `GoofishAds.conf` | 闲鱼 @奶思 |
| `didi.snippet` | 滴滴出行 @树先生 |
| `Didichuxing.snippet` | 滴滴出行 @怎么肥事（与上面重复，来源不同） |
| `adr.conf` / `adrr.conf` / `adv.txt` | 去广告合集 |
| `proxy.conf` | DOMAIN-KEYWORD 分流列表 |

## 已失效

| 文件 | 说明 |
|---|---|
| `xiaohongsh.conf` | 小红书早期版，实测不生效，已被 `xhs.conf` 取代 |

## 清理记录

2026-08-27 删除：

- `A-pure-rewrite-nojs.conf` —— WeatherKit 方案 A，实测 QX 不按改写后的 Host 重选上游
- `iRingo.WeatherKit.302.qx.conf` —— 302 版，实测响应 0 字节（跨域 302 丢 Authorization）
- `weatherkit` —— 307 版，指向 `weatherkit.nanocat.cloud`，同样是 307 的死路
- `AB-alias-host-nojs.TEST.conf` —— DNS alias + Host 改写，实测 Cloudflare 拒绝 Apple SNI，未采用
- `lenke.js` —— 含已过期（2025-10-31）的阿里云 AccessKey / SecurityToken

> `lenke.js` 的凭证仍保留在 git 历史中。要彻底清除需改写历史。
