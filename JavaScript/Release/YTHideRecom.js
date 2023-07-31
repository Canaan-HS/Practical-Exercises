// ==UserScript==
// @name         YT Hide Recom Tool
// @version      0.0.14
// @author       HentaiSaru
// @description  將 YT 某些元素進行隱藏
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @run-at       document-end
// @match        *://www.youtube.com/*

// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

/*
Original Author Page : [https://github.com/hoothin/]
Original Author Link : [https://greasyfork.org/zh-TW/scripts/438403-youtube-hide-related-suggestion-which-occlude-the-video]
*/

(function() {
    var currentUrl = window.location.href, transform=false;
    let pattern = /^https:\/\/www\.youtube\.com\/.+$/;
    // 在首頁不會載入以下方法
    if (pattern.test(currentUrl)) {
        // 為推薦卡添加 css 樣式
        let css = `
            .ytp-ce-element{opacity: 0.1!important;}
            .ytp-ce-element:hover{opacity: 1!important;}
        `;
        if (typeof GM_addStyle !== "undefined") {
            GM_addStyle(css);
        } else {
            let ElementNode = document.createElement("style");
            ElementNode.appendChild(document.createTextNode(css));
            (document.querySelector("head") || document.documentElement).appendChild(ElementNode);
        }
        /* -------------------------------------------- */
        const Menu = GM_registerMenuCommand(
            "📜 [功能說明]",
            function() {
                alert(
                    "功能失效時 [請重新整理] !!\n\n(Shift) : 完全隱藏影片尾部推薦\n(Alt + 1) : 隱藏右側影片推薦\n(Alt + 2) : 隱藏留言區\n(Alt + 3) : 隱藏功能選項\n(Alt + 4) : 隱藏播放清單資訊\n(Ctrl + Z) : 使用極簡化"
                );
            }
        );/* -------------------------------------------- */
        // 隱藏判斷
        function HideJudgment(element, gm="") {
            if (element.style.display === "none" || transform) {
                element.style.display = "block";
                if (gm !== "") {GM_setValue(gm, false);}
            } else {
                element.style.display = "none";
                if (gm !== "") {GM_setValue(gm, true);}
            }
        }
        function SetTrigger(element) {
            element.style.display = "none";
            return new Promise(resolve => {
                setTimeout(function() {
                    if (element.style.display === "none") {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }, 300);
            });
        }
        async function runAsync() {
            // 監聽快捷鍵
            document.addEventListener("keydown", function(event) {
                if (event.shiftKey) {
                    event.preventDefault();
                    let elements = document.querySelectorAll(".ytp-ce-element, .ytp-ce-covering");
                    elements.forEach(function(element) {
                        HideJudgment(element);
                    });
                } else if (event.ctrlKey && event.key === "z") {
                    event.preventDefault();
                    let UserMenu = document.getElementById("end");
                    let Message = document.getElementById("below");
                    let RecommViewing = document.getElementById("secondary");
                    let RecommViewing2 = document.getElementById("related");
                    if (GM_getValue("極簡化", [])) {
                        UserMenu.style.display = "block";
                        Message.style.display = "block";
                        RecommViewing.style.display = "block";
                        RecommViewing2.style.display = "block";
                        GM_setValue("極簡化", false);
                    } else {
                        UserMenu.style.display = "none";
                        Message.style.display = "none";
                        RecommViewing.style.display = "none";
                        RecommViewing2.style.display = "none";
                        GM_setValue("極簡化", true);
                    }
                } else if (event.altKey && event.key === "1") {
                    event.preventDefault();
                    let child = document.getElementById("secondary-inner").childElementCount;
                    if (child > 1) {// 子元素數量
                        let element1 = document.getElementById("secondary");
                        HideJudgment(element1, "Trigger_1");
                        let element2 = document.getElementById("related");
                        HideJudgment(element2, "Trigger_1");
                        transform = false;
                    } else {
                        let element2 = document.getElementById("related");
                        HideJudgment(element2, "Trigger_1");
                        transform = true;
                    }
                } else if (event.altKey && event.key === "2") {
                    event.preventDefault();
                    let element = document.getElementById("comments");
                    HideJudgment(element, "Trigger_2");
                } else if (event.altKey && event.key === "3") {
                    event.preventDefault();
                    let element = document.getElementById("menu-container");
                    HideJudgment(element, "Trigger_3");
                } else if (event.altKey && event.key === "4") {
                    event.preventDefault();
                    let element = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                    HideJudgment(element, "Trigger_4");
                }
            });
            // 判斷在播放頁面運行
            let VVP_Pattern = /^https:\/\/www\.youtube\.com\/watch\?v=.+$/;
            // 判斷在播放清單運行
            let Playlist_Pattern = /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/;
            let Lookup_Delay = 500;
            if (VVP_Pattern.test(currentUrl)) {
                if (GM_getValue("極簡化", [])) {
                    let interval;
                    interval = setInterval(function() {
                        let UserMenu = document.getElementById("end");
                        let Message = document.getElementById("below");
                        let RecommViewing = document.getElementById("secondary");
                        let RecommViewing2 = document.getElementById("related");
                        if (UserMenu && Message && RecommViewing && RecommViewing2) {
                            Promise.all([SetTrigger(UserMenu), SetTrigger(Message), SetTrigger(RecommViewing), SetTrigger(RecommViewing2)]).then(results => {
                                if (results[0] && results[1] && results[2] && results[3]) {
                                    clearInterval(interval);
                                }
                            });
                        }
                    }, Lookup_Delay);
                }
                if (GM_getValue("Trigger_1", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("secondary");
                        let element2 = document.getElementById("related");
                        if (element && element2) {
                            Promise.all([SetTrigger(element), SetTrigger(element2)]).then(results => {
                                if (results[0] && results[1]) {
                                    clearInterval(interval);
                                }
                            });
                        }
                    }, Lookup_Delay);
                }
                if (GM_getValue("Trigger_2", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("comments");
                        if (element) {
                            SetTrigger(element).then(result => {
                                clearInterval(interval);
                            });
                        }
                    }, Lookup_Delay);
                }
                if (GM_getValue("Trigger_3", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.getElementById("menu-container");
                        if (element) {
                            SetTrigger(element).then(result => {
                                clearInterval(interval);
                            });
                        }
                    }, Lookup_Delay);
                }
            } else if (Playlist_Pattern.test(currentUrl)) {
                if (GM_getValue("Trigger_4", [])){
                    let interval;
                    interval = setInterval(function() {
                        let element = document.querySelector("#page-manager > ytd-browse > ytd-playlist-header-renderer > div");
                        if (element) {
                            SetTrigger(element).then(result => {
                                clearInterval(interval);
                            });
                        }
                    }, Lookup_Delay);
                }
            }
        }
        // 異步運行
        runAsync();
    }
})();