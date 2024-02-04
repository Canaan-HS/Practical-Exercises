// ==UserScript==
// @name         [E/Ex-Hentai] Downloader
// @name:zh-TW   [E/Ex-Hentai] 下載器
// @name:zh-CN   [E/Ex-Hentai] 下载器
// @name:ja      [E/Ex-Hentai] ダウンローダー
// @name:ko      [E/Ex-Hentai] 다운로더
// @name:en      [E/Ex-Hentai] Downloader
// @version      0.0.12
// @author       HentaiSaru
// @description         在 E 和 Ex 的漫畫頁面, 創建下載按鈕, 可使用[壓縮下載/單圖下載], 自動獲取圖片下載
// @description:zh-TW   在 E 和 Ex 的漫畫頁面, 創建下載按鈕, 可使用[壓縮下載/單圖下載], 自動獲取圖片下載
// @description:zh-CN   在 E 和 Ex 的漫画页面, 创建下载按钮, 可使用[压缩下载/单图下载], 自动获取图片下载
// @description:ja      EとExの漫画ページで、ダウンロードボタンを作成し、[圧縮ダウンロード/単一画像ダウンロード]を使用して、自動的に画像をダウンロードします。
// @description:ko      E 및 Ex의 만화 페이지에서 다운로드 버튼을 만들고, [압축 다운로드/단일 이미지 다운로드]를 사용하여 이미지를 자동으로 다운로드합니다.
// @description:en      On the comic pages of E and Ex, create a download button that can use [compressed download/single image download] to automatically download images.

// @connect      *
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_download
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @require      https://greasyfork.org/scripts/473358-jszip/code/JSZip.js?version=1237031
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {
    var language, OriginalTitle, CompressMode, ModeDisplay,
    lock = false, url = document.URL.split("?p=")[0];
    const Config = {
        ReTry: 15, // 下載錯誤重試次數, 超過這個次數該圖片會被跳過
        Reload: 1000, // 下載錯誤重試的延遲 (單位:ms)
        DeBug: false,
    }
    class Main {
        constructor() {
            this.E = /https:\/\/e-hentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
            this.Ex = /https:\/\/exhentai\.org\/g\/\d+\/[a-zA-Z0-9]+/;
            this.Ran = (u) => {return this.E.test(u) || this.Ex.test(u)}
            this.Css = (a, e, ex) => {
                let css = location.hostname == "exhentai.org" ? ex : e;
                addstyle(`${a}${css}`, "button-style");
            }
        }
        async Match() {
            if (this.Ran(url)) {
                language = display_language(navigator.language);
                OriginalTitle = document.title;
                this.ButtonCreation();
                GM_registerMenuCommand(language.MN_01, ()=> {this.__DownloadModeSwitch()});
            }
        }
        async ButtonCreation() {
            CompressMode = GM_getValue("CompressedMode", []);
            ModeDisplay = CompressMode ? language.DM_01 : language.DM_02;
            this.Css(`
                .Download_Button {
                    float: right;
                    width: 9rem;
                    cursor: pointer;
                    font-weight: bold;
                    line-height: 20px;
                    border-radius: 5px;
                    position: relative;
                    padding: 1px 5px 2px;
                    font-family: arial,helvetica,sans-serif;
                }
                `,`
                .Download_Button {
                    color: #5C0D12;
                    border: 2px solid #9a7c7e;
                    background-color: #EDEADA;
                }
                .Download_Button:hover {
                    color: #8f4701;
                    border: 2px dashed #B5A4A4;
                }
                .Download_Button:disabled {
                    color: #B5A4A4;
                    border: 2px dashed #B5A4A4;
                    cursor: default;
                }
                `,`
                .Download_Button {
                    color: #b3b3b3;
                    border: 2px solid #34353b;
                    background-color: #2c2b2b;
                }
                .Download_Button:hover {
                    color: #f1f1f1;
                    border: 2px dashed #4f535b;
                }
                .Download_Button:disabled {
                    color: #4f535b;
                    border: 2px dashed #4f535b;
                    cursor: default;
                }
            `);
            try {
                let download_button = GM_addElement($$("#gd2"), "button", {
                    id: "ExDB",
                    class: "Download_Button"
                });
                download_button.textContent = lock ? language.DM_03 : ModeDisplay;
                download_button.disabled = lock ? true : false;
                download_button.addEventListener("click", () => {
                    lock = true;
                    download_button.disabled = true;
                    download_button.textContent = language.DS_01;
                    download.HomeData(download_button);
                }, {capture: true, passive: true});
            } catch {}
        }
        async __DownloadModeSwitch() {
            CompressMode?
            GM_setValue("CompressedMode", false):
            GM_setValue("CompressedMode", true);
            $$("#ExDB").remove();
            this.ButtonCreation();
        }
    }
    class Settings {
        constructor() {
            this.MAX_CONCURRENCY = 15;
            this.MIN_CONCURRENCY = 5;
            this.TIME_THRESHOLD = 250;
            this.MAX_Delay = 3000;
            this.MIN_Delay = 30;
            this.CompressionLevel = 5;
            this.DownloadMode;
            this.Fill = 4;
        }
        Dynamic(Time, Delay, Thread=null) {
            let ResponseTime = (Date.now() - Time), delay, thread;
            if (ResponseTime > this.TIME_THRESHOLD) {
                delay = Math.min((Delay + ResponseTime) / 2, this.MAX_Delay);
                if (Thread != null) {
                    thread = Math.floor(Math.max(Thread - (ResponseTime / this.TIME_THRESHOLD), this.MIN_CONCURRENCY));
                    return [delay, thread];
                } else {return delay}
            } else {
                delay = Math.max((Delay - ResponseTime) / 2, this.MIN_Delay);
                if (Thread != null) {
                    thread = Math.floor(Math.min(Thread + (ResponseTime / this.TIME_THRESHOLD), this.MAX_CONCURRENCY));
                    return [delay, thread];
                } else {return delay}
            }
        }
    }
    class Download extends Settings {
        constructor() {
            super();
            this.parser = new DOMParser();
            this.Total = (page) => {return Math.ceil(+page[page.length - 2].textContent.replace(/\D/g, '') / 20)}
            this.Dom = (html) => {return this.parser.parseFromString(html, "text/html")}
            this.Filter = (name) => {return name.replace(/[\/\?<>\\:\*\|":]/g, '')}
            this.Extension = (link) => {
                try {
                    const match = link.match(/\.([^.]+)$/);
                    return match[1].toLowerCase() || "png";
                } catch {return "png"}
            }
            this.WorkerCreation = (code) => {
                let blob = new Blob([code], {type: "application/javascript"});
                return new Worker(URL.createObjectURL(blob));
            }
        }
        async HomeData(button) {
            let homepage = new Map(), self = this, task = 0, DC = 1, Home_Delay = 60, pages = this.Total($$("#gdd td.gdt2", true)),
            title = this.Filter($$("#gj").textContent.trim() || $$("#gn").textContent.trim());
            this.DownloadMode = CompressMode;
            const worker = this.WorkerCreation(`
                let queue = [], processing = false;
                onmessage = function(e) {
                    const {index, url, time, delay} = e.data;
                    queue.push({index, url, time, delay});
                    if (!processing) {
                        processQueue();
                        processing = true;
                    }
                }
                async function processQueue() {
                    if (queue.length > 0) {
                        const {index, url, time, delay} = queue.shift();
                        FetchRequest(index, url, time, delay);
                        setTimeout(processQueue, delay);
                    }
                }
                async function FetchRequest(index, url, time, delay) {
                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        postMessage({index, html, time, delay, error: false});
                    } catch {
                        postMessage({index, url, time, delay, error: true});
                    }
                }
            `)
            worker.postMessage({index: 0, url: url, time: Date.now(), delay: Home_Delay});
            for (let index = 1; index < pages; index++) {
                worker.postMessage({index, url: `${url}?p=${index}`, time: Date.now(), delay: Home_Delay});
            }
            worker.onmessage = (e) => {
                const {index, html, time, delay, error} = e.data;
                Home_Delay = this.Dynamic(time, delay);
                error ? FetchRequest(index, html, 10):
                GetLink(index, this.Dom(html));
            }
            async function FetchRequest(index, url, retry) {
                try {
                    const response = await fetch(url);
                    const html = await response.text();
                    await GetLink(index, self.Dom(html));
                } catch {
                    if (retry > 0) {
                        await FetchRequest(index, url, retry-1);
                    } else {
                        task++;
                    }
                }
            }
            async function GetLink(index, data) {
                const homebox = [];
                $$("#gdt a", true, data).forEach(link => {
                    homebox.push(link.href)
                });
                homepage.set(index, homebox);
                document.title = `[${DC}/${pages}]`;
                button.textContent = `${language.DS_02}: [${DC}/${pages}]`;
                DC++;
                task++;
            }
            let interval = setInterval(() => {
                if (task === pages) {
                    clearInterval(interval);
                    worker.terminate();
                    const homebox = [];
                    for (let i = 0; i < homepage.size; i++) {
                        homebox.push(...homepage.get(i));
                    }
                    if (Config.DeBug) {
                        log("Home Page Data", `[Title] : ${title}\n${homebox}`);
                    }
                    this.__ImageData(button, title, homebox);
                }
            }, 500);
        }
        async __ImageData(button, title, link) {
            let imgbox = new Map(), pages = link.length, self = this, DC = 1, task = 0, Image_Delay = 18;
            const worker = this.WorkerCreation(`
                let queue = [], processing = false;
                onmessage = function(e) {
                    const {index, url, time, delay} = e.data;
                    queue.push({index, url, time, delay});
                    if (!processing) {
                        processQueue();
                        processing = true;
                    }
                }
                async function processQueue() {
                    if (queue.length > 0) {
                        const {index, url, time, delay} = queue.shift();
                        FetchRequest(index, url, time, delay);
                        setTimeout(processQueue, delay);
                    }
                }
                async function FetchRequest(index, url, time, delay) {
                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        postMessage({index, html, time, delay, error: false});
                    } catch {
                        postMessage({index, html, time, delay, error: true});
                    }
                }
            `)
            for (let index = 0; index < pages; index++) {
                worker.postMessage({index, url: link[index], time: Date.now(), delay: Image_Delay});
            }
            worker.onmessage = (e) => {
                const {index, html, time, delay, error} = e.data;
                Image_Delay = this.Dynamic(time, delay);
                error ? FetchRequest(index, html, 10) :
                GetLink(index, $$("#img", false, this.Dom(html)));
            }
            async function FetchRequest(index, url, retry) {
                try {
                    const response = await fetch(url);
                    const html = await response.text();
                    await GetLink(index, $$("#img", false, self.Dom(html)));
                } catch {
                    if (retry > 0) {
                        await FetchRequest(index, url, retry-1);
                    } else {
                        task++;
                    }
                }
            }
            async function GetLink(index, data) {
                imgbox.set(index, data.src || data.href);
                document.title = `[${DC}/${pages}]`;
                button.textContent = `${language.DS_03}: [${DC}/${pages}]`;
                DC++;
                task++;
            }
            let interval = setInterval(() => {
                if (task === pages) {
                    clearInterval(interval);
                    worker.terminate();
                    if (Config.DeBug) {
                        log("Img Link Data", imgbox);
                    }
                    this.__DownloadTrigger(button, title, imgbox);
                }
            }, 500);
        }
        async __DownloadTrigger(button, title, link) {
            this.DownloadMode?
            this.__ZipDownload(button, title, link):
            this.__ImageDownload(button, title, link);
        }
        async __ZipDownload(Button, Folder, ImgData) {
            const Data = new JSZip(), self = this, Total = ImgData.size;
            let progress = 1, thread = 5, delay = 300,
            time, link, mantissa, extension;
            async function Request(index, retry) {
                time = Date.now();
                link = ImgData.get(index);
                extension = self.Extension(link);
                return new Promise((resolve, reject) => {
                    if (typeof link !== "undefined") {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: link,
                            responseType: "blob",
                            headers : {"user-agent": navigator.userAgent},
                            onload: response => {
                                if (response.status === 200 && response.response instanceof Blob && response.response.size > 0) {
                                    mantissa = (index + 1).toString().padStart(self.Fill, "0");
                                    Data.file(`${Folder}/${mantissa}.${extension}`, response.response);
                                    document.title = `[${progress}/${Total}]`;
                                    Button.textContent = `${language.DS_04}: [${progress}/${Total}]`;
                                    progress++;
                                    resolve();
                                    [ delay, thread ] = self.Dynamic(time, delay, thread);
                                } else {
                                    if (retry > 0) {
                                        if (Config.DeBug) {log(null, `Download Retry(${retry}) : [${link}]`, "error")}
                                        setTimeout(() => {
                                            Request(index, retry-1);
                                            resolve();
                                        }, Config.Reload);
                                        [ delay, thread ] = self.Dynamic(time, delay, thread);
                                    } else {
                                        reject(new Error("Request error"));
                                    }
                                }
                            },
                            onerror: error => {
                                if (retry > 0) {
                                    if (Config.DeBug) {log(null, `Download Retry(${retry}) : [${link}]`, "error")}
                                    setTimeout(() => {
                                        Request(index, retry-1);
                                        resolve();
                                    }, Config.Reload);
                                    [ delay, thread ] = self.Dynamic(time, delay, thread);
                                } else {
                                    log("Request Error", `(Error Link) : [${link}]`, "error");
                                    reject(error);
                                }
                            }
                        })
                    } else {reject(new Error("undefined url"))}
                });
            }
            let count = 0, promises = [];
            for (let i = 0; i < Total; i++) {
                promises.push(Request(i, Config.ReTry));
                count++;
                if (count === thread) {
                    count = 0;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            await Promise.allSettled(promises);
            this.__Compression(Data, Folder, Button);
        }
        async __ImageDownload(Button, Folder, ImgData) {
            const Total = ImgData.size, self = this;
            let progress = 1, thread = 5, delay = 300,
            time, link, extension;
            async function Request(index, retry) {
                time = Date.now();
                link = ImgData.get(index);
                extension = self.Extension(link);
                return new Promise((resolve, reject) => {
                    if (typeof link !== "undefined") {
                        GM_download({
                            url: link,
                            name: `${Folder} ${(index + 1).toString().padStart(self.Fill, "0")}.${extension}`,
                            headers : {"user-agent": navigator.userAgent},
                            onload: () => {
                                document.title = `[${progress}/${Total}]`;
                                Button.textContent = `${language.DS_04}: [${progress}/${Total}]`;
                                progress++;
                                resolve();
                                [ delay, thread ] = self.Dynamic(time, delay, thread);
                            },
                            onerror: () => {
                                if (retry > 0) {
                                    if (Config.DeBug) {log(null, `Download Retry(${retry}) : [${link}]`, "error")}
                                    setTimeout(() => {
                                        Request(index, retry-1);
                                        resolve();
                                    }, Config.Reload);
                                    [ delay, thread ] = self.Dynamic(time, delay, thread);
                                } else {
                                    reject(new Error("Request error"));
                                }
                            }
                        })
                    } else {reject(new Error("undefined url"))}
                });
            }
            let count = 0, promises = [];
            for (let i = 0; i < Total; i++) {
                promises.push(Request(i, Config.ReTry));
                count++;
                if (count === thread) {
                    count = 0;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            await Promise.allSettled(promises);
            Button.textContent = language.DS_08;
            setTimeout(() => {
                document.title = `✓ ${OriginalTitle}`;
                ResetButton();
            }, 3000);
        }
        async __Compression(Data, Folder, Button) {
            Data.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: this.CompressionLevel
                }
            }, (progress) => {
                document.title = `${progress.percent.toFixed(1)} %`;
                Button.textContent = `${language.DS_05}: ${progress.percent.toFixed(1)} %`;
            }).then(async zip => {
                await saveAs(zip, `${Folder}.zip`);
                Button.textContent = language.DS_06;
                document.title = `✓ ${OriginalTitle}`;
                setTimeout(() => {
                    ResetButton();
                }, 3000);
            }).catch(result => {
                Button.textContent = language.DS_07;
                document.title = OriginalTitle;
                setTimeout(() => {
                    Button.textContent = ModeDisplay;
                    Button.disabled = false;
                }, 6000);
            })
        }
    }
    const download = new Download();
    const main = new Main();
    main.Match();
    async function ResetButton() {
        lock = false;
        let Button = $$("#ExDB");
        Button.disabled = false;
        Button.textContent = `✓ ${ModeDisplay}`;
    }
    async function addstyle(Rule, ID="Add-Style") {
        let new_style = $$(`#${ID}`);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
            new_style.appendChild(document.createTextNode(Rule));
        }
    }
    function $$(Selector, All=false, Source=document) {
        if (All) {return Source.querySelectorAll(Selector)}
        else {
            const slice = Selector.slice(1);
            const analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : Selector[0];
            switch (analyze) {
                case "#": return Source.getElementById(slice);
                case " ": return Source.querySelector(Selector);
                case ".": return Source.getElementsByClassName(slice)[0];
                default: return Source.getElementsByTagName(Selector)[0];
            }
        }
    }
    function log(group=null, label="print", type="log") {
        const template = {
            log: label=> console.log(label),
            warn: label=> console.warn(label),
            error: label=> console.error(label),
            count: label=> console.count(label),
        }
        type = typeof type === "string" && template[type] ? type : type = "log";
        if (group == null) {
            template[type](label);
        } else {
            console.groupCollapsed(group);
            template[type](label);
            console.groupEnd();
        }
    }
    function display_language(language) {
        let display = {
            "zh-TW": [{
                "MN_01" : "🔁 切換下載模式",
                "DM_01" : "壓縮下載",
                "DM_02" : "單圖下載",
                "DM_03" : "下載中鎖定",
                "DS_01" : "開始下載",
                "DS_02" : "獲取頁面",
                "DS_03" : "獲取連結",
                "DS_04" : "下載進度",
                "DS_05" : "壓縮封裝",
                "DS_06" : "壓縮完成",
                "DS_07" : "壓縮失敗",
                "DS_08" : "下載完成"
            }],
            "zh-CN": [{
                "MN_01" : "🔁 切换下载模式",
                "DM_01" : "压缩下载",
                "DM_02" : "单图下载",
                "DM_03" : "下载中锁定",
                "DS_01" : "开始下载",
                "DS_02" : "获取页面",
                "DS_03" : "获取链接",
                "DS_04" : "下载进度",
                "DS_05" : "压缩封装",
                "DS_06" : "压缩完成",
                "DS_07" : "压缩失败",
                "DS_08" : "下载完成"
            }],
            "ja": [{
                "MN_01" : "🔁 ダウンロードモードの切り替え",
                "DM_01" : "圧縮ダウンロード",
                "DM_02" : "単一画像ダウンロード",
                "DM_03" : "ダウンロード中にロックされました",
                "DS_01" : "ダウンロード開始",
                "DS_02" : "ページを取得する",
                "DS_03" : "リンクを取得する",
                "DS_04" : "ダウンロードの進捗状況",
                "DS_05" : "圧縮パッケージング",
                "DS_06" : "圧縮完了",
                "DS_07" : "圧縮に失敗しました",
                "DS_08" : "ダウンロードが完了しました"
            }],
            "en-US": [{
                "MN_01" : "🔁 Switch download mode",
                "DM_01" : "Compressed download",
                "DM_02" : "Single image download",
                "DM_03" : "Downloading Locked",
                "DS_01" : "Start download",
                "DS_02" : "Get page",
                "DS_03" : "Get link",
                "DS_04" : "Download progress",
                "DS_05" : "Compressed packaging",
                "DS_06" : "Compression complete",
                "DS_07" : "Compression failed",
                "DS_08" : "Download complete"
            }],
            "ko": [{
                "MN_01" : "🔁 다운로드 모드 전환",
                "DM_01" : "압축 다운로드",
                "DM_02" : "단일 이미지 다운로드",
                "DM_03" : "다운로드 중 잠김",
                "DS_01" : "다운로드 시작",
                "DS_02" : "페이지 가져오기",
                "DS_03" : "링크 가져오기",
                "DS_04" : "다운로드 진행 상황",
                "DS_05" : "압축 포장",
                "DS_06" : "압축 완료",
                "DS_07" : "압축 실패",
                "DS_08" : "다운로드 완료"
            }]
        };
        return display.hasOwnProperty(language) ? display[language][0] : display["en-US"][0];
    }
})();