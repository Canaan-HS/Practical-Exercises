// ==UserScript==
// @name         Kemono 下載工具
// @name:zh-TW   Kemono 下載工具
// @name:zh-CN   Kemono 下载工具
// @name:ja      Kemono ダウンロードツール
// @name:en      Kemono DownloadTool
// @version      0.0.14
// @author       HentiSaru
// @description         一鍵下載圖片 (壓縮下載/單圖下載) , 頁面數據創建 json 下載 , 一鍵開啟當前所有帖子
// @description:zh-TW   一鍵下載圖片 (壓縮下載/單圖下載) , 頁面數據創建 json 下載 , 一鍵開啟當前所有帖子
// @description:zh-CN   一键下载图片 (压缩下载/单图下载) , 页面数据创建 json 下载 , 一键开启当前所有帖子
// @description:ja      画像をワンクリックでダウンロード（圧縮ダウンロード/単一画像ダウンロード）、ページデータを作成してjsonでダウンロード、現在のすべての投稿をワンクリックで開く
// @description:en      One-click download of images (compressed download/single image download), create page data for json download, one-click open all current posts

// @match        *://kemono.su/*
// @match        *://*.kemono.su/*
// @match        *://kemono.party/*
// @match        *://*.kemono.party/*
// @icon         https://cdn-icons-png.flaticon.com/512/2381/2381981.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://greasyfork.org/scripts/473358-jszip/code/JSZip.js?version=1237031
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {
    const pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/, language = display_language(navigator.language);
    var CompressMode = GM_getValue("Compression", []), parser = new DOMParser(), ModeDisplay, JsonDict, Pages;
    let jsonmode = {"orlink" : "set_1", "imgnb" : "set_2", "videonb" : "set_3", "dllink": "set_4"}, genmode=true;

    let PoolSize = 5, // 併發請求數 (下載線程)
    DeBug = false, // 顯示請求資訊, 與錯誤資訊
    CompleteClose = false, // 完成後自動關閉 [需要用另一個腳本的 "自動開新分頁" 或是此腳本的一鍵開啟, 要使用js開啟的分頁才能被關閉, 純js腳本被限制很多] {https://ppt.cc/fpQHSx}
    ExperimentalDownload = true, // 實驗下載功能 [壓縮下載 / json 下載]
    ExperimentalDownloadDelay = 150; // 實驗下載請求延遲 (ms)

    /** ---------------------/
    * 設置實驗 json 分類輸出格式
    * 原始連結: "orlink"
    * 圖片數量: "imgnb"
    * 影片數量: "videonb"
    * 連結數量: "dllink"
    * 排除模式: "FilterMode"
    * 唯一模式: "OnlyMode"
    * -----------------------/
    // ToJsonSet(["orlink", "videonb"], "OnlyMode");

    /* ==================== 監聽按鈕創建 (入口點) ====================  */

    const observer = new MutationObserver(() => {
        if (pattern.test(window.location.href) && !document.querySelector("#DBExist")) {ButtonCreation()}
    });
    if (pattern.test(window.location.href)) {
        observer.observe(document.head, {childList: true, subtree: true});
    }

    /* ==================== 選項菜單 ====================  */

    GM_registerMenuCommand(language.RM_01, function() {DownloadModeSwitch()}, "C");
    GM_registerMenuCommand(language.RM_02, function() {
        const section = document.querySelector("section");
        if (section) {
            JsonDict = {};
            Pages = 0;
            GetPageData(section);
        }
    }, "J");
    GM_registerMenuCommand(language.RM_03, function() {OpenData()}, "O");

    /* ==================== 數據處理 ====================  */

    function IllegalFilter(Name) {
        return Name.replace(/[\/\?<>\\:\*\|":]/g, '');
    }
    function Conversion(Name) {
        return Name.replace(/[\[\]]/g, '');
    }
    function GetExtension(link) {
        try {
            const match = link.match(/\.([^.]+)$/);
            return match[1].toLowerCase() || "png";
        } catch {return "png"}
    }

    /* ==================== 下載處理 ====================  */

    /* 按鈕創建 */
    async function ButtonCreation() {
        GM_addStyle(`
            .File_Span {
                padding: 1rem;
                font-size: 20% !important;
            }
            .Download_Button {
                color: hsl(0, 0%, 45%);
                padding: 6px;
                border-radius: 8px;
                border: 2px solid rgba(59, 62, 68, 0.7);
                background-color: rgba(29, 31, 32, 0.8);
                font-family: Arial, sans-serif;
            }
            .Download_Button:hover {
                color: hsl(0, 0%, 95%);
                background-color: hsl(0, 0%, 45%);
                font-family: Arial, sans-serif;
            }
            .Download_Button:disabled {
                color: hsl(0, 0%, 95%);
                background-color: hsl(0, 0%, 45%);
                cursor: default;
            }
        `);
        let download_button;
        try {
            const Files = document.querySelectorAll("div.post__body h2")
            const spanElement = GM_addElement(Files[Files.length - 1], "span", {class: "File_Span"});
            download_button = GM_addElement(spanElement, "button", {
                class: "Download_Button",
                id: "DBExist"
            });
            if (CompressMode) {
                ModeDisplay = language.DS_01;
            } else {
                ModeDisplay = language.DS_02;
            }
            download_button.textContent = ModeDisplay;
            download_button.addEventListener("click", function() {
                DownloadTrigger(download_button);
            });
        } catch {
            download_button.textContent = language.DS_04;
            download_button.disabled = true;
        }
    }

    /* 下載觸發 */
    function DownloadTrigger(button) {
        let data = new Map(), link;
        let interval = setInterval(() => {
            let imgdata = document.querySelectorAll("div.post__files a");
            let title = document.querySelector("h1.post__title").textContent.trim();
            let user = document.querySelector("a.post__user-name").textContent.trim();
            if (imgdata.length > 0 && title && user) {
                clearInterval(interval);
                button.textContent = language.DS_03;
                button.disabled = true;
                imgdata.forEach((files, index) => {
                    link = files.href || files.querySelector("img").src;
                    data.set(index, link.split("?f=")[0]);
                });
                if (DeBug) {
                    console.groupCollapsed("Get Data");
                    console.log(`[${user}] ${title}`);
                    console.log(data);
                    console.groupEnd();
                }
                if (CompressMode) {
                    ZipDownload(`[${user}] ${title}`, data, button);
                } else {
                    ImageDownload(`[${user}] ${title}`, data, button)
                }
            }
        }, 300);
    }

    /* 壓縮下載 */
    async function ZipDownload(Folder, ImgData, Button) {
        const zip = new JSZip(),
        File = Conversion(Folder),
        Total = ImgData.size,
        OriginalTitle = document.title,
        name = IllegalFilter(Folder.split(" ")[1]);
        let pool = [], progress = 1, task = 0, mantissa, link, extension;

        if (ExperimentalDownload) { /* ============= 實驗方法 ============= */

            const worker = BackWorkerCreation(`
                let queue = [], processing = false;
                onmessage = function(e) {
                    const {index, url, retry} = e.data;
                    queue.push({index, url, retry});

                    if (!processing) {
                        processQueue();
                        processing = true;
                    }
                }

                async function processQueue() {
                    if (queue.length > 0) {
                        const {index, url, retry} = queue.shift();
                        xmlRequest(index, url, retry);
                        setTimeout(processQueue, ${ExperimentalDownloadDelay});
                    }
                }

                // XMLHttpRequest 比較容易出現同源限制錯誤
                async function xmlRequest(index, url, retry) {
                    let xhr = new XMLHttpRequest();
                    xhr.open("GET", url, true);
                    xhr.responseType = "blob";
                    xhr.onload = function() {
                        if (xhr.status === 200) {postMessage({ blob: xhr.response, index, url: url, error: false})
                        } else {fetchRequest(index, url, retry)}
                    };
                    xhr.onerror = function() {
                        fetchRequest(index, url, retry);
                    };
                    xhr.send();
                }

                // Fetch 受到同源的限制較少
                async function fetchRequest(index, url, retry) {
                    try {
                        const response = await fetch(url, {method: 'GET'});
                        if (response.status === 200) {
                            const blob = await response.blob();
                            postMessage({ blob, index, url: url, error: false });
                        } else {
                            if (retry > 0) {fetchRequest(index, url, retry - 1)}
                            else {postMessage({ blob: "", index, url: url, error: true })}
                        }
                    } catch (error) {
                        if (retry > 0) {fetchRequest(index, url, retry - 1)}
                        else {postMessage({ blob: "", index, url: url, error: true })}
                    }
                }
            `);

            // 接收訊息
            worker.onmessage = function (e) {
                const { blob, index, url, error } = e.data;

                if (!error) {
                    if (DeBug) {console.log("Download Successful")}

                    mantissa = (index + 1).toString().padStart(3, '0');
                    zip.file(`${File}/${name}_${mantissa}.${GetExtension(url)}`, blob);
                    Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                    document.title = `[${progress}/${Total}]`;
                    progress++;
                    task++;

                } else {
                    if (DeBug) {console.log(`Request Failed Link : [${url}]`)}

                    /* 最後的下載 */
                    async function Request(url, retry) {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: url,
                            responseType: "blob",
                            onload: response => {
                                if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                                    mantissa = (index + 1).toString().padStart(3, '0');
                                    zip.file(`${File}/${name}_${mantissa}.${GetExtension(url)}`, response.response);
                                    Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                                    document.title = `[${progress}/${Total}]`;
                                    progress++;
                                    task++;
                                } else {
                                    if (retry > 0) {
                                        Request(url, retry-1);
                                    } else {
                                        task++;
                                    }
                                }
                            }
                        })
                    }

                    Request(url, 10);
                }
            };

            // 等待下載完成
            let interval = setInterval(() => {
                if (task === Total) {
                    clearInterval(interval);
                    worker.terminate();
                    Compression();
                }
            }, 100);

            // 錯誤訊息
            worker.onerror = function (e) {
                console.error(`Worker error: ${e.message}`);
            }

            // 發送訊息
            for (let i = 0; i < Total; i++) {
                link = ImgData.get(i);
                extension = GetExtension(link);
                worker.postMessage({ index: i, url: link, retry: 10 });
                Button.textContent = `${language.DS_09} [${i + 1}/${Total}]`;
            }

        } else { /* ============= 舊方法 ============= */

            async function Request(index, retry) {
                link = ImgData.get(index);
                extension = GetExtension(link);
                return new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: link,
                        responseType: "blob",
                        headers : {"user-agent": navigator.userAgent},
                        onload: response => {
                            if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                                mantissa = (index + 1).toString().padStart(3, '0');
                                zip.file(`${File}/${name}_${mantissa}.${extension}`, response.response);
                                document.title = `[${progress}/${Total}]`;
                                Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                                progress++;
                                resolve();
                            } else {
                                if (retry > 0) {
                                    if (DeBug) {console.log(`Request Retry : [${retry}]`)}
                                    Request(index, retry-1);
                                    resolve();
                                } else {
                                    console.groupCollapsed("Request Error");
                                    console.log(`[Request Error] : ${link}`);
                                    console.groupEnd();
                                    reject(new Error("Request error"));
                                }
                            }
                        },
                        onerror: error => {
                            if (retry > 0) {
                                if (DeBug) {console.log(`Request Retry : [${retry}]`)}
                                Request(index, retry-1);
                                resolve();
                            } else {
                                console.groupCollapsed("Request Error");
                                console.log(`[Request Error] : ${link}`);
                                console.groupEnd();
                                reject(error);
                            }
                        }
                    });
                });
            }

            for (let i = 0; i < Total; i++) {
                let promise = Request(i, 10);
                Button.textContent = `${language.DS_09} [${i + 1}/${Total}]`;
                pool.push(promise);
                if (pool.length >= PoolSize) {
                    await Promise.allSettled(pool);
                    pool = [];
                }
            }
            if (pool.length > 0) {await Promise.allSettled(pool)}
            Compression();
        }

        async function Compression() {
            zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 5
                }
            }, (progress) => {
                document.title = `${progress.percent.toFixed(1)} %`;
                Button.textContent = `${language.DS_06}: ${progress.percent.toFixed(1)} %`;
            }).then(async zip => {
                document.title = OriginalTitle;
                await saveAs(zip, `${Folder}.zip`);
                Button.textContent = language.DS_08;
                setTimeout(() => {
                    if (CompleteClose) {window.close()}
                    Button.textContent = ModeDisplay;
                    Button.disabled = false;
                }, 3000);
            }).catch(result => {
                Button.textContent = language.DS_07;
                document.title = OriginalTitle;
                setTimeout(() => {
                    Button.textContent = ModeDisplay;
                    Button.disabled = false;
                }, 5000);
            })
        }
    }

    /* 單圖下載 */
    async function ImageDownload(Folder, ImgData, Button) {
        const name = IllegalFilter(Folder.split(" ")[1]), Total = ImgData.size, OriginalTitle = document.title;
        let progress = 1, task = 0, link, extension;
        for (let i = 0; i < Total; i++) {
            link = ImgData.get(i);
            extension = GetExtension(link);
            Button.textContent = `${language.DS_09} [${i + 1}/${Total}]`;
            GM_download({
                url: link,
                name: `${name}_${(progress+i).toString().padStart(3, '0')}.${extension}`,
                onload: () => {
                    document.title = `[${progress}/${Total}]`;
                    Button.textContent = `${language.DS_05} [${progress}/${Total}]`;
                    progress++;
                    task++;
                },
                onerror: () => {
                    i--;
                }
            });
        }

        let interval = setInterval(() => {
            if (task === Total) {
                clearInterval(interval);
                document.title = OriginalTitle;
                Button.textContent = language.DS_08;
                setTimeout(() => {
                    Button.disabled = false;
                    Button.textContent = ModeDisplay;
                    if (CompleteClose) {window.close()}
                }, 3000);
            }
        }, 1000);
    }

    /* 下載模式切換 */
    async function DownloadModeSwitch() {
        if (GM_getValue("Compression", [])){
            GM_setValue("Compression", false);
            GM_notification({
                title: language.NF_01,
                text: language.DM_02,
                timeout: 1500
            });
        } else {
            GM_setValue("Compression", true);
            GM_notification({
                title: language.NF_01,
                text: language.DM_01,
                timeout: 1500
            });
        }
        location.reload();
    }

    /* ==================== 數據處理 ====================  */
    var progress, filtercache, OriginalTitle = document.title; // 進度顯示

    /* 獲取主頁元素 */
    async function GetPageData(section) {
        let title, link, promises = [];
        const menu = section.querySelector("a.pagination-button-after-current");
        const item = section.querySelectorAll(".card-list__items article");

        Pages++;
        progress = 0;
        GM_notification({
            title: language.NF_02,
            text: `${language.NF_03} : ${Pages}`,
            image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
            timeout: 800
        });

        // 遍歷數據
        for (const card of item) {
            title = card.querySelector(".post-card__header").textContent.trim();
            link = card.querySelector("a").href;

            if (ExperimentalDownload) {
                promises.push(DataClassification(title, link, Pages));
                await new Promise(resolve => setTimeout(resolve, ExperimentalDownloadDelay));
            } else {
                JsonDict[`${link}`] = title;
            }
        }
        // 等待所有請求完成
        await Promise.allSettled(promises);

        try { // 請求下一頁
            await GetNextPage(menu.href);
        } catch {ToJson()}
    }

    /* 獲取下一頁數據 */
    async function GetNextPage(NextPage) {
        GM_xmlhttpRequest({
            method: "GET",
            url: NextPage,
            nocache: false,
            ontimeout: 8000,
            onload: response => {
                const DOM = parser.parseFromString(response.responseText, "text/html");
                GetPageData(DOM.querySelector("section"));
            }
        });
    }

    /* 分類盒子生成 */
    function GenerateBox(ol, pn, vn, lb) {
        if (genmode) {
            return {
                ...(jsonmode.hasOwnProperty("orlink") ? { [language.CD_01]: ol } : {}),
                ...(jsonmode.hasOwnProperty("imgnb") ? { [language.CD_02]: pn } : {}),
                ...(jsonmode.hasOwnProperty("videonb") ? { [language.CD_03]: vn } : {}),
                ...(jsonmode.hasOwnProperty("dllink") ? { [language.CD_04]: lb || {} } : {}),
            }
        } else {
            return {
                ...(jsonmode.hasOwnProperty("orlink") ? { [language.CD_01]: ol } : {}),
                ...(jsonmode.hasOwnProperty("imgnb") && pn > 0 && vn == 0 ? { [language.CD_02]: pn } : {}),
                ...(jsonmode.hasOwnProperty("videonb") && vn > 0 && pn <= 5 ? { [language.CD_03]: vn } : {}),
                ...(jsonmode.hasOwnProperty("dllink") ? { [language.CD_04]: lb || {} } : {}),
            }
        }
    }

    /* 數據分類Json */
    async function DataClassification(title, url, page) {
        const link_box = {};
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                nocache: false,
                onload: response => {
                    const DOM = parser.parseFromString(response.responseText, "text/html");

                    const original_link = url;
                    const pictures_number = DOM.querySelectorAll("div.post__thumbnail").length;
                    const video_number = DOM.querySelectorAll('ul[style*="text-align: center;list-style-type: none;"] li').length;
                    DOM.querySelectorAll("a.post__attachment-link").forEach(link => {
                        const analyze =  decodeURIComponent(link.href).split("?f=");
                        const download_link = analyze[0];
                        const download_name = analyze[1];
                        link_box[download_name] = download_link;
                    })

                    const Box = GenerateBox(original_link, pictures_number, video_number, link_box);
                    if (Object.keys(Box).length !== 0) {
                        JsonDict[title] = Box;
                    }

                    if (DeBug) {console.log(JsonDict)}
                    document.title = `（${page} - ${++progress}）`;
                    resolve();
                },
                onerror: error => {
                    reject(error);
                }
            })
        });
    }

    /**
    * 設置分類輸出 Json時的格式
    *
    * @param {Array} set    - 要進行的設置 [預設: []]
    * @param {string} mode  - 設定的模式 [預設: "FilterMode"]
    *
    * @example
    * 基本設置: ToJsonSet(["orlink", "imgnb", "videonb", "dllink"]) 可選項目
    * mode = "FilterMode", 根據傳入的值, 將 {原始連結, 圖片數, 影片數, 下載連結} (過濾掉/刪除該項目)
    * mode = "OnlyMode", 根據傳入的值, 例如 {set = ["imgnb"]}, 那就只會顯示有圖片的
    * "OnlyMode" 的 "imgnb", "videonb" 會有額外特別處理, {imgnb: 排除有影片的, videonb: 圖片多餘5張的被排除}
    */
    async function ToJsonSet(set = [], mode = "FilterMode") {
        try {
            switch (mode) {
                case "FilterMode":
                    genmode = true;
                    set.forEach(key => {delete jsonmode[key]});
                    break;
                case "OnlyMode":
                    genmode = false;
                    filtercache = Object.keys(jsonmode).reduce((obj, key) => {
                        if (set.includes(key)) {obj[key] = jsonmode[key]}
                        return obj;
                    }, {});
                    jsonmode = filtercache;
                    break;
            }
        } catch (error) {console.error(error)}
    }

    /* 輸出Json */
    async function ToJson() {
        try {
            Object.keys(JsonDict).sort(); // 進行簡單排序
            const author = document.querySelector('span[itemprop="name"]').textContent;
            const json = document.createElement("a");
            json.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(JsonDict, null, 4));
            json.download = `${author}.json`;
            json.click();
            json.remove();
            GM_notification({
                title: language.NF_04,
                text: language.NF_05,
                image: "https://cdn-icons-png.flaticon.com/512/2582/2582087.png",
                timeout: 2000
            });
            document.title = OriginalTitle;
        } catch {alert(language.NF_06)}
    }

    /* 一鍵開啟當前所有帖子 */
    async function OpenData() {
        try {
            let content = document.querySelector('.card-list__items').querySelectorAll('article.post-card');
            content.forEach(function(content) {
                let link = content.querySelector('a').getAttribute('href');
                setTimeout(() => {
                    window.open("https://kemono.party" + link , "_blank");
                }, 300);
            });
        } catch {
            alert(language.NF_07);
        }
    }

    /* Worker 創建 */
    function BackWorkerCreation(code) {
        let blob = new Blob([code], {type: "application/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }

    function display_language(language) {
        let display = {
            "zh-TW": [{
                "RM_01" : "🔁 切換下載模式",
                "RM_02" : "📑 獲取所有帖子 Json 數據",
                "RM_03" : "📃 開啟當前頁面所有帖子",
                "DM_01" : "壓縮下載模式",
                "DM_02" : "單圖下載模式",
                "DS_01" : "壓縮下載",
                "DS_02" : "單圖下載",
                "DS_03" : "開始下載",
                "DS_04" : "無法下載",
                "DS_05" : "下載進度",
                "DS_06" : "封裝進度",
                "DS_07" : "壓縮封裝失敗",
                "DS_08" : "下載完成",
                "DS_09" : "請求進度",
                "CD_01" : "原始連結",
                "CD_02" : "圖片數量",
                "CD_03" : "影片數量",
                "CD_04" : "下載連結",
                "NF_01" : "模式切換",
                "NF_02" : "數據處理中",
                "NF_03" : "當前處理頁數",
                "NF_04" : "數據處理完成",
                "NF_05" : "Json 數據下載",
                "NF_06" : "錯誤的請求頁面",
                "NF_07" : "錯誤的開啟頁面"
            }],
            "zh-CN": [{
                "RM_01" : "🔁 切换下载模式",
                "RM_02" : "📑 获取所有帖子 Json 数据",
                "RM_03" : "📃 打开当前页面所有帖子",
                "DM_01" : "压缩下载模式",
                "DM_02" : "单图下载模式",
                "DS_01" : "压缩下载",
                "DS_02" : "单图下载",
                "DS_03" : "开始下载",
                "DS_04" : "无法下载",
                "DS_05" : "下载进度",
                "DS_06" : "封装进度",
                "DS_07" : "压缩封装失败",
                "DS_08" : "下载完成",
                "DS_09" : "请求进度",
                "CD_01" : "原始链接",
                "CD_02" : "图片数量",
                "CD_03" : "视频数量",
                "CD_04" : "下载链接",
                "NF_01" : "模式切换",
                "NF_02" : "数据处理中",
                "NF_03" : "当前处理页数",
                "NF_04" : "数据处理完成",
                "NF_05" : "Json 数据下载",
                "NF_06" : "错误的请求页面",
                "NF_07" : "错误的打开页面"
            }],
            "ja": [{
                "RM_01" : "🔁 ダウンロードモードの切り替え",
                "RM_02" : "📑 すべての投稿のJsonデータを取得する",
                "RM_03" : "📃 現在のページのすべての投稿を開く",
                "DM_01" : "圧縮ダウンロードモード",
                "DM_02" : "シングル画像ダウンロードモード",
                "DS_01" : "圧縮ダウンロード",
                "DS_02" : "シングル画像ダウンロード",
                "DS_03" : "ダウンロードを開始する",
                "DS_04" : "ダウンロードできません",
                "DS_05" : "ダウンロードの進行状況",
                "DS_06" : "パッケージング中",
                "DS_07" : "圧縮パッケージングに失敗しました",
                "DS_08" : "ダウンロードが完了しました",
                "DS_09" : "リクエストの進捗",
                "CD_01" : "元のリンク",
                "CD_02" : "画像の数",
                "CD_03" : "ビデオの数",
                "CD_04" : "ダウンロードリンク",
                "NF_01" : "モード切り替え",
                "NF_02" : "データ処理中",
                "NF_03" : "現在の処理ページ数",
                "NF_04" : "データ処理が完了しました",
                "NF_05" : "Jsonデータのダウンロード",
                "NF_06" : "間違ったリクエストページ",
                "NF_07" : "間違ったページを開く"
            }],
            "en-US": [{
                "RM_01" : "🔁 Switch download mode",
                "RM_02" : "📑 Get all post Json data",
                "RM_03" : "📃 Open all posts on the current page",
                "DM_01" : "Compressed download mode",
                "DM_02" : "Single image download mode",
                "DS_01" : "Compressed download",
                "DS_02" : "Single image download",
                "DS_03" : "Start downloading",
                "DS_04" : "Unable to download",
                "DS_05" : "Download progress",
                "DS_06" : "Packaging",
                "DS_07" : "Compression packaging failed",
                "DS_08" : "Download completed",
                "DS_09" : "Request progress",
                "CD_01" : "Original link",
                "CD_02" : "Number of images",
                "CD_03" : "Number of videos",
                "CD_04" : "Download link",
                "NF_01" : "Mode switch",
                "NF_02" : "Data processing",
                "NF_03" : "Current processing page number",
                "NF_04" : "Data processing completed",
                "NF_05" : "Json data download",
                "NF_06" : "Wrong request page",
                "NF_07" : "Wrong page to open"
            }]
        };

        if (display.hasOwnProperty(language)) {
            return display[language][0];
        } else {
            return display["en-US"][0];
        }
    }
})();