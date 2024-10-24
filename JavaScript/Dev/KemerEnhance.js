// ==UserScript==
// @name         Kemer 增強
// @name:zh-TW   Kemer 增強
// @name:zh-CN   Kemer 增强
// @name:ja      Kemer 強化
// @name:en      Kemer Enhancement
// @version      0.0.49-Beta1
// @author       Canaan HS
// @description        美化介面和重新排版，包括移除廣告和多餘的橫幅，修正繪師名稱和編輯相關的資訊保存，自動載入原始圖像，菜單設置圖像大小間距，快捷鍵觸發自動滾動，解析文本中的連結並轉換為可點擊的連結，快速的頁面切換和跳轉功能，並重新定向到新分頁
// @description:zh-TW  美化介面和重新排版，包括移除廣告和多餘的橫幅，修正繪師名稱和編輯相關的資訊保存，自動載入原始圖像，菜單設置圖像大小間距，快捷鍵觸發自動滾動，解析文本中的連結並轉換為可點擊的連結，快速的頁面切換和跳轉功能，並重新定向到新分頁
// @description:zh-CN  美化界面和重新排版，包括移除广告和多余的横幅，修正画师名称和编辑相关的资讯保存，自动载入原始图像，菜单设置图像大小间距，快捷键触发自动滚动，解析文本中的链接并转换为可点击的链接，快速的页面切换和跳转功能，并重新定向到新分頁
// @description:ja     インターフェイスの美化と再配置、広告や余分なバナーの削除、イラストレーター名の修正と関連情報の保存の編集、オリジナル画像の自動読み込み、メニューでの画像のサイズと間隔の設定、ショートカットキーによる自動スクロールのトリガー、テキスト内のリンクの解析とクリック可能なリンクへの変換、高速なページ切り替えとジャンプ機能、新しいタブへのリダイレクト
// @description:en     Beautify the interface and re-layout, including removing ads and redundant banners, correcting artist names and editing related information retention, automatically loading original images, setting image size and spacing in the menu, triggering automatic scrolling with hotkeys, parsing links in the text and converting them to clickable links, fast page switching and jumping functions, and redirecting to a new tab

// @match        *://kemono.su/*
// @match        *://coomer.su/*
// @match        *://*.kemono.su/*
// @match        *://*.coomer.su/*

// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_deleteValue
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.3/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/495339/1404326/ObjectSyntax_min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js

// @resource     loading https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/svg-with-js.min.css
// ==/UserScript==

(async function () {
    /*! mode: 某些功能可以設置模式 (輸入數字), enable: 是否啟用該功能 (布林) !*/
    const User_Config = {
        Global: {
            BlockAds: {mode: 0, enable: true}, // 阻擋廣告
            BackToTop: {mode: 0, enable: true}, // 翻頁後回到頂部
            KeyScroll: {mode: 1, enable: true}, // 上下鍵觸發自動滾動 [mode: 1 = 動畫偵滾動, mode: 2 = 間隔滾動] (選擇對於自己較順暢的, coomer 無效他被阻止了)
            DeleteNotice: {mode: 0, enable: true}, // 刪除上方公告
            SidebarCollapse: {mode: 0, enable: true}, // 側邊攔摺疊
            FixArtist: { // 修復作者名稱
                mode: 0,
                enable: true,
                newtab: true, // 是否以新標籤開啟
                newtab_active: true, // 自動切換焦點到新標籤
                newtab_insert: true, // 新標籤插入到當前標籤的正後方
            },
            TextToLink: { // 連結的 (文本 -> 超連結)
                mode: 0,
                enable: true,
                newtab: true,
                newtab_active: false,
                newtab_insert: false,
            },
        },
        Preview: {
            CardZoom: {mode: 2, enable: true}, // 縮放預覽卡大小 [mode: 1 = 卡片放大 , 2 = 卡片放大 + 懸浮縮放]
            CardText: {mode: 2, enable: true}, // 預覽卡文字效果 [mode: 1 = 隱藏文字 , 2 = 淡化文字]
            QuickPostToggle: {mode: 0, enable: true}, // 快速切換帖子
            NewTabOpens: { // 預覽頁面的帖子都以新分頁開啟
                mode: 0,
                enable: true,
                newtab_active: false,
                newtab_insert: false,
            },
        },
        Content: {
            ExtraButton: {mode: 0, enable: true}, // 額外的下方按鈕
            LinkBeautify: {mode: 0, enable: true}, // 下載連結美化, 當出現 (browse »), 滑鼠懸浮會直接顯示內容, 並移除多餘的字串
            CommentFormat: {mode: 0, enable: true}, // 評論區重新排版
            VideoBeautify: {mode: 1, enable: true}, // 影片美化 [mode: 1 = 複製下載節點 , 2 = 移動下載節點] (有啟用 LinkBeautify, 會與原始狀態不同)
            OriginalImage: {mode: 1, enable: true}, // 自動原圖 [mode: 1 = 快速自動 , 2 = 慢速自動 , 3 = 觀察後觸發]
        }
    };

    /* ==================== 依賴項目 ==================== */
    const Url = Syn.Device.Url;
    const DLL = (() => {
        // 頁面正則
        const Posts = /^(https?:\/\/)?(www\.)?.+\/posts\/?.*$/;
        const Search = /^(https?:\/\/)?(www\.)?.+\/artists\/?.*$/;
        const User = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/;
        const Content = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/;
        const Favor = /^(https?:\/\/)?(www\.)?.+\/favorites\?type=post\/?.*$/;
        const Link = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+\/links\/?.*$/;
        const FavorArtist = /^(https?:\/\/)?(www\.)?.+\/favorites(?:\?(?!type=post).*)?$/;
        const Announcement = /^(https?:\/\/)?(www\.)?.+\/(dms|(?:.+\/user\/[^\/]+\/announcements))(\?.*)?$/;

        // 展示語言
        const Display_Lang = {
            Traditional: {
                RM_01: "📝 設置選單",
                MT_01: "設置菜單", MO_01: "圖像設置",
                MB_01: "讀取設定", MB_02: "關閉離開", MB_03: "保存應用",
                ML_01: "語言", ML_02: "英文", ML_03: "繁體", ML_04: "簡體", ML_05: "日文",
                MIS_01: "圖片高度", MIS_02: "圖片寬度", MIS_03: "圖片最大寬度", MIS_04: "圖片間隔高度"
            },
            Simplified: {
                RM_01:"📝 设置菜单",
                MT_01:"设置菜单", MO_01:"图像设置",
                MB_01:"读取设置", MB_02:"关闭退出", MB_03:"保存应用",
                ML_01:"语言", ML_02:"英文", ML_03:"繁体", ML_04:"简体", ML_05:"日文",
                MIS_01:"图片高度", MIS_02:"图片宽度", MIS_03:"图片最大宽度", MIS_04:"图片间隔高度"
            },
            Japan: {
                RM_01:"📝 設定メニュー",
                MT_01:"設定メニュー", MO_01:"画像設定",
                MB_01:"設定の読み込み", MB_02:"閉じて終了する", MB_03:"保存して適用する",
                ML_01:"言語", ML_02:"英語", ML_03:"繁体字", ML_04:"簡体字", ML_05:"日本語",
                MIS_01:"画像の高さ", MIS_02:"画像の幅", MIS_03:"画像の最大幅", MIS_04:"画像の間隔の高さ"
            },
            English: {
                RM_01:"📝 Settings Menu",
                MT_01:"Settings Menu", MO_01:"Image Settings",
                MB_01:"Load Settings", MB_02:"Close and Exit", MB_03:"Save and Apply",
                ML_01:"Language", ML_02:"English", ML_03:"Traditional Chinese", ML_04:"Simplified Chinese", ML_05:"Japanese",
                MIS_01:"Image Height", MIS_02:"Image Width", MIS_03:"Maximum Image Width", MIS_04:"Image Spacing Height"
            }
        }, Match = {
            "zh-TW": Display_Lang.Traditional, "zh-HK": Display_Lang.Traditional, "zh-MO": Display_Lang.Traditional,
            "zh-CN": Display_Lang.Simplified, "zh-SG": Display_Lang.Simplified,
            "en-US": Display_Lang.English, "ja": Display_Lang.Japan,
        };

        (async ()=> { // 刪除舊版數據
            const DV = Syn.Store("g", "DataVersion", 0);
            if (DV < 1) {
                ["MenuSet", "ImgSet", "language"].forEach(key=> {Syn.Store("d", key)});
                Syn.Store("s", "DataVersion", 1);
            }
        })();

        // 所需樣式 (需要傳入顏色的, 就是需要動態適應顏色變化)
        const Color = Syn.Device.Host.startsWith("coomer") ? "#99ddff !important" : "#e8a17d !important";
        const SaveKey = {
            Img: "ImgStyle",
            Lang: "Language",
            Menu: "MenuPoint",
        };
        // 導入使用者設定
        const UserSet = {
            MenuSet: () => {
                return Syn.Store("g", SaveKey.Menu) ?? {
                    Top: "10vh",
                    Left: "10vw"
                };
            },
            ImgSet: () => {
                return Syn.Store("g", SaveKey.Img) ?? {
                    Width: "auto",
                    Height: "auto",
                    Spacing: "0px",
                    MaxWidth: "100%",
                };
            }
        };

        // 動態調整樣式
        let ImgRule, MenuRule;
        const ImportantStyle = async (element, property, value) => {
            requestAnimationFrame(() => {
                element.style.setProperty(property, value, "important");
            })
        };
        const NormalStyle = (element, property, value) => {
            requestAnimationFrame(() => {
                element.style[property] = value;
            });
        };
        const Style_Pointer = {
            Top: value => NormalStyle(MenuRule[1], "top", value),
            Left: value => NormalStyle(MenuRule[1], "left", value),
            Width: value => ImportantStyle(ImgRule[1], "width", value),
            Height: value => ImportantStyle(ImgRule[1], "height", value),
            MaxWidth: value => ImportantStyle(ImgRule[1], "max-width", value),
            Spacing: value => ImportantStyle(ImgRule[1], "margin", `${value} auto`)
        };

        // 依賴樣式
        const Style = {
            Global: async () => { // 全域 修復所需
                Syn.AddStyle(`
                    /* 搜尋頁面的樣式 */
                    fix_tag:hover { color: ${Color}; }
                    .fancy-image__image, fix_name, fix_tag, fix_edit {
                        cursor: pointer;
                    }
                    .user-card__info {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    fix_name {
                        color: #fff;
                        font-size: 28px;
                        font-weight: 500;
                        max-width: 320px;
                        overflow: hidden;
                        padding: .25rem .1rem;
                        border-radius: .25rem;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .edit_artist {
                        position: absolute;
                        top: 36%;
                        right: 8%;
                        color: #fff;
                        display: none;
                        font-size: 14px;
                        font-weight: 700;
                        background: #666;
                        white-space: nowrap;
                        padding: .25rem .5rem;
                        border-radius: .25rem;
                        transform: translateY(-100%);
                    }
                    .edit_textarea {
                        color: #fff;
                        display: block;
                        font-size: 30px;
                        padding: 6px 1px;
                        line-height: 5vh;
                        text-align: center;
                    }
                    .user-card:hover .edit_artist {
                        display: block;
                    }
                    .user-card:hover fix_name {
                        background-color: ${Color};
                    }
                    .edit_textarea ~ fix_name,
                    .edit_textarea ~ .edit_artist {
                        display: none !important;
                    }

                    /* 預覽頁面的樣式 */
                    fix_view {
                        display: flex;
                        flex-flow: wrap;
                        align-items: center;
                    }
                    fix_view fix_name {
                        font-size: 2rem;
                        font-weight: 700;
                        padding: .25rem 3rem;
                        border-radius: .25rem;
                        transition: background-color 0.3s ease;
                    }
                    fix_view .edit_artist {
                        top: 40%;
                        right: 5%;
                        transform: translateY(-80%);
                    }
                    fix_view:hover fix_name {
                        background-color: ${Color};
                    }
                    fix_view:hover .edit_artist {
                        display: block;
                    }

                    /* 內容頁面的樣式 */
                    fix_cont {
                        display: flex;
                        justify-content: space-around;
                    }
                    fix_cont fix_name {
                        color: ${Color};
                        font-size: 1.25em;
                        display: inline-block;
                    }
                    fix_cont .edit_artist {
                        top: 95%;
                        right: -10%;
                    }
                    fix_cont:hover fix_name {
                        background-color: #fff;
                    }
                    fix_cont:hover .edit_artist {
                        display: block;
                    }
                `, "Global-Effects", false);
            },
            Preview: async () => { // 帖子預覽頁所需
                Syn.AddStyle(`
                    .gif-overlay {
                        top: 45%;
                        left: 50%;
                        width: 60%;
                        height: 60%;
                        opacity: 0.5;
                        z-index: 9999;
                        position: absolute;
                        border-radius: 50%;
                        background-size: contain;
                        background-position: center;
                        background-repeat: no-repeat;
                        transform: translate(-50%, -50%);
                        background-image: url("${GM_getResourceURL('loading')}");
                    }
                    .card-list__items {
                        gap: 0.5em;
                        display: flex;
                        grid-gap: 0.5em;
                        position: relative;
                        align-items: var(--local-align);
                        flex-flow: var(--local-flex-flow);
                        justify-content: var(--local-justify);
                    }
                `, "Preview-Effects", false);
            },
            Postview: async () => { // 觀看帖子頁所需
                // 讀取圖像設置
                const set = UserSet.ImgSet();
                const width = Syn.Device.iW() / 2;
                Syn.AddStyle(`
                    .Image-loading-indicator {
                        min-width: 50vW;
                        min-height: 50vh;
                        max-width: ${width}px;
                        max-height: ${width * 9 / 16}px;
                        border: 1px solid #fafafa;
                    }
                    .Image-style, figure img {
                        display: block;
                        width: ${set.Width} !important;
                        height: ${set.Height} !important;
                        margin: ${set.Spacing} auto !important;
                        max-width: ${set.MaxWidth} !important;
                    }
                    .Image-loading-indicator:hover {
                        cursor: pointer;
                    }
                `, "Image-Custom-Style", false);
                ImgRule = Syn.$$("#Image-Custom-Style")?.sheet.cssRules;
            },
            Awesome: async () => { // 觀看帖子頁圖示
                Syn.AddStyle(`
                    ${GM_getResourceText("font-awesome")}
                    #next_box a {
                        cursor: pointer;
                    }
                    #next_box a:hover {
                        background-color: ${Color};
                    }
            `, "Font-awesome", false);
            },
            Menu: () => {
                const set = UserSet.MenuSet();
                Syn.AddScript(`
                    function check(value) {
                        return value.toString().length > 4 || value > 1000
                            ? 1000 : value < 0 ? "" : value;
                    }
                `, "Menu-Settings", false);
                Syn.AddStyle(`
                    .modal-background {
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        z-index: 9999;
                        overflow: auto;
                        position: fixed;
                        pointer-events: none;
                    }
                    /* 模態介面 */
                    .modal-interface {
                        top: ${set.Top};
                        left: ${set.Left};
                        margin: 0;
                        display: flex;
                        overflow: auto;
                        position: fixed;
                        border-radius: 5px;
                        pointer-events: auto;
                        background-color: #2C2E3E;
                        border: 3px solid #EE2B47;
                    }
                    /* 模態內容盒 */
                    .modal-box {
                        padding: 0.5rem;
                        height: 50vh;
                        width: 32vw;
                    }
                    /* 菜單框架 */
                    .menu {
                        width: 5.5vw;
                        overflow: auto;
                        text-align: center;
                        vertical-align: top;
                        border-radius: 2px;
                        border: 2px solid #F6F6F6;
                    }
                    /* 菜單文字標題 */
                    .menu-text {
                        color: #EE2B47;
                        cursor: default;
                        padding: 0.2rem;
                        margin: 0.3rem;
                        margin-bottom: 1.5rem;
                        white-space: nowrap;
                        border-radius: 10px;
                        border: 4px solid #f05d73;
                        background-color: #1f202c;
                    }
                    /* 菜單選項按鈕 */
                    .menu-options {
                        cursor: pointer;
                        font-size: 1.4rem;
                        color: #F6F6F6;
                        font-weight: bold;
                        border-radius: 5px;
                        margin-bottom: 1.2rem;
                        border: 5px inset #EE2B47;
                        background-color: #6e7292;
                        transition: color 0.8s, background-color 0.8s;
                    }
                    .menu-options:hover {
                        color: #EE2B47;
                        background-color: #F6F6F6;
                    }
                    .menu-options:disabled {
                        color: #6e7292;
                        cursor: default;
                        background-color: #c5c5c5;
                        border: 5px inset #faa5b2;
                    }
                    /* 設置內容框架 */
                    .content {
                        height: 48vh;
                        width: 28vw;
                        overflow: auto;
                        padding: 0px 1rem;
                        border-radius: 2px;
                        vertical-align: top;
                        border-top: 2px solid #F6F6F6;
                        border-right: 2px solid #F6F6F6;
                    }
                    .narrative { color: #EE2B47; }
                    .Image-input-settings {
                        width: 8rem;
                        color: #F6F6F6;
                        text-align: center;
                        font-size: 1.5rem;
                        border-radius: 15px;
                        border: 3px inset #EE2B47;
                        background-color: #202127;
                    }
                    .Image-input-settings:disabled {
                        border: 3px inset #faa5b2;
                        background-color: #5a5a5a;
                    }
                    /* 底部按鈕框架 */
                    .button-area {
                        display: flex;
                        padding: 0.3rem;
                        border-left: none;
                        border-radius: 2px;
                        border: 2px solid #F6F6F6;
                        justify-content: space-between;
                    }
                    .button-area select {
                        color: #F6F6F6;
                        margin-right: 1.5rem;
                        border: 3px inset #EE2B47;
                        background-color: #6e7292;
                    }
                    /* 底部選項 */
                    .button-options {
                        color: #F6F6F6;
                        cursor: pointer;
                        font-size: 0.8rem;
                        font-weight: bold;
                        border-radius: 10px;
                        white-space: nowrap;
                        background-color: #6e7292;
                        border: 3px inset #EE2B47;
                        transition: color 0.5s, background-color 0.5s;
                    }
                    .button-options:hover {
                        color: #EE2B47;
                        background-color: #F6F6F6;
                    }
                    .button-space { margin: 0 0.6rem; }
                    .form-hidden {
                        opacity: 0;
                        height: 0;
                        width: 0;
                        overflow: hidden;
                        transition: opacity 0.8s, height 0.8s, width 0.8s;
                    }
                    .toggle-menu {
                        height: 0;
                        width: 0;
                        padding: 0;
                        margin: 0;
                    }
                    /* 整體框線 */
                    table, td {
                        margin: 0px;
                        padding: 0px;
                        overflow: auto;
                        border-spacing: 0px;
                    }
                    .modal-background p {
                        display: flex;
                        flex-wrap: nowrap;
                    }
                    option { color: #F6F6F6; }
                    ul {
                        list-style: none;
                        padding: 0px;
                        margin: 0px;
                    }
                `, "Menu-Custom-Style", false);
                MenuRule = Syn.$$("#Menu-Custom-Style")?.sheet.cssRules;

                // 全局修改功能
                Syn.StoreListen(Object.values(SaveKey), call => {
                    if (call.far) {
                        if (Syn.Type(call.nv) == "String") {
                            MenuTrigger(Match[call.nv]);
                        } else {
                            for (const [key, value] of Object.entries(call.nv)) {
                                Style_Pointer[key](value);
                            }
                        }
                    }
                });
            }
        };

        return {
            IsContent: Content.test(Url),
            IsAnnouncement: Announcement.test(Url),
            IsSearch: Search.test(Url) || Link.test(Url) || FavorArtist.test(Url),
            IsAllPreview: Posts.test(Url) || User.test(Url) || Favor.test(Url),

            Language: () => {
                const log = Syn.Store("g", SaveKey.Lang);
                return {
                    log: log,
                    lang: Match[log] ?? Match["en-US"], // 避免例外
                }
            },
            Rendering: ({ content }) => React.createElement("div", { dangerouslySetInnerHTML: { __html: content } }),

            ...UserSet, Style, Color, SaveKey, Style_Pointer,
            Link, Posts, User, Favor, Search, Content, FavorArtist, Announcement
        };
    })();

    /* ==================== 配置解析 調用 ==================== */
    const Enhance = (() => {
        // 配置參數驗證
        const Validate = (Bool, Num) => {
            return Bool && Syn.Type(Bool) == "Boolean" && Syn.Type(Num) == "Number"
                ? true
                : false;
        };
        // 呼叫順序
        const Order = {
            Global: [
                "SidebarCollapse",
                "DeleteNotice",
                "BlockAds",
                "TextToLink",
                "FixArtist",
                "BackToTop",
                "KeyScroll"
            ],
            Preview: [
                "NewTabOpens",
                "QuickPostToggle",
                "CardZoom",
                "CardText"
            ],
            Content: [
                "LinkBeautify",
                "VideoBeautify",
                "OriginalImage",
                "ExtraButton",
                "CommentFormat",
            ],
        };
        // 懶加載函數
        const LoadFunc = {
            Global_Cache: undefined,
            Preview_Cache: undefined,
            Content_Cache: undefined,
            Global: function() {
                if (!this.Global_Cache) this.Global_Cache = Global_Function();
                return this.Global_Cache;
            },
            Preview: function() {
                if (!this.Preview_Cache) this.Preview_Cache = Preview_Function();
                return this.Preview_Cache;
            },
            Content: function() {
                if (!this.Content_Cache) this.Content_Cache = Content_Function();
                return this.Content_Cache;
            }
        };
        // 用於 Extra 翻頁後初始化
        const Global_Initial = {
            FixArtist: {
                ...User_Config.Global.FixArtist
            },
            TextToLink: {
                ...User_Config.Global.TextToLink
            }
        };

        // 解析配置調用對應功能
        let Ord;
        async function Call(page, config=User_Config[page]) {
            const func = LoadFunc[page](); // 載入對應函數

            for (Ord of Order[page]) { // 避免空值時, 解構出現例外, 給予其預設值
                const {enable, mode, ...other} = config[Ord] ?? {};

                if (Validate(enable, mode)) {
                    // 將模式與, 可能有的其他選項, 作為 Config 傳遞
                    func[Ord]?.({mode, ...other});
                }
            }
        }

        return {
            Run: async () => {
                Call("Global");
                if (DLL.IsAllPreview) Call("Preview");
                else if (DLL.IsContent) {
                    /* 就算沒開啟原圖功能, 還是需要導入 Postview (暫時寫在這) */
                    DLL.Style.Postview(); // 導入 Post 頁面樣式
                    Call("Content"); // 呼叫功能

                    DLL.Style.Menu(); // 導入 菜單樣式
                    MenuTrigger(DLL.Language().lang); // 創建菜單
                }
            },
            ExtraInitial: async () => {
                Call("Global", Global_Initial);
                Call("Content");
            }
        }
    })();
    Enhance.Run();

    /* ==================== 全域功能 ==================== */
    function Global_Function() {
        const LoadFunc = {
            TextToLink_Cache: undefined,
            TextToLink_Dependent: function (Config) {
                if (!this.TextToLink_Cache) {
                    this.TextToLink_Cache = {
                        Protocol_F: /^(?!https?:\/\/)/,
                        Exclusion_F: /onfanbokkusuokibalab\.net/,
                        URL_F: /(?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9]+\.)?(?:[a-zA-Z0-9]+)\.[^\s]+\/[^\s]+/g,
                        ParseModify: async function (father, content) { // 解析後轉換網址
                            if (this.Exclusion_F.test(content)) return;

                            father.innerHTML = content.replace(this.URL_F, url => {
                                const decode = decodeURIComponent(url).trim();
                                return `<a href="${decode.replace(this.Protocol_F, "https://")}">${decode}</a>`;
                            });
                        },
                        Process: async function(pre) { // 處理只有 pre
                            const Text = pre.textContent;
                            this.URL_F.test(Text) && this.ParseModify(pre, Text);
                        },
                        Multiprocessing: async function(root) { // 處理有 p 和 a 的狀況
                            for (const p of Syn.$$("p", {all: true, root: root})) {
                                const Text = p.textContent;
                                this.URL_F.test(Text) && this.ParseModify(p, Text);
                            }

                            let a; // 先宣告在運行, 速度會更快
                            for (a of Syn.$$("a", {all: true, root: root})) {
                                !a.href && this.ParseModify(a, a.textContent);
                            }
                        },
                        JumpTrigger: async (root) => { // 將該區塊的所有 a 觸發跳轉, 改成開新分頁
                            const [Newtab, Active, Insert] = [
                                Config.newtab ?? true,
                                Config.newtab_active ?? false,
                                Config.newtab_insert ?? false,
                            ];

                            Syn.Listen(root, "click", event => {
                                const target = event.target.closest("a:not(.fileThumb)");

                                target && (
                                    event.preventDefault(),
                                    !Newtab
                                        ? location.assign(target.href)
                                        : GM_openInTab(target.href, { active: Active, insert: Insert })
                                );
                            }, {capture: true});
                        }
                    }
                };
                return this.TextToLink_Cache;
            },
            FixArtist_Cache: undefined,
            FixArtist_Dependent: function () {
                if (!this.FixArtist_Cache) {
                    const Fix_Requ = { // 宣告修復需要的函數
                        Record_Cache: undefined, // 讀取修復紀錄 用於緩存
                        Fix_Cache: new Map(), // 修復後 用於緩存
                        Get_Record: () => Syn.Storage("fix_record_v2", { type: localStorage, error: new Map() }),
                        Save_Record: async function (save) {
                            await Syn.Storage("fix_record_v2",
                                {
                                    type: localStorage,
                                    value: new Map([...this.Get_Record(), ...save]) // 取得完整數據並合併
                                }
                            );
                            this.Fix_Cache.clear();
                        },
                        Save_Work: (() => Syn.Debounce(() => Fix_Requ.Save_Record(Fix_Requ.Fix_Cache), 1000))(),
                        Fix_Name_Support: new Set(["pixiv", "fanbox"]),
                        Fix_Tag_Support: {
                            ID: /Patreon|Fantia|Pixiv|Fanbox/gi,
                            Patreon: "https://www.patreon.com/user?u={id}",
                            Fantia: "https://fantia.jp/fanclubs/{id}/posts",
                            Pixiv: "https://www.pixiv.net/users/{id}/artworks",
                            Fanbox: "https://www.pixiv.net/fanbox/creator/{id}",

                            NAME: /Fansly|OnlyFans/gi,
                            OnlyFans: "https://onlyfans.com/{name}",
                            Fansly: "https://fansly.com/{name}/posts",
                        },
                        Fix_Request: async function (url, headers={}) { // 請求修復數據
                            return new Promise(resolve => {
                                GM_xmlhttpRequest({
                                    method: "GET",
                                    url: url,
                                    headers: headers,
                                    onload: response => resolve(response),
                                    onerror: () => resolve(),
                                    ontimeout: () => resolve()
                                })
                            });
                        },
                        Get_Pixiv_Name: async function (id) { // 取得 Pixiv 名稱
                            const response = await this.Fix_Request(
                                `https://www.pixiv.net/ajax/user/${id}?full=1&lang=ja`, {referer: "https://www.pixiv.net/"}
                            );
                            if (response.status === 200) {
                                const user = JSON.parse(response.responseText);
                                let user_name = user.body.name;
                                user_name = user_name.replace(/(c\d+)?([日月火水木金土]曜日?|[123１２３一二三]日目?)[東南西北]..?\d+\w?/i, '');
                                user_name = user_name.replace(/[@＠]?(fanbox|fantia|skeb|ファンボ|リクエスト|お?仕事|新刊|単行本|同人誌)+(.*(更新|募集|公開|開設|開始|発売|販売|委託|休止|停止)+中?[!！]?$|$)/gi, '');
                                user_name = user_name.replace(/\(\)|（）|「」|【】|[@＠_＿]+$/g, '').trim();
                                return user_name;
                            } else return;
                        },
                        Fix_Url: function (url) { // 連結網址修復
                            url = url.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)$/) || url.match(/\/([^\/]+)\/([^\/]+)$/); // 匹配出三段類型, 或兩段類型的格式
                            url = url.splice(1).map(url => url.replace(/\/?(www\.|\.com|\.jp|\.net|\.adult|user\?u=)/g, "")); // 排除不必要字串
                            return url.length >= 3 ? [url[0], url[2]] : url;
                        },
                        Fix_Update_Ui: async function (href, id, name_onj, tag_obj, text) { // 修復後更新 UI
                            /* 創建編輯按鈕 */
                            const edit = GM_addElement("fix_edit", { id: id, class: "edit_artist", textContent: "Edit" });
                            name_onj.parentNode.insertBefore(edit, name_onj);
                            name_onj.outerHTML = `<fix_name jump="${href}">${text.trim()}</fix_name>`;

                            /* 取得支援修復的正則 */
                            const [tag_text, support_id, support_name] = [
                                tag_obj.textContent,
                                this.Fix_Tag_Support.ID,
                                this.Fix_Tag_Support.NAME
                            ];

                            if (support_id.test(tag_text)) {
                                tag_obj.innerHTML = tag_text.replace(support_id, tag => {
                                    return `<fix_tag jump="${this.Fix_Tag_Support[tag].replace("{id}", id)}">${tag}</fix_tag>`;
                                });
                            } else if (support_name.test(tag_text)) {
                                tag_obj.innerHTML = tag_text.replace(support_name, tag => {
                                    return `<fix_tag jump="${this.Fix_Tag_Support[tag].replace("{name}", id)}">${tag}</fix_tag>`;
                                });
                            }
                        },
                        Fix_Trigger: async function (object) { // 觸發修復
                            const {Url, TailId, Website, NameObject, TagObject} = object;

                            let Record = this.Record_Cache.get(TailId); // 從緩存 使用尾部 ID 取出對應紀錄

                            if (Record) {
                                this.Fix_Update_Ui(Url, TailId, NameObject, TagObject, Record);
                            } else {
                                if (this.Fix_Name_Support.has(Website)) {
                                    Record = await this.Get_Pixiv_Name(TailId) ?? NameObject.textContent;
                                    this.Fix_Update_Ui(Url, TailId, NameObject, TagObject, Record);
                                    this.Fix_Cache.set(TailId, Record); // 添加數據
                                    this.Save_Work(); // 呼叫保存工作
                                } else {
                                    Record = NameObject.textContent;
                                    this.Fix_Update_Ui(Url, TailId, NameObject, TagObject, Record);
                                }
                            }
                        },
                        /* ===== 前置處理觸發 ===== */
                        Search_Fix: async function (items) { // 針對 搜尋頁, 那種有許多用戶卡的
                            items.setAttribute("fix", true); // 添加修復標籤

                            const url = items.href;
                            const img = Syn.$$("img", {root: items});
                            const parse = this.Fix_Url(url);

                            img.setAttribute("jump", url); // 圖片設置跳轉連結
                            items.removeAttribute("href"); // 刪除原始跳轉連結
                            img.removeAttribute("src"); // 刪除圖片跳轉連結

                            this.Fix_Trigger({
                                Url: url, // 跳轉連結
                                TailId: parse[1], // 尾部 id 標號
                                Website: parse[0], // 網站
                                NameObject: Syn.$$(".user-card__name", {root: items}), // 名稱物件
                                TagObject: Syn.$$(".user-card__service", {root: items}) // 標籤物件
                            });
                        },
                        Other_Fix: async function (artist, tag="", href=null, reTag="<fix_view>") { // 針對其餘頁面的修復
                            try {
                                const parent = artist.parentNode;
                                const url = href ?? parent.href;
                                const parse = this.Fix_Url(url);

                                await this.Fix_Trigger({
                                    Url: url,
                                    TailId: parse[1],
                                    Website: parse[0],
                                    NameObject: artist,
                                    TagObject: tag
                                });

                                $(parent).replaceWith(function() {
                                    return $(reTag, { html: $(this).html()})
                                });
                            } catch {/* 防止動態監聽進行二次操作時的錯誤 (因為 DOM 已經被修改) */}
                        },
                        Dynamic_Fix: async function (Listen, Operat,  Config=null) {
                            let observer, options;
                            Syn.Observer(Listen, ()=> {
                                this.Record_Cache = this.Get_Record(); // 觸發時重新抓取
                                const wait = setInterval(()=> { // 為了確保找到 Operat 元素
                                    const operat = typeof Operat === "string" ? Syn.$$(Operat) : Operat;
                                    if (operat) {
                                        clearInterval(wait);
                                        switch (Config) {
                                            case 1: // 針對 QuickPostToggle 的動態監聽 (也可以直接在 QuickPost 寫初始化呼叫)
                                                this.Other_Fix(operat);
                                                setTimeout(()=> { // 修復後延遲一下, 斷開原先觀察對象, 設置為子元素, 原因是因為 react 渲染造成 dom 的修改, 需重新設置
                                                    observer.disconnect();
                                                    observer.observe(Listen.children[0], options);
                                                }, 300);
                                                break;
                                            default: // 針對搜尋頁的動態監聽
                                                for (const items of Syn.$$("a", {all: true, root: operat})) {
                                                    !items.getAttribute("fix") && this.Search_Fix(items); // 沒有修復標籤的才修復
                                                }
                                        }
                                    }
                                })
                            }, {subtree: false}, back => {
                                observer = back.ob;
                                options = back.op;
                            });
                        }
                    }
                    this.FixArtist_Cache = Fix_Requ;
                };
                return this.FixArtist_Cache;
            }
        }

        return {
            SidebarCollapse: async (Config) => { /* 收縮側邊攔 */
                if (Syn.Device.Type() === "Mobile") return;

                Syn.AddStyle(`
                    .global-sidebar {
                        opacity: 0;
                        height: 100%;
                        width: 10rem;
                        display: flex;
                        position: fixed;
                        padding: 0.5em 0;
                        transition: 0.8s;
                        background: #282a2e;
                        flex-direction: column;
                        transform: translateX(-9rem);
                    }
                    .global-sidebar:hover {opacity: 1; transform: translateX(0rem);}
                    .content-wrapper.shifted {transition: 0.7s; margin-left: 0rem;}
                    .global-sidebar:hover + .content-wrapper.shifted {margin-left: 10rem;}
                `, "Collapse_Effects", false);
            },
            DeleteNotice: async (Config) => { /* 刪除公告通知 */
                Syn.$$("body > div.content-wrapper.shifted > a")?.remove();
            },
            BlockAds: async (Config) => { /* (阻止/封鎖)廣告 */
                Syn.AddStyle(`
                    .ipprtcnt, .root--ujvuu, .ad-container {display: none !important}
                `, "Ad-blocking-style", false);
                Syn.AddScript(`
                    const XMLRequest = XMLHttpRequest.prototype.open;
                    const Ad_observer = new MutationObserver(() => {
                        XMLHttpRequest.prototype.open = function(method, Url) {
                            if (Url.endsWith(".m3u8") || Url === "https://s.magsrv.com/v1/Syn.php") {return}
                            XMLRequest.apply(this, arguments);
                        };
                        document.querySelector("div.ex-over-btn")?.click();
                        document.querySelector(".root--ujvuu button")?.click();
                        document.querySelectorAll(".ad-container").forEach(ad => {ad.remove()});
                    });
                    Ad_observer.observe(document.head, {childList: true, subtree: true});
                `, "Ad-blocking-script", false);
            },
            TextToLink: async (Config) => { /* 連結文本轉連結 */
                if (!DLL.IsContent && !DLL.IsAnnouncement) return;

                const Func = LoadFunc.TextToLink_Dependent(Config);

                if (DLL.IsContent) {
                    Syn.WaitElem("div.post__body", body => {
                        Func.JumpTrigger(body);

                        const [article, content] = [
                            Syn.$$("article", {root: body}),
                            Syn.$$("div.post__content", {root: body})
                        ];

                        if (article) {
                            let span;
                            for (span of Syn.$$("span.choice-text", {all: true, root: article})) {
                                Func.ParseModify(span, span.textContent);
                            }
                        } else if (content) {
                            const pre = Syn.$$("pre", {root: content});
                            pre
                                ? Func.Process(pre)
                                : Func.Multiprocessing(content);
                        }
                    }, {throttle: 600});

                } else if (DLL.IsAnnouncement) {
                    Syn.WaitElem("div.card-list__items pre", content => {
                        Func.JumpTrigger(Syn.$$("div.card-list__items"));

                        let pre;
                        for (pre of content) {
                            pre.childNodes.length > 1
                                ? Func.Multiprocessing(pre)
                                : Func.Process(pre);
                        }
                    }, {raf: true, all: true});
                }
            },
            FixArtist: async (Config) => { /* 修復藝術家名稱 */
                DLL.Style.Global(); // 導入 Global 頁面樣式
                const Func = LoadFunc.FixArtist_Dependent();

                // 監聽點擊事件
                const [Device, Newtab, Active, Insert] = [
                    Syn.Device.Type(),
                    Config.newtab ?? true,
                    Config.newtab_active ?? false,
                    Config.newtab_insert ?? false,
                ];

                Syn.AddListener(document.body, "click", event=> {
                    const target = event.target;

                    if (target.matches("fix_edit")) {
                        const display = target.nextElementSibling; // 取得下方的 name 元素
                        const text = GM_addElement("textarea", {
                            class: "edit_textarea",
                            style: `height: ${display.scrollHeight + 10}px;`,
                        });

                        const original_name = display.textContent;
                        text.value = original_name.trim();
                        display.parentNode.insertBefore(text, target);

                        text.scrollTop = 0; // 滾動到最上方
                        setTimeout(() => {
                            text.focus() // 設置焦點
                            setTimeout(() => { // 避免還沒設置好焦點就觸發
                                Syn.Listen(text, "blur", ()=> {
                                    const change_name = text.value.trim();
                                    if (change_name != original_name) {
                                        display.textContent = change_name; // 修改顯示名
                                        Func.Save_Record(new Map([[target.id, change_name]])); // 保存修改名
                                    }
                                    text.remove();
                                }, { once: true, passive: true });
                            }, 50);
                        }, 300);
                    } else if (target.matches("fix_name") || target.matches("fix_tag") || target.matches("img")) {
                        const jump = target.getAttribute("jump");
                        if (!target.parentNode.matches("fix_cont") && jump) {
                            !Newtab || DLL.IsSearch && Device == "Mobile"
                                ? location.assign(jump)
                                : GM_openInTab(jump, { active: Active, insert: Insert });
                        } else if (jump) { // 內容頁面
                            location.assign(jump);
                        }
                    }
                }, { capture: true, passive: true, mark: "FixArtist" });

                Func.Record_Cache = Func.Get_Record(); // 讀取修復 數據到緩存
                // 搜尋頁面, 與一些特殊預覽頁
                if (DLL.IsSearch) {
                    const card_items = Syn.$$(".card-list__items");

                    if (DLL.Link.test(Url)) {
                        const artist = Syn.$$("span[itemprop='name']");
                        artist && Func.Other_Fix(artist); // 預覽頁的 名稱修復

                        for (const items of Syn.$$("a", {all: true, root: card_items})) { // 針對 links 頁面的 card
                            Func.Search_Fix(items);
                        }
                        Url.endsWith("new") && Func.Dynamic_Fix(card_items, card_items); // 針對 links/new 頁面的 card
                    } else { //! 還需要測試
                        Func.Dynamic_Fix(card_items, card_items);
                        GM_addElement(card_items, "fix-trigger", {style: "display: none;"});
                    }

                } else if (DLL.IsContent) { // 是內容頁面
                    const [artist, title] = [
                        Syn.$$(".post__user-name"),
                        Syn.$$("h1 span:nth-child(2)")
                    ];
                    Func.Other_Fix(artist, title, artist.href, "<fix_cont>");

                } else { // 預覽頁面
                    const artist = Syn.$$("span[itemprop='name']");
                    if(artist) {
                        Func.Other_Fix(artist);

                        if (User_Config.Preview.QuickPostToggle.enable) { // 啟用該功能才需要動態監聽
                            setTimeout(()=> {
                                Func.Dynamic_Fix(Syn.$$("section"), "span[itemprop='name']", 1);
                            }, 300);
                        }
                    }
                }
            },
            BackToTop: async (Config) => { /* 翻頁後回到頂部 */
                Syn.AddListener(document.body, "pointerup", event=> {
                    event.target.closest("#paginator-bottom") && Syn.$$("#paginator-top").scrollIntoView();
                }, { capture: true, passive: true, mark: "BackToTop" });
            },
            KeyScroll: async (Config) => { /* 快捷自動滾動 */
                if (Syn.Device.Type() === "Mobile") return;

                // 滾動配置
                const Scroll_Requ = {
                    Scroll_Pixels: 2,
                    Scroll_Interval: 800,
                };

                const UP_ScrollSpeed = Scroll_Requ.Scroll_Pixels * -1;
                let Scroll, Up_scroll = false, Down_scroll = false;

                const [TopDetected, BottomDetected] = [ // 到頂 和 到底 的檢測
                    Syn.Throttle(() => {
                        Up_scroll = Syn.Device.sY() == 0
                        ? false : true
                    }, 600),
                    Syn.Throttle(() => {
                        Down_scroll = Syn.Device.sY() + Syn.Device.iH() >= document.documentElement.scrollHeight
                        ? false : true
                    }, 600)
                ];

                switch (Config.mode) {
                    case 2:
                        Scroll = (Move) => {
                            const Interval = setInterval(()=> {
                                if (!Up_scroll && !Down_scroll) {
                                    clearInterval(Interval);
                                }

                                if (Up_scroll && Move < 0) {
                                    window.scrollBy(0, Move);
                                    TopDetected();
                                } else if (Down_scroll && Move > 0) {
                                    window.scrollBy(0, Move);
                                    BottomDetected();
                                }
                            }, Scroll_Requ.Scroll_Interval);
                        }
                    default:
                        Scroll = (Move) => {
                            if (Up_scroll && Move < 0) {
                                window.scrollBy(0, Move);
                                TopDetected();
                                requestAnimationFrame(() => Scroll(Move));
                            } else if (Down_scroll && Move > 0) {
                                window.scrollBy(0, Move);
                                BottomDetected();
                                requestAnimationFrame(() => Scroll(Move));
                            }
                        }
                }

                Syn.Listen(window, "keydown", Syn.Throttle(event => {
                    const key = event.key;
                    if (key == "ArrowUp") {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        if (Up_scroll) {
                            Up_scroll = false;
                        } else if (!Up_scroll || Down_scroll) {
                            Down_scroll = false;
                            Up_scroll = true;
                            Scroll(UP_ScrollSpeed);
                        }
                    } else if (key == "ArrowDown") {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        if (Down_scroll) {
                            Down_scroll = false;
                        } else if (Up_scroll || !Down_scroll) {
                            Up_scroll = false;
                            Down_scroll = true;
                            Scroll(Scroll_Requ.Scroll_Pixels);
                        }
                    }
                }, 100), { capture: true });
            }
        }
    };

    /* ==================== 預覽頁功能 ==================== */
    function Preview_Function() {
        return {
            NewTabOpens: async (Config) => { /* 將預覽頁面 開啟帖子都變成新分頁開啟 */
                const [Newtab, Active, Insert] = [
                    Config.newtab ?? true,
                    Config.newtab_active ?? false,
                    Config.newtab_insert ?? false,
                ];

                Syn.AddListener(document.body, "click", event => {
                    const target = event.target.closest("article a");

                    target && (
                        event.preventDefault(),
                        !Newtab
                            ? location.assign(target.href)
                            : GM_openInTab(target.href, { active: Active, insert: Insert })
                    );
                }, {capture: true, mark: "NewTabOpens"});
            },
            QuickPostToggle: async (Config) => { /* 預覽換頁 快速切換 */
                DLL.Style.Preview(); // 導入 Preview 頁面樣式

                // 監聽觸發 獲取下一頁數據
                Syn.AddListener(document.body, "click", event => {
                    const target = event.target.closest("menu a");
                    target && (event.preventDefault(), GetNextPage(target.href));
                }, {capture: true, mark: "QuickPostToggle"});

                async function GetNextPage(link) {
                    const old_section = Syn.$$("section"); // 獲取當前頁面的 section
                    const items = Syn.$$(".card-list__items"); // 用於載入 加載圖示
                    requestAnimationFrame(()=> {GM_addElement(items, "img", {class: "gif-overlay"})});
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: link,
                        nocache: false,
                        onload: response => {
                            const new_section = Syn.$$("section", {root: response.responseXML});
                            ReactDOM.render(React.createElement(DLL.Rendering, { content: new_section.innerHTML }), old_section);
                            history.pushState(null, null, link);
                        },
                        onerror: error => {GetNextPage(link)}
                    });
                }
            },
            CardZoom: async (Config) => { /* 帖子預覽卡縮放效果 */
                switch (Config.mode) {
                    case 2:
                        Syn.AddStyle(`
                            .post-card a:hover {
                                overflow: auto;
                                z-index: 99999;
                                background: #000;
                                border: 1px solid #fff6;
                                transform: scale(1.6, 1.5);
                            }
                            .post-card a::-webkit-scrollbar {
                                width: 0;
                                height: 0;
                            }
                            .post-card a:hover .post-card__image-container {
                                position: relative;
                            }
                        `, "CardZoom_Effects_2", false);
                    default:
                        Syn.AddStyle(`
                            * { --card-size: 13vw; }
                            .post-card { margin: .3vw; }
                            .post-card a img { border-radius: 8px; }
                            .post-card a {
                                border-radius: 8px;
                                border: 3px solid #fff6;
                                transition: transform 0.4s;
                            }
                        `, "CardZoom_Effects", false);
                }
            },
            CardText: async (Config) => { /* 帖子說明文字效果 */
                if (Syn.Device.Type() === "Mobile") return;

                switch (Config.mode) {
                    case 2:
                        Syn.AddStyle(`
                            .post-card__header, .post-card__footer {
                                opacity: 0.4;
                                transition: opacity 0.3s;
                            }
                            a:hover .post-card__header,
                            a:hover .post-card__footer {
                                opacity: 1;
                            }
                        `, "CardText_Effects_2", false); break;
                    default:
                        Syn.AddStyle(`
                            .post-card__header {
                                opacity: 0;
                                z-index: 1;
                                padding: 5px;
                                pointer-events: none;
                                transform: translateY(-6vh);
                            }
                            .post-card__footer {
                                opacity: 0;
                                z-index: 1;
                                padding: 5px;
                                pointer-events: none;
                                transform: translateY(6vh);
                            }
                            a:hover .post-card__header,
                            a:hover .post-card__footer {
                                opacity: 1;
                                pointer-events: auto;
                                transform: translateY(0vh);
                                transition: transform 0.4s, opacity 0.6s;
                            }
                        `, "CardText_Effects", false);
                }
            }
        }
    };

    /* ==================== 內容頁功能 ==================== */
    function Content_Function() {
        const LoadFunc = {
            LinkBeautify_Cache: undefined,
            LinkBeautify_Dependent: function () {
                if (!this.LinkBeautify_Cache) {
                    this.LinkBeautify_Cache = async function ShowBrowse(Browse) {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: Browse.href,
                                onload: response => {
                                    const Main = Syn.$$("main", {root: response.responseXML});
                                    const View = GM_addElement("View", {class: "View"});
                                    const Buffer = document.createDocumentFragment();
                                    for (const br of Syn.$$("br", {all: true, root: Main})) { // 取得 br 數據
                                        Buffer.append( // 將以下元素都添加到 Buffer
                                            document.createTextNode(br.previousSibling.textContent.trim()),
                                            br
                                        );
                                    }
                                    View.appendChild(Buffer);
                                    Browse.appendChild(View);
                                },
                                onerror: error => {ShowBrowse(Browse)}
                            });
                        }
                };
                return this.LinkBeautify_Cache;
            },
            VideoBeautify_Cache: undefined,
            VideoBeautify_Dependent: function () {
                if (!this.VideoBeautify_Cache) {
                    this.VideoBeautify_Cache = function VideoRendering({ stream }) {
                        return React.createElement("summary", {
                                className: "video-title"
                            } , React.createElement("video", {
                                key: "video",
                                controls: true,
                                preload: "auto",
                                "data-setup": JSON.stringify({}),
                                className: "post-video",
                            },
                            React.createElement("source", {
                                key: "source",
                                src: stream.src,
                                type: stream.type
                            })
                        ));
                    }
                };
                return this.VideoBeautify_Cache;
            },
            ExtraButton_Cache: undefined,
            ExtraButton_Dependent: function() {
                if (!this.ExtraButton_Cache) {
                    this.ExtraButton_Cache = async function GetNextPage(url, old_main) {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: url,
                            nocache: false,
                            onload: response => {
                                const New_main = Syn.$$("main", {root: response.responseXML});
                                ReactDOM.render(React.createElement(DLL.Rendering, { content: New_main.innerHTML }), old_main);
                                history.pushState(null, null, url);
                                setTimeout(()=> {
                                    Enhance.ExtraInitial(); // 重新呼叫增強
                                    Syn.WaitElem("div.post__content", post=> {
                                        // 刪除所有只有 br 標籤的元素
                                        Syn.$$("p", {all: true, root: post}).forEach(p=> {
                                            p.childNodes.forEach(node=>{node.nodeName == "BR" && node.parentNode.remove()});
                                        });
                                        // 刪除所有是圖片連結的 a
                                        Syn.$$("a", {all: true, root: post}).forEach(a=> {
                                            /\.(jpg|jpeg|png|gif)$/i.test(a.href) && a.remove()
                                        });
                                    }, {throttle: 300});
                                    Syn.$$("h1.post__title").scrollIntoView(); // 滾動到上方
                                }, 300);
                            },
                            onerror: error => {GetNextPage(url, old_main)}
                        });
                    }
                };
                return this.ExtraButton_Cache;
            }
        }

        return {
            LinkBeautify: async function (Config) { /* 懸浮於 browse » 標籤時, 直接展示文件, 刪除下載連結前的 download 字樣, 並解析轉換連結 */
                Syn.AddStyle(`
                    .View {
                        top: -10px;
                        padding: 10%;
                        display: none;
                        overflow: auto;
                        color: #f2f2f2;
                        font-size: 14px;
                        font-weight: 600;
                        position: absolute;
                        white-space: nowrap;
                        border-radius: .5rem;
                        left: calc(100% + 10px);
                        border: 1px solid #737373;
                        background-color: #3b3e44;
                    }
                    a:hover .View { display: block }
                `, "Link_Effects", false);
                Syn.WaitElem("a.post__attachment-link", post => {
                    const ShowBrowse = LoadFunc.LinkBeautify_Dependent();

                    for (const link of post) {
                        link.setAttribute("download", ""); // 修改標籤字樣
                        link.href = decodeURIComponent(link.href); // 解碼 url, 並替代原 url
                        link.textContent = link.textContent.replace("Download", "").trim();

                        const Browse = link.nextElementSibling; // 查找是否含有 Browse 元素
                        if (!Browse) continue;

                        Browse.style.position = "relative"; // 修改樣式避免跑版
                        ShowBrowse(Browse); // 請求顯示 Browse 數據
                    }
                }, {all: true, throttle: 600});
            },
            VideoBeautify: async function (Config) { /* 調整影片區塊大小, 將影片名稱轉換成下載連結 */
                Syn.AddStyle(`
                    .video-title {margin-top: 0.5rem;}
                    .post-video {height: 50%; width: 60%;}
                `, "Video_Effects", false);
                Syn.WaitElem("ul[style*='text-align: center;list-style-type: none;'] li:not([id])", parents => {
                    Syn.WaitElem("a.post__attachment-link", post => {
                        const VideoRendering = LoadFunc.VideoBeautify_Dependent();

                        let li;
                        for (li of parents) {
                            let [node, title, stream] = [
                                undefined,
                                Syn.$$("summary", {root: li}),
                                Syn.$$("source", {root: li})
                            ];

                            if (!title || !stream) continue;
                            if (title.previousElementSibling) continue; // 排除極端狀況下的重複添加

                            let link;
                            for (link of post) {
                                if (link.textContent.includes(title.textContent)) {
                                    switch (Config.mode) {
                                        case 2: // 因為移動節點 需要刪除再去複製 因此不使用 break
                                            link.parentNode.remove();
                                        default:
                                            node = link.cloneNode(true);
                                    }
                                }
                            }

                            // 重新渲染影片, 避免跑版
                            ReactDOM.render(React.createElement(VideoRendering, { stream: stream }), li);
                            // 將連結元素進行插入 (確保不重複添加)
                            li.insertBefore(node, Syn.$$("summary", {root: li}));
                        }

                    }, {all: true, throttle: 300});
                }, {all: true, throttle: 600});
            },
            OriginalImage: async function (Config) { /* 自動載入原圖 */
                Syn.WaitElem("div.post__thumbnail", thumbnail => {

                    /**
                     * 這邊的邏輯, 因為是有延遲運行, 如果還在運行當中,
                     * 頁面被 ExtraButton 的功能進行換頁, 就會出現報錯, 但我懶的處理
                     *
                     * 另外這邊不使用 LoadFunc 懶加載的方式, 也是因為當 ExtraButton 換頁, 先前的函數還沒運行完成
                     * 再次添加新的數據, 會有各種神奇的錯誤, 所以只能每次重新宣告
                     */
                    const Origina_Requ = { // 自動原圖所需
                        Reload: async (Img, Retry) => { // 載入原圖 (死圖重試)
                            if (Retry > 0) {
                                setTimeout(() => {
                                    const src = Img.src;
                                    Img.src = "";
                                    Object.assign(Img, {
                                        src: src,
                                        alt: "Loading Failed"
                                    });
                                    Img.onload = function() { Img.classList.remove("Image-loading-indicator") };
                                    Img.onerror = function() { Origina_Requ.Reload(Img, Retry-1) };
                                }, 1000);
                            }
                        },
                        FailedClick: async () => {
                            //! 監聽點擊事件 當點擊的是載入失敗的圖片才觸發 (監聽對象 需要測試)
                            Syn.Listen(Syn.$$("div.post__files"), "click", event => {
                                const target = event.target.matches(".Image-link img");
                                if (target && target.alt == "Loading Failed") {
                                    const src = img.src;
                                    img.src = "";
                                    img.src = src;
                                }
                            }, {capture: true, passive: true});
                        },
                        ImgRendering: ({ ID, href }) => { // 渲染圖像
                            return React.createElement("div", {
                                id: ID,
                                className: "Image-link"
                            }, React.createElement("img", {
                                key: "img",
                                src: href.href,
                                className: "Image-loading-indicator Image-style",
                                onLoad: function () {
                                    Syn.$$(`#${ID} img`).classList.remove("Image-loading-indicator");
                                },
                                onError: function () {
                                    Origina_Requ.Reload(Syn.$$(`#${ID} img`), 10);
                                }
                            })
                        )},
                        FastAuto: async function() { // mode 1 預設 (快速自動)
                            this.FailedClick();
                            thumbnail.forEach((object, index) => {
                                setTimeout(()=> {
                                    object.removeAttribute("class");
                                    const a = Syn.$$("a", {root: object});
                                    ReactDOM.render(React.createElement(this.ImgRendering, { ID: `IMG-${index}`, href: a }), object);
                                }, index * 300);
                            });
                        },
                        SlowAuto: async (index) => {
                            if (index == thumbnail.length) return;
                            const object = thumbnail[index];
                            object.removeAttribute("class");

                            const a = Syn.$$("a", {root: object});
                            const img = Syn.$$("img", {root: a});

                            Object.assign(img, {
                                className: "Image-loading-indicator Image-style",
                                src: a.href,
                            });

                            img.removeAttribute("data-src");
                            a.id = `IMG-${index}`;
                            a.removeAttribute("href");
                            a.removeAttribute("download");

                            img.onload = function() {
                                img.classList.remove("Image-loading-indicator");
                                Origina_Requ.SlowAuto(++index);
                            };
                        },
                        ObserveTrigger: function() { // mode 3 (觀察觸發)
                            this.FailedClick();
                            return new IntersectionObserver(observed => {
                                observed.forEach(entry => {
                                    if (entry.isIntersecting) {
                                        const object = entry.target;
                                        observer.unobserve(object);
                                        ReactDOM.render(React.createElement(this.ImgRendering, { ID: object.alt, href: Syn.$$("a", {root: object}) }), object);
                                        object.removeAttribute("class");
                                    }
                                });
                            }, { threshold: 0.3 });
                        }
                    };

                    /* 模式選擇 */
                    let observer;
                    switch (Config.mode) {
                        case 2:
                            Origina_Requ.SlowAuto(0);
                            break;
                        case 3:
                            observer = Origina_Requ.ObserveTrigger();
                            thumbnail.forEach((object, index) => {
                                object.alt = `IMG-${index}`;
                                observer.observe(object);
                            });
                            break;

                        default:
                            if (document.visibilityState === "hidden") { // 當可見時才觸發快速自動原圖
                                Syn.Listen(document, "visibilitychange", ()=> {
                                    document.visibilityState === "visible" && Origina_Requ.FastAuto();
                                }, { once: true });
                            } else Origina_Requ.FastAuto();
                    }
                }, {all: true, throttle: 600});
            },
            ExtraButton: async function (Config) { /* 下方額外擴充按鈕 (這個該死的功能, 在換頁後會造成其他功能各種 Bug, 浪費我許多時間處理, 真不知道我寫他幹嘛) */
                DLL.Style.Awesome(); // 導入 Awesome 需求樣式
                const GetNextPage = LoadFunc.ExtraButton_Dependent();

                Syn.WaitElem("h2.site-section__subheading", comments => {
                    const [Prev, Next, Svg, Span, Buffer] = [
                        Syn.$$("a.post__nav-link.prev"),
                        Syn.$$("a.post__nav-link.next"),
                        document.createElement("svg"),
                        document.createElement("span"),
                        document.createDocumentFragment()
                    ];

                    Svg.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="margin-left: 10px;cursor: pointer;">
                            <style>svg{fill: ${DLL.Color}}</style>
                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"></path>
                        </svg>
                    `;

                    Span.id = "next_box";
                    Span.style = "float: right";

                    const Next_btn = Next.cloneNode(true);
                    Next_btn.setAttribute("jump", Next_btn.href);
                    Next_btn.removeAttribute("href");

                    // 點擊回到上方的按鈕
                    Syn.Listen(Svg, "click", () => {
                        Syn.$$("header").scrollIntoView();
                    }, { capture: true, passive: true });

                    // 點擊切換下一頁按鈕
                    Syn.Listen(Next_btn, "click", ()=> {
                        GetNextPage(
                            Next_btn.getAttribute("jump"),
                            Syn.$$("main")
                        );
                    }, { capture: true, once: true });

                    Span.appendChild(Next_btn)
                    Buffer.append(Svg, Span);
                    comments.appendChild(Buffer);

                }, {throttle: 600});
            },
            CommentFormat: async function (Config) { /* 評論區 重新排版 */
                Syn.AddStyle(`
                    .post__comments {display: flex; flex-wrap: wrap;}
                    .post__comments>*:last-child {margin-bottom: 0.5rem;}
                    .comment {
                        margin: 0.5rem;
                        max-width: 25rem;
                        border-radius: 10px;
                        flex-basis: calc(35%);
                        word-break: break-all;
                        border: 0.125em solid var(--colour1-secondary);
                    }
                `, "Comment_Effects", false);
            }
        }
    };

    /* ==================== 設置菜單 ==================== */
    async function $on(element, type, listener) {$(element).on(type, listener)};
    async function MenuTrigger(lang) {
        Syn.Menu({[lang.RM_01]: { func: ()=> Create_Menu() }});
    }
    function Create_Menu() {
        if (Syn.$$(".modal-background")) return;

        const set = DLL.ImgSet();
        const {log, lang} = DLL.Language();
        const img_data = [set.Height, set.Width, set.MaxWidth, set.Spacing]; // 這樣寫是為了讓讀取保存設置可以按照順序 (菜單有索引問題)

        let analyze, parent, child, img_set, img_input, img_select, set_value, save_cache = {};

        const menu = `
            <div class="modal-background">
                <div class="modal-interface">
                    <table class="modal-box">
                        <tr>
                            <td class="menu">
                                <h2 class="menu-text">${lang.MT_01}</h2>
                                <ul>
                                    <li>
                                        <a class="toggle-menu" href="#image-settings-show">
                                            <button class="menu-options" id="image-settings">${lang.MO_01}</button>
                                        </a>
                                    <li>
                                    <li>
                                        <a class="toggle-menu" href="#">
                                            <button class="menu-options" disabled>null</button>
                                        </a>
                                    <li>
                                </ul>
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td class="content" id="set-content">
                                            <div id="image-settings-show" class="form-hidden">
                                                <div>
                                                    <h2 class="narrative">${lang.MIS_01}：</h2>
                                                    <p><input type="number" id="Height" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                                <div>
                                                    <h2 class="narrative">${lang.MIS_02}：</h2>
                                                    <p><input type="number" id="Width" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                                <div>
                                                    <h2 class="narrative">${lang.MIS_03}：</h2>
                                                    <p><input type="number" id="MaxWidth" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                                <div>
                                                    <h2 class="narrative">${lang.MIS_04}：</h2>
                                                    <p><input type="number" id="Spacing" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="button-area">
                                            <select id="language">
                                                <option value="" disabled selected>${lang.ML_01}</option>
                                                <option value="en-US">${lang.ML_02}</option>
                                                <option value="zh-TW">${lang.ML_03}</option>
                                                <option value="zh-CN">${lang.ML_04}</option>
                                                <option value="ja">${lang.ML_05}</option>
                                            </select>
                                            <button id="readsettings" class="button-options" disabled>${lang.MB_01}</button>
                                            <span class="button-space"></span>
                                            <button id="closure" class="button-options">${lang.MB_02}</button>
                                            <span class="button-space"></span>
                                            <button id="application" class="button-options">${lang.MB_03}</button>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        `;

        // 設置可拖動效果, 並添加到 dom 中
        $(document.body).append(menu);
        $(".modal-interface").draggable({ cursor: "grabbing" });
        $(".modal-interface").tabs();

        // 調整選項
        const UnitOptions = `
            <select class="Image-input-settings" style="margin-left: 1rem;">
                <option value="px" selected>px</option>
                <option value="%">%</option>
                <option value="rem">rem</option>
                <option value="vh">vh</option>
                <option value="vw">vw</option>
                <option value="auto">auto</option>
            </select>
        `;

        const Menu_Requ = {
            Menu_Close: () => { // 關閉菜單
                $(".modal-background")?.off();
                $(".modal-background")?.remove();
            },
            Menu_Save: () => { // 保存菜單
                const menu_interface = $(".modal-interface"); // 取出菜單位置數據
                const top = menu_interface.css("top");
                const left = menu_interface.css("left");
                Syn.Store("s", DLL.SaveKey.Menu, {Top: top, Left: left}); // 保存設置數據
                // 設置到樣式表內 不用重整可以直接改變
                DLL.Style_Pointer.Top(top);
                DLL.Style_Pointer.Left(left);
            },
            Img_Save: () => {
                img_set = $("#image-settings-show").find("p"); // 獲取設定 DOM 參數
                img_data.forEach((read, index) => {
                    img_input = img_set.eq(index).find("input");
                    img_select = img_set.eq(index).find("select");
                    if (img_select.val() == "auto") {set_value = "auto"}
                    else if (img_input.val() == "") {set_value = read}
                    else {set_value = `${img_input.val()}${img_select.val()}`}
                    save_cache[img_input.attr("id")] = set_value;
                });
                Syn.Store("s", DLL.SaveKey.Img, save_cache); // 保存設置數據
            },
            ImageSettings: async () => {
                $on(".Image-input-settings", "input change", function (event) {
                    event.stopPropagation();
                    const target = $(this), value = target.val(), id = target.attr("id");
                    parent = target.closest("div");
                    if (isNaN(value)) {
                        child = parent.find("input");
                        if (value === "auto") {
                            child.prop("disabled", true);
                            DLL.Style_Pointer[child.attr("id")](value);
                        } else {
                            child.prop("disabled", false);
                            DLL.Style_Pointer[child.attr("id")](`${child.val()}${value}`);
                        }
                    } else {
                        child = parent.find("select");
                        DLL.Style_Pointer[id](`${value}${child.val()}`);
                    }
                });
            },
        }

        $("#language").val(log ?? "en-US"); // 添加語言設置
        // 語言選擇
        $on("#language", "input change", function (event) {
            event.stopPropagation();
            $("#language").off("input change");

            const value = $(this).val(); // 取得選擇
            Syn.Store("s", DLL.SaveKey.Lang, value);

            Menu_Requ.Menu_Save();
            Menu_Requ.Menu_Close();
            MenuTrigger(DLL.Language().lang); // 根據選擇語言更新菜單
            Create_Menu(); // 重新創建
        });
        // 監聽菜單的點擊事件
        $on(".modal-interface", "click", function (event) {
            const id = $(event.target).attr("id");

            // 菜單功能選擇
            if (id == "image-settings") {
                img_set = $("#image-settings-show");
                if (img_set.css("opacity") === "0") {
                    img_set.find("p").each(function() {
                        $(this).append(UnitOptions);
                    });
                    img_set.css({
                        "height": "auto",
                        "width": "auto",
                        "opacity": 1
                    });
                    $("#readsettings").prop("disabled", false);
                    Menu_Requ.ImageSettings();
                }

            // 讀取保存設置
            } else if (id == "readsettings") {
                img_set = $("#image-settings-show").find("p");
                img_data.forEach((read, index) => {
                    img_input = img_set.eq(index).find("input");
                    img_select = img_set.eq(index).find("select");

                    if (read == "auto") {
                        img_input.prop("disabled", true);
                        img_select.val(read);
                    } else {
                        analyze = read.match(/^(\d+)(\D+)$/);
                        img_input.val(analyze[1]);
                        img_select.val(analyze[2]);
                    }
                })

            // 應用保存
            } else if (id == "application") {
                Menu_Requ.Img_Save();
                Menu_Requ.Menu_Save();
                Menu_Requ.Menu_Close();
            } else if (id == "closure") {
                Menu_Requ.Menu_Close();
            }
        });
    };
})();