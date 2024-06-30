// ==UserScript==
// @name         Hgamefree Revise
// @version      0.0.1
// @author       Canaan HS
// @description  將免則聲明區塊替換成 標題文字 與 解壓密碼, 並刪除不需要元素

// @match        *://hgamefree.info/adult-video-game/*

// @license      MIT
// @run-at       document-body
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==

(function() {

    function Throttle (func, delay) {
        let lastTime = 0;
        return (...args) => {
            const now = Date.now();
            if ((now - lastTime) >= delay) {
                lastTime = now;
                func(...args);
            }
        }
    }

    async function WaitMap (selectors, found, {
        timeout=8,
        throttle=50,
        subtree=true,
        childList=true,
        attributes=false,
        characterData=false,
        timeoutResult=false,
        object=document.body,
    }={}) {
        let timer, elements;

        const observer = new MutationObserver(Throttle(() => {
            elements = selectors.map(selector => document.querySelector(selector));
            if (elements.every(element => {return element !== null && typeof element !== "undefined"})) {
                observer.disconnect();
                clearTimeout(timer);
                found(elements);
            }
        }, throttle));

        observer.observe(object, {
            subtree: subtree,
            childList: childList,
            attributes: attributes,
            characterData: characterData
        });

        timer = setTimeout(() => {
            observer.disconnect();
            timeoutResult && found(elements);
        }, (1000 * timeout));
    }

    // 查找: 標題, 解壓密碼, 聲明框架, 其餘為要刪除的對象
    WaitMap([
        "h1.entry-title", "#custom_html-11", "#wppd-disclaimer-container",
        "#custom_html-13", "#custom_html-14", "#text-4"
    ], found=> {
        const [title, password, container,...needless] = found;

        container.replaceChildren(title.cloneNode(true), password);
        needless.forEach(node => node.remove());

    }, {timeout: 15, throttle: 300});

})();