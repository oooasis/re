#!name = MyBlockAds
#!desc = 去广告合集，以下app请使用单独配置文件：高德地图,哔哩哔哩,网易云音乐,微博,YouTube,知乎

# > bishengke
^https?:\/\/res\.pizzahut\.com\.cn\/CRM\/phad\/apphome\/apphome url reject
# > dangdang
^https?:\/\/api\.dangdang\.com\/mapi\d\/mobile\/init url reject
# > dingdongmaicai
^https?:\/\/maicai\.api\.ddxq\.mobi\/advert\/ url reject
# > didichuxing
https?://res\.xiaojukeji\.com\/resapi\/activity\/mget url reject
https?:\/\/res\.xiaojukeji\.com\/resapi\/activity\/get(Ruled|Preload|PasMultiNotices) url reject
# > dewu
^https:\/\/app\.dewu\.com\/api\/v1\/app\/advertisement\/ url reject
# > damai
^https?:\/\/acs\.m\.taobao\.com\/gw\/mtop\.damai\.wireless\.home\.welcome url reject
# > guojiadili
^https?:\/\/dili\.bdatu\.com\/jiekou\/ad url reject
^https?:\/\/wap\.ngchina\.cn\/news\/adverts url reject
# > huazhu
^https?:\/\/appapi\.huazhu\.com:\d{4}\/client\/app\/getAppStartPage\/ url reject
# > hanglvzongheng
^https?:\/\/(discardrp|startup)\.umetrip\.com\/gateway\/api\/umetrip\/native url reject
# > iQiYi
^https?:\/\/.*cupid\.iqiyi\.com\/mixer\? url script-response-body https://github.com/ddgksf2013/Scripts/raw/master/iqiyi_open_ads.js
# > kuake
^https?:\/\/open-cms-api\.uc\.cn\/open-cms url script-response-body https://raw.githubusercontent.com/ddgksf2013/Scripts/master/quark.js
# > pupu
^https?:\/\/j1\.pupuapi\.com\/client\/marketing\/banner\/v7\?position url reject
# > QuNaEr
https://homefront.qunar.com/front/splash/ad url reject
^https?:\/\/client\.qunar\.com\/pitcher-proxy\?qrt=p_splashAd 
# > shaoshupai
https://ios.sspai.com/api/v3/recommend/page/get\?ad.*ios_home_modal url reject
# > ShunFeng
^https?:\/\/ccsp-egmas\.sf-express\.com\/cx-app-base\/base\/app\/appVersion\/detectionUpgrade url reject
https://ccsp-egmas.sf-express.com/cx-app-base/base/app/ad/queryInfoFlow url script-response-body https://github.com/ddgksf2013/Scripts/raw/master/shunfeng_json.js
https://ccsp-egmas.sf-express.com/cx-app-base/base/app/ad/queryAdImages url reject
^https?:\/\/shopic\.sf-express\.com\/crm\/mobile\/common\/flashscreen url reject
# > shihuo
^https?:\/\/sh-gateway\.shihuo\.cn\/v\d\/services\/sh-adapi\/home\/(screen|ad) url reject
# > suning
^https?:\/\/mpcs\.suning\.com\/mpcs\/dm\/getDmInfo url reject
# > shanmu
^https?:\/\/api-sams\.walmartmobile\.cn\/api\/v1\/sams\/sams-user\/(window\/getGoUpPlus|screen_promotion\/get) url reject
# > topwidget
https://top-widgets-api.xiaozujian.com/api/ad/config url reject
# > weipinhui
^https?:\/\/mapi\.appvipshop\.com\/vips-mobile\/rest\/activity\/advertisement\/get url reject
https://b.appsimg.com/upload/momin/ url reject
https://mapi.appvipshop.com/vips-mobile/rest/activity/advertisement/get url reject
^https:\/\/mapi\.appvipshop\.com\/vips-mobile\/rest\/iosAdInfo\/report url reject
# > WangYiYouXiang
^https?:\/\/appconf\.mail\.163\.com\/mmad\/get\.do url reject
^https?:\/\/client\.mail\.163.com\/apptrack\/confinfo\/(searchMultiAds.do|showAds.do) url reject
# > zhuanzhuan
^https?:\/\/app\.zhuanzhuan\.com\/zzx\/transfer\/getConfigInfo url reject
# > zuoyebang
^https?:\/\/syh\.zybang\.com\/com\/adx\/ url reject

# ======= 0 ======= #
# 12306 开屏广告 //ad.12306.cn
^https:\/\/ad\.12306\.cn\/ad\/ser\/getAdList url script-analyze-echo-response https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/12306.js
# 58同城 //*.58cdn.com.cn, app.58.com, pic?.ajkimg.com
^https:\/\/app\.58\.com\/api\/home\/(advertising|appadv) url reject
^https:\/\/app\.58\.com\/api\/home\/invite\/popupAdv url reject
^https:\/\/app\.58\.com\/api\/log\/ url reject
^https:\/\/pic\d\.ajkimg\.com\/mat\/\w+\?imageMogr\d\/format\/jpg\/thumbnail\/\d{3}x\d{4}$ url reject
^https:\/\/.+\.58cdn\.com\.cn\/brandads url reject
# > Weifeng
^https?:\/\/api\.wfdata\.club\/v2\/yesfeng\/(infoCenterAd|yesList) url reject
# > XieCheng
^https:\/\/ma-adx\.ctrip\.com\/_ma\.gif url reject
^https:\/\/mbd\.baidu\.com\/newspage\/api\/getmobads\?page\=landingshare url reject
# > xiangrikui
^https?:\/\/client-api\.oray\.com\/materials\/SLCC_IOS_STARTUP\?lang=zh-Hans-CN url reject
# > yonghui
^https?:\/\/api\.yonghuivip\.com\/web\/shensuan\/ad\/getAd url reject
# > jianhanglife
^https?:\/\/yunbusiness\.ccb\.com\/clp_service\/txCtrl\?txcode=A3341A00(2|9) url reject
# ======= A ======= #
# 爱回收 //gw.aihuishou.com
^https:\/\/gw.aihuishou.com\/app-portal\/home\/getadvertisement url reject
# 阿里巴巴 //acs.m.taobao.com, gw.alicdn.com, heic.alicdn.com
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.alibaba\.advertisementservice\.getadv url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.alimama\.etao\.config\.query\/.+?etao_advertise url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.alimusic\.common\.mobileservice\.startinit url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.etao\.noah\.query\/.+tao_splash url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.film\.mtopadvertiseapi\.queryadvertise url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.o2o\.ad\.gateway\.get url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.taobao\.idle\.home\.welcome url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.trip\.activity\.querytmsresources url reject
^https:\/\/gw\.alicdn\.com\/imgextra\/i\d\/[\w!]+-\d-tps-702-758\.png url reject-dict
^https:\/\/(gw|heic)\.alicdn\.com\/imgextra\/i\d\/\d*\/?[\w!]+-\d-(octopus|tps-1125-1602)\.jpg_(1\d{3}|9\d{2})x(1\d{3}|9\d{2})q[59]0 url reject-dict

# CSDN //app-gw.csdn.net
^https:\/\/app-gw\.csdn\.net\/cms-app\/v\d\/home_page\/open_advertisement url reject

# ======= D ======= #
# 豆瓣 //api.douban.com
^https:\/\/api\.douban\.com\/v2\/app_ads\/splash url reject
^https:\/\/api\.douban\.com\b.*\/common_ads\? url reject

# ======= E ======= #
# 饿了么 //elemecdn.com, fuss10.elemecdn.com, www1.elecfans.com
^https:\/\/elemecdn.com\/.+\/sitemap url reject
^https:\/\/fuss10.elemecdn.com\/.+\/w\/640\/h\/\d{3,4} url reject
^https:\/\/fuss10.elemecdn.com\/.+\/w\/750\/h\/\d{3,4} url reject
^https:\/\/fuss10.elemecdn.com\/.+\.mp4 url reject
^https:\/\/www1.elecfans.com\/www\/delivery url reject

# ======= J ====== #
# 建设银行
^http:\/\/image1\.ccb\.com\/newsinfo\/eBranch\/check\/nf\/newfin\/activity\/xjr_\w+\.png$ url reject
^http:\/\/imageadv\.ccb\.com\/adpic\/(nctm\/ad|sszserver\/upload\/activity)\/\d{8}\/\w+\.(gif|png|jpg)$ url reject
# 简书跳过重定向页面以直接访问 //links.jianshu.com, www.jianshu.com
^https:\/\/links\.jianshu\.com\/go\?to= url script-echo-response https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/noRedirect.js
^https:\/\/www\.jianshu\.com\/go-wild\?ac=\d&url= url script-echo-response https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/noRedirect.js
# 京东 //api.m.jd.com
^https:\/\/api\.m\.jd\.com\/client\.action\?functionId=start url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/myBlockAds.js
^https:\/\/api\.m\.jd\.com\/client\.action\?functionId=queryMaterialAdverts url reject
# 京东极速版 //api.m.jd.com
^https:\/\/api\.m\.jd\.com\/client\.action\?functionId=lite_advertising url response-body jdLiteAdvertisingVO response-body rucu6
# 交管12123 //gab.122.gov.cn
^https:\/\/gab\.122\.gov\.cn\/eapp\/m\/sysquery\/adver$ url reject

# ======= K ======= #
# 肯德基 //res.kfc.com.cn
^https:\/\/res\.kfc\.com\.cn\/advertisement url reject
# 酷安 //api.coolapk.com
^https:\/\/api\.coolapk\.com\/v6\/feed\/(detail|replyList)\? url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/coolapk.js
^https:\/\/api\.coolapk\.com\/v6\/main\/(dataList|indexV8)\? url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/coolapk.js
^https:\/\/api\.coolapk\.com\/v6\/page\/dataList\? url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/coolapk.js
^https:\/\/api\.coolapk\.com\/v6\/search\?.*type=hotSearch url reject-dict

# ======= M ====== #
# 美团 & 美团外卖//flowplus.meituan.net, img.meituan.net, s3plus.meituan.net
^http:\/\/wmapi\.meituan\.com\/api\/v7\/(loadInfo|openscreen|startpicture)\? url reject-dict
^https:\/\/flowplus\.meituan\.net\/v1\/mss_\w+\/linglong\/\d+\.jpg url reject-dict
^https:\/\/img\.meituan\.net\/bizad\/bizad_brandCpt_\d+\.jpg url reject-dict
^https:\/\/s3plus\.meituan\.net\/v1\/mss_\w+\/(brandcpt-vedio|waimai-alita)\/\w+\.zip$ url reject-dict

# ======= P ====== #
# 拼多多 //api.pinduoduo.com, api.yangkeduo.com
^https:\/\/api\.(pinduoduo|yangkeduo)\.com\/api\/cappuccino\/splash url reject

# ======= T ====== #
# 贴吧全面去广告 //tiebac.baidu.com
^http:\/\/c\.tieba\.baidu\.com\/c\/f\/(excellent\/personalized|frs\/(generalTabList|page|threadlist)|pb\/(pic)?page)$ url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/baidu/tiebaJson.js
^http:\/\/c\.tieba\.baidu\.com\/c\/f\/(excellent\/personalized|frs\/(generalTabList|page|threadlist)|pb\/(pic)?page)\?cmd url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/baidu/tiebaProto.js
^http:\/\/c\.tieba\.baidu\.com\/c\/s\/sync$ url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/baidu/tiebaJson.js
^https:\/\/tiebac\.baidu\.com\/tiebaads\/commonbatch\? url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/baidu/tiebaJson.js

# ======= W ====== #
# 网上国网app屏蔽e享家 //ehome.esgcc.com.cn
https:\/\/ehome\.esgcc\.com\.cn\/mobile\/$ url reject
# 微信 //mp.weixin.qq.com, weixin110.qq.com, security.wechat.com
## 移除公众号中的推广内容 //mp.weixin.qq.com
^https:\/\/mp\.weixin\.qq\.com\/mp\/(cps_product_info|getappmsgad|relatedarticle)\? url reject-dict
## 跳过微信中转页面,解除被封禁链接 //weixin110.qq.com, security.wechat.com
^https\:\/\/(weixin110\.qq|security\.wechat)\.com\/cgi-bin\/mmspamsupport-bin\/newredirectconfirmcgi\? url script-response-body https://raw.githubusercontent.com/RuCu6/QuanX/main/Scripts/wechat/wechat110.js

# ======= X ====== #
# 闲鱼 //gw.alicdn.com, acs.m.taobao.com
^https:\/\/gw\.alicdn\.com\/mt\/ url reject
^https:\/\/gw\.alicdn\.com\/tfs\/.+\d{3,4}-\d{4} url reject
^https:\/\/gw\.alicdn\.com\/tps\/.+\d{3,4}-\d{4} url reject
^https:\/\/acs\.m\.taobao\.com\/gw\/mtop\.taobao\.idle\.home\.welcome url reject
## 米家 //home.mi.com
^https:\/\/home\.mi\.com\/cgi-op\/api\/v1\/recommendation\/(banner|myTab)\? url reject-dict

# ======= Y ====== #
# 云闪付 //wallet.95516.com
^https:\/\/wallet\.95516\.com(:10533)?\/s\/wl\/icon\/large\/1 url reject

# ======= Z ====== #
# 中国移动 //clientaccess.10086.cn, wap.js.10086.cn
^https:\/\/clientaccess\.10086\.cn\/biz-orange\/DN\/init\/startInit url reject
^https:\/\/wap\.js\.10086\.cn\/jsmccClient\/cd\/market_content\/api\/v\d\/market_content\.page\.query url reject

hostname = ad.12306.cn, *.58cdn.com.cn, app.58.com, pic?.ajkimg.com, gw.aihuishou.com, acs.m.taobao.com, gw.alicdn.com, heic.alicdn.com,app-gw.csdn.net, api.douban.com, elemecdn.com, fuss10.elemecdn.com, www1.elecfans.com, links.jianshu.com, www.jianshu.com, api.m.jd.com, gab.122.gov.cn, res.kfc.com.cn, api.coolapk.com, flowplus.meituan.net, img.meituan.net, s3plus.meituan.net, api.pinduoduo.com, api.yangkeduo.com, tiebac.baidu.com, ehome.esgcc.com.cn, mp.weixin.qq.com, weixin110.qq.com, security.wechat.com, home.mi.com, wallet.95516.com, clientaccess.10086.cn, wap.js.10086.cn, res.pizzahut.com.cn, api.dangdang.com, maicai.api.ddxq.mobi, app.dewu.com, dili.bdatu.com, appapi.huazhu.com, discardrp.umetrip.com, startup.umetrip.com, *cupid.iqiyi.com, open-cms-api.uc.cn, j1.pupuapi.com, homefront.qunar.com, client.qunar.com, ios.sspai.com, ccsp-egmas.sf-express.com, sh-gateway.shihuo.cn, mpcs.suning.com, api-sams.walmartmobile.cn, top-widgets-api.xiaozujian.com,  mapi.appvipshop.com, b.appsimg.com, appconf.mail.163.com, client.mail.163.com, app.zhuanzhuan.com, syh.zybang.com
