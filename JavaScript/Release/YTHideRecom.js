// ==UserScript==
// @name         YouTube Hide Tool
// @name:zh-TW   YouTube 隱藏工具
// @name:zh-CN   YouTube 隐藏工具
// @name:ja      YouTube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @version      0.0.29
// @author       HentaiSaru
// @description         該腳本能夠自動隱藏 YouTube 影片結尾的推薦卡，當滑鼠懸浮於影片上方時，推薦卡會恢復顯示。並額外提供快捷鍵切換功能，可隱藏留言區、影片推薦、功能列表，及切換至極簡模式。設置會自動保存，並在下次開啟影片時自動套用。
// @description:zh-TW   該腳本能夠自動隱藏 YouTube 影片結尾的推薦卡，當滑鼠懸浮於影片上方時，推薦卡會恢復顯示。並額外提供快捷鍵切換功能，可隱藏留言區、影片推薦、功能列表，及切換至極簡模式。設置會自動保存，並在下次開啟影片時自動套用。
// @description:zh-CN   该脚本能够自动隐藏 YouTube 视频结尾的推荐卡，在鼠标悬停于视频上方时，推荐卡会恢复显示。并额外提供快捷键切换功能，可隐藏评论区、视频推荐、功能列表，并切换至极简模式。设置会自动保存，并在下次打开视频时自动应用。
// @description:ja      このスクリプトは、YouTube动画の终わりに表示される推奨カードを自动的に非表示にし、マウスがビデオ上にホバーされると、推奨カードが再表示されます。さらに、ショートカットキーでコメントセクション、动画の推奨、机能リストを非表示に切り替える机能が追加されており、シンプルモードに切り替えることもできます。设定は自动的に保存され、次回ビデオを开くと自动的に适用されます。
// @description:ko      이 스크립트는 YouTube 동영상 끝에 나오는 추천 카드를 자동으로 숨기고, 마우스가 비디오 위에 머무를 때 추천 카드가 다시 나타납니다. 또한, 댓글 섹션, 비디오 추천, 기능 목록을 숨기고 최소 모드로 전환하는 단축키를 제공합니다. 설정은 자동으로 저장되며, 다음 비디오를 열 때 자동으로 적용됩니다.
// @description:en      This script automatically hides the recommended cards at the end of YouTube videos. When the mouse hovers over the video, the recommended cards will reappear. Additionally, it provides shortcut keys to toggle the comment section, video recommendations, feature list, and switch to a minimalist mode. Settings are automatically saved and applied the next time the video is opened.

// @match        *://www.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/487608/1341419/GrammarSimplified.js
// ==/UserScript==

!function() {
class Tool extends API {constructor(hotKey) {super(), this.HK = hotKey, this.Dev = !1, this.Language = language(navigator.language), this.Video = /^(https?:\/\/)www\.youtube\.com\/watch\?v=.+$/, this.Playlist = /^(https?:\/\/)www\.youtube\.com\/playlist\?list=.+$/, this.Register = null, this.StartTime = null, this.Transform = !1, this.HideJudgment = async (Element, setValue = null) => {"none" == Element.style.display || this.Transform ? (Element.style.display = "block", setValue && this.store("set", setValue, !1)) : (Element.style.display = "none", setValue && this.store("set", setValue, !0));}, this.StyleConverter = async (EL, Type, Style, Result = null) => {if (EL.forEach(element => {element.style[Type] = Style;}), Result) return new Promise(resolve => {resolve(EL.every(element => element.style[Type] == Style));});}, this.SetAttri = async (label, state) => {document.body.setAttribute(label, state);};}async Injection() {const observer = new MutationObserver(this.Throttle_discard(() => {var URL = document.URL;this.Video.test(URL) && !document.body.hasAttribute("Video-Tool-Injection") && this.$$("div#columns") ? (this.Dev && (this.StartTime = this.Runtime()), this.SetAttri("Video-Tool-Injection", !0), null == this.Register && (this.Register = GM_registerMenuCommand(this.Language[0], () => {alert(this.Language[1]);})), this.$$("#Video-Tool-Hide") || this.AddStyle(`.ytp-ce-element{display: none !important;}#player.ytd-watch-flexy:hover .ytp-ce-element {display: block !important;}`, "Video-Tool-Hide"), this.WaitMap([ "#end", "#below", "#secondary.style-scope.ytd-watch-flexy", "#secondary-inner", "#related", "#comments", "#actions" ], 20, element => {let [ end, below, secondary, inner, related, comments, actions ] = element;this.store("get", "Minimalist") ? (this.StyleConverter([ document.body ], "overflow", "hidden"), this.StyleConverter([ end, below, secondary, related ], "display", "none", this.Dev).then(Success => {Success && this.log("極簡化", this.Runtime(this.StartTime));})) : (this.store("get", "RecomViewing") && this.StyleConverter([ secondary, related ], "display", "none", this.Dev).then(Success => {Success && this.log("隱藏推薦觀看", this.Runtime(this.StartTime));}), this.store("get", "Comment") && this.StyleConverter([ comments ], "display", "none", this.Dev).then(Success => {Success && this.log("隱藏留言區", this.Runtime(this.StartTime));}), this.store("get", "FunctionBar") && this.StyleConverter([ actions ], "display", "none", this.Dev).then(Success => {Success && this.log("隱藏功能選項", this.Runtime(this.StartTime));})), this.RemovListener(document, "keydown"), this.AddListener(document, "keydown", event => {this.HK.MinimaList(event) ? (event.preventDefault(), this.store("get", "Minimalist") ? (this.store("set", "Minimalist", !1), this.StyleConverter([ document.body ], "overflow", "auto"), this.StyleConverter([ end, below, secondary, related ], "display", "block")) : (this.store("set", "Minimalist", !0), this.StyleConverter([ document.body ], "overflow", "hidden"), this.StyleConverter([ end, below, secondary, related ], "display", "none"))) : this.HK.RecomViewing(event) ? (event.preventDefault(), 1 < inner.childElementCount ? (this.HideJudgment(secondary), this.HideJudgment(related, "RecomViewing"), this.Transform = !1) : (this.HideJudgment(related, "RecomViewing"), this.Transform = !0)) : this.HK.Comment(event) ? (event.preventDefault(), this.HideJudgment(comments, "Comment")) : this.HK.FunctionBar(event) && (event.preventDefault(), this.HideJudgment(actions, "FunctionBar"));});})) : this.Playlist.test(URL) && !document.body.hasAttribute("Playlist-Tool-Injection") && this.$$("div#contents") && (this.Dev && (this.StartTime = this.Runtime()), this.SetAttri("Playlist-Tool-Injection", !0), null == this.Register && (this.Register = GM_registerMenuCommand(this.Language[0], () => {alert(this.Language[1]);})), this.WaitElem("ytd-playlist-header-renderer.style-scope.ytd-browse", !1, 20, playlist => {this.store("get", "ListDesc") && this.StyleConverter([ playlist ], "display", "none", this.Dev).then(Success => {Success && this.log("隱藏播放清單資訊", this.Runtime(this.StartTime));}), this.RemovListener(document, "keydown"), this.AddListener(document, "keydown", event => {this.HK.ListDesc(event) && (event.preventDefault(), this.HideJudgment(playlist, "ListDesc"));});}));}, 500));this.AddListener(document, "DOMContentLoaded", () => {observer.observe(document, {childList: !0,subtree: !0}), this.RemovListener(document, "DOMContentLoaded");});}}function language(language) {var display = {"zh-TW": [ "📜 預設熱鍵", `@ 功能失效時 [請重新整理] =>\n\n(Alt + 1) :  隱藏推薦播放\n(Alt + 2) :  隱藏留言區\n(Alt + 3) :  隱藏功能列表\n(Alt + 4) :  隱藏播放清單資訊\n(Ctrl + Z) : 使用極簡化` ],"zh-CN": [ "📜 预设热键", `@ 功能失效时 [请重新整理] =>\n\n(Alt + 1) :  隐藏推荐播放\n(Alt + 2) :  隐藏评论区\n(Alt + 3) :  隐藏功能列表\n(Alt + 4) :  隐藏播放清单资讯\n(Ctrl + Z) : 使用极简化` ],ja: [ "📜 デフォルトホットキー", `@ 机能が无効になった场合 [ページを更新してください] =>\n\n(Alt + 1)：おすすめ再生を非表示にする\n(Alt + 2)：コメントエリアを非表示にする\n(Alt + 3)：机能リストを非表示にする\n(Alt + 4)：プレイリスト情报を非表示にする\n(Ctrl + Z)：シンプル化を使用する` ],"en-US": [ "📜 Default Hotkeys", `@ If functionalities fail [Please refresh] =>\n\n(Alt + 1): Hide recommended playback\n(Alt + 2): Hide comments section\n(Alt + 3): Hide feature list\n(Alt + 4): Hide playlist info\n(Ctrl + Z): Use Simplification` ],ko: [ "📜 기본 단축키", `@ 기능이 작동하지 않을 때 [새로 고침하세요] =>\n\n(Alt + 1) : 추천 재생 숨기기\n(Alt + 2) : 댓글 영역 숨기기\n(Alt + 3) : 기능 목록 숨기기\n(Alt + 4) : 재생 목록 정보 숨기기\n(Ctrl + Z) : 간소화 사용` ]};return display[language] || display["en-US"];}
new Tool({
    MinimaList: k => k.ctrlKey && k.key == "z", // 極簡化
    RecomViewing: k => k.altKey && k.key == "1", // 推薦觀看
    Comment: k => k.altKey && k.key == "2", // 留言區
    FunctionBar: k => k.altKey && k.key == "3", // 功能區
    ListDesc: k => k.altKey && k.key == "4" // 播放清單資訊
}).Injection();
}();