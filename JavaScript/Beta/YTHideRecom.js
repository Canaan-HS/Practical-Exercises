// ==UserScript==
// @name         Youtube Hide Tool
// @name:zh-TW   Youtube 隱藏工具
// @name:zh-CN   Youtube 隐藏工具
// @name:ja      Youtube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @name:de      Youtube Versteckwerkzeug
// @name:pt      Ferramenta de Ocultação do Youtube
// @name:es      Herramienta de Ocultación de Youtube
// @name:fr      Outil de Masquage de Youtube
// @name:hi      यूट्यूब छुपाने का उपकरण
// @name:id      Alat Sembunyikan Youtube
// @version      0.0.24
// @author       HentaiSaru
// @description         快捷隱藏 YouTube 留言區、相關推薦、影片結尾推薦和設置選單
// @description:zh-TW   快捷隱藏 YouTube 留言區、相關推薦、影片結尾推薦和設置選單
// @description:zh-CN   快捷隐藏 YouTube 评论区、相关推荐、视频结尾推荐和设置菜单
// @description:ja      YouTubeのコメント欄、関連おすすめ、動画の最後のおすすめ、設定メニューを素早く非表示にする
// @description:ko      빠른 YouTube 댓글 영역, 관련 추천, 비디오 끝 추천 및 설정 메뉴 숨기기
// @description:en      Quickly hide YouTube comments, related recommendations, video end recommendations, and settings menu
// @description:de      Schnell verstecken YouTube Kommentare, verwandte Empfehlungen, Video-Ende-Empfehlungen und Einstellungsmenü
// @description:pt      Ocultar rapidamente comentários do YouTube, recomendações relacionadas, recomendações de final de vídeo e menu de configurações
// @description:es      Ocultar rápidamente comentarios de YouTube, recomendaciones relacionadas, recomendaciones de final de video y menú de configuración
// @description:fr      Masquer rapidement les commentaires de YouTube, les recommandations connexes, les recommandations de fin de vidéo et le menu des paramètres
// @description:hi      यूट्यूब टिप्पणियाँ, संबंधित सिफारिशें, वीडियो के अंत की सिफारिशें और सेटिंग्स मेनू को त्वरित रूप से छुपाएं
// @description:id      Sembunyikan cepat komentar YouTube, rekomendasi terkait, rekomendasi akhir video, dan menu pengaturan

// @match        *://www.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    /***
        * _ooOoo_
        * o8888888o
        * 88" . "88
        * (| -_- |)
        *  O\ = /O
        * ___/`---'\____
        * .   ' \\| |// `.
        * / \\||| : |||// \
        * / _||||| -:- |||||- \
        * | | \\\ - /// | |
        * | \_| ''\---/'' | |
        * \ .-\__ `-` ___/-. /
        * ___`. .' /--.--\ `. . __
        * ."" '< `.___\_<|>_/___.' >'"".
        * | | : `- \`.;`\ _ /`;.`/ - ` : | |
        * \ \ `-. \_ __\ /__ _/ .-` / /
        * ======`-.____`-.___\_____/___.-`____.-'======
        * `=---='
        * .............................................
        *   要準確的判斷快捷, 要完全自訂需要寫一堆定義, 實在是有點麻煩(懶)
        *   懂設置可於這邊修改快捷 =>
        */
    const HotKey = {
        RecomCard:   event => event.shiftKey, // 影片結尾推薦卡
        MinimaList:  event => event.ctrlKey && event.key == "z", // 極簡化
        RecomPlay:   event => event.altKey && event.key == "1", // 推薦播放
        Message:     event => event.altKey && event.key == "2", // 留言區
        FunctionBar: event => event.altKey && event.key == "3", // 功能區
        ListDesc:    event => event.altKey && event.key == "4" // 播放清單資訊

    }, Config = {
        Dev: false, // 開發偵錯
        Lookup_Delay: 500, // 查找間隔(ms)
        language: display_language(navigator.language),
        pattern: /^https:\/\/www\.youtube\.com\/.+$/,
        VVP_Pattern: /^https:\/\/www\.youtube\.com\/watch\?v=.+$/, // 判斷在播放頁面運行
        Playlist_Pattern: /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/ // 判斷在播放清單運行

    }, observer = new MutationObserver(() => {
        const currentUrl = document.URL;
        if (Config.pattern.test(currentUrl) && !document.body.hasAttribute("data-hide")) {
            document.body.setAttribute("data-hide", true);
            let set, transform = false;

            /* 註冊菜單 */
            GM_registerMenuCommand(Config.language[0], function() {alert(Config.language[1])});
            RunMaim();

            /* ======================= 主運行 ========================= */
            async function RunMaim() {
                /* 修改樣式 */
                GM_addStyle(`
                    .ytp-ce-element{opacity: 0.1 !important;}
                    .ytp-ce-element:hover{opacity: 1 !important;}
                `);

                /* ======================= 讀取設置 ========================= */
                WaitElem([
                    "end",
                    "below",
                    "secondary",
                    "related",
                    "secondary-inner",
                    "chat-container",
                    "comments",
                    "menu-container"
                ], element => {
                    const [end, below, secondary, related, inner, chat, comments, menu] = element;

                    /* 獲取設置 */
                    if (Config.VVP_Pattern.test(currentUrl)) {
                        // 極簡化
                        set = GM_getValue("Minimalist", null);
                        if (set && set !== null) {
                            Promise.all([SetTrigger(end), SetTrigger(below), SetTrigger(secondary), SetTrigger(related)]).then(results => {
                                results.every(result => result) && Config.Dev ? log("極簡化") : null;
                            });
                        } else {
                            // 推薦播放
                            set = GM_getValue("Trigger_1", null);
                            if (set && set !== null){
                                Promise.all([SetTrigger(chat), SetTrigger(secondary), SetTrigger(related)]).then(results => {
                                    results.every(result => result) && Config.Dev ? log("隱藏推薦播放") : null;
                                });
                            }
                            // 留言區
                            set = GM_getValue("Trigger_2", null);
                            if (set && set !== null){
                                SetTrigger(comments).then(() => {Config.Dev ? log("隱藏留言區") : null});
                            }
                            // 功能選項
                            set = GM_getValue("Trigger_3", null);
                            if (set && set !== null){
                                SetTrigger(menu).then(() => {Config.Dev ? log("隱藏功能選項") : null});
                            }
                        }
                    } else if (Config.Playlist_Pattern.test(currentUrl)) {
                        // 播放清單資訊
                        set = GM_getValue("Trigger_4", null);
                        if (set && set !== null){
                            let interval;
                            interval = setInterval(function() {
                                let playlist = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                                playlist ? SetTrigger(playlist).then(() => {clearInterval(interval)}) : null;
                            }, Config.Lookup_Delay);
                        }
                    }

                    /* ======================= 快捷設置 ========================= */
                    addlistener(document, "keydown", event => {
                        if (HotKey.RecomCard(event)) {
                            event.preventDefault();
                            let elements = document.querySelectorAll(".ytp-ce-element, .ytp-ce-covering");
                            elements.forEach(function(element) {
                                HideJudgment(element);
                            });
                        } else if (HotKey.MinimaList(event)) {
                            event.preventDefault();
                            set = GM_getValue("Minimalist", null);
                            if (set && set != null) {
                                end.style.display = "block";
                                below.style.display = "block";
                                secondary.style.display = "block";
                                related.style.display = "block";
                                GM_setValue("Minimalist", false);
                            } else {
                                end.style.display = "none";
                                below.style.display = "none";
                                secondary.style.display = "none";
                                related.style.display = "none";
                                GM_setValue("Minimalist", true);
                            }
                        } else if (HotKey.RecomPlay(event)) {
                            event.preventDefault();
                            if (inner.childElementCount > 1) {
                                HideJudgment(chat, "Trigger_1");
                                HideJudgment(secondary);
                                HideJudgment(related);
                                transform = false;
                            } else {
                                HideJudgment(chat, "Trigger_1");
                                HideJudgment(related);
                                transform = true;
                            }
                        } else if (HotKey.Message(event)) {
                            event.preventDefault();
                            HideJudgment(comments, "Trigger_2");
                        } else if (HotKey.FunctionBar(event)) {
                            event.preventDefault();
                            HideJudgment(menu, "Trigger_3");
                        } else if (HotKey.ListDesc(event)) {
                            event.preventDefault();
                            let playlist = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                            HideJudgment(playlist, "Trigger_4");
                        }
                    })
                });

                /* ======================= 設置 API ========================= */

                /* 觸發設置 API */
                async function SetTrigger(element) {
                    element.style.display = "none";
                    return new Promise(resolve => {
                        element.style.display === "none" ? resolve(true) : resolve(false);
                    });
                }

                /* 設置判斷 API */
                async function HideJudgment(element, gm=null) {
                    if (element.style.display === "none" || transform) {
                        element.style.display = "block";
                        gm !== null ? GM_setValue(gm, false) : null
                    } else {
                        element.style.display = "none";
                        gm !== null ? GM_setValue(gm, true) : null
                    }
                }

                /* 添加 監聽器 API (簡化版) */
                async function addlistener(element, type, listener, add={}) {
                    element.addEventListener(type, listener, add);
                }

                /* 等待元素出現 API (修改版) */
                async function WaitElem(selectors, callback) {
                    const interval = setInterval(()=> {
                        const elements = selectors.map(selector => document.getElementById(selector));
                        Config.Dev ? log(elements) : null;
                        if (elements.every(element => element)) {
                            clearInterval(interval);
                            callback(elements);
                        }
                    }, Config.Lookup_Delay);
                }

                /* 開發者除錯打印 API */
                function log(label, type="log") {
                    const style = {
                        group: `padding: 5px;color: #ffffff;font-weight: bold;border-radius: 5px;background-color: #54d6f7;`,
                        text: `padding: 3px;color: #ffffff;border-radius: 2px;background-color: #1dc52b;`
                    }, template = {
                        log: label=> console.log(`%c${label}`, style.text),
                        warn: label=> console.warn(`%c${label}`, style.text),
                        error: label=> console.error(`%c${label}`, style.text),
                        count: label=> console.count(label),
                    }
                    type = typeof type === "string" && template[type] ? type : type = "log";
                    console.groupCollapsed("%c___ 開發除錯 ___", style.group);
                    template[type](label);
                    console.groupEnd();
                }
            }
        }
    });
    /* 啟用觀察 */
    observer.observe(document.head, {childList: true, subtree: true});

    /* ======================= 語言設置 ========================= */

    function display_language(language) {
        let display = {
            "zh-TW": ["📜 設置快捷", `@ 功能失效時 [請重新整理] =>

    (Shift) : 完全隱藏影片尾部推薦
    (Alt + 1) : 隱藏右側影片推薦
    (Alt + 2) : 隱藏留言區
    (Alt + 3) : 隱藏功能選項
    (Alt + 4) : 隱藏播放清單資訊
    (Ctrl + Z) : 使用極簡化`],

        "zh-CN": ["📜 设置快捷", `@ 功能失效时 [请重新刷新] =>
    (Shift) : 全部隐藏视频尾部推荐
    (Alt + 1) : 隐藏右侧视频推荐
    (Alt + 2) : 隐藏评论区
    (Alt + 3) : 隐藏功能选项
    (Alt + 4) : 隐藏播放列表信息
    (Ctrl + Z) : 使用极简化`],

        "ja": ["📜 設定ショートカット", `@ 機能が無効になった場合 [再読み込みしてください] =>
    (Shift) : 動画の最後のおすすめを完全に非表示にする
    (Alt + 1) : 右側の動画おすすめを非表示にする
    (Alt + 2) : コメント欄を非表示にする
    (Alt + 3) : 機能オプションを非表示にする
    (Alt + 4) : プレイリスト情報を非表示にする
    (Ctrl + Z) : 簡素化を使用する`],

        "en-US": ["📜 Settings Shortcut", `@ When function fails [Please refresh] =>
    (Shift) : Fully hide video end recommendations
    (Alt + 1) : Hide right side video recommendations
    (Alt + 2) : Hide comments section
    (Alt + 3) : Hide function options
    (Alt + 4) : Hide playlist information
    (Ctrl + Z) : Use minimalism`],

        "ko": ["📜 설정 바로 가기", `@ 기능이 실패하면 [새로 고침하세요] =>
    (Shift) : 비디오 끝 추천을 완전히 숨기기
    (Alt + 1) : 오른쪽 비디오 추천 숨기기
    (Alt + 2) : 댓글 섹션 숨기기
    (Alt + 3) : 기능 옵션 숨기기
    (Alt + 4) : 재생 목록 정보 숨기기
    (Ctrl + Z) : 미니멀리즘 사용하기`]};

        return display[language] || display["en-US"];
    }
})();