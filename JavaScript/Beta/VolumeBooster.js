// ==UserScript==
// @name         影片音量增強器
// @version      0.0.34
// @author       Canaan HS
// @description  增強影片音量上限，最高增幅至 20 倍，有些不支援的網站，影片會沒聲音 或是 沒有效果，命令選單有時有 BUG 會多創建一個，但不影響原功能使用。
// @description:zh-TW 增強影片音量上限，最高增幅至 20 倍，有些不支援的網站，影片會沒聲音禁用增幅即可，命令選單有時有 BUG 會多創建一個，但不影響原功能使用。
// @description:zh-CN 增强影片音量上限，最高增幅至 20 倍。有些不支援的网站，影片会没声音，禁用增幅即可。命令选单有时有 BUG 会多创建一个，但不影响原功能使用。
// @description:en Enhance the upper limit of video volume, boosting up to 20 times. For unsupported websites where videos have no sound, disabling the boost is sufficient. Occasionally, there may be a bug in the command menu causing duplication, but it does not affect the original functionality.

// @match        *://*/*
// @icon         https://cdn-icons-png.flaticon.com/512/8298/8298181.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener
// @require      https://update.greasyfork.org/scripts/487608/1360115/SyntaxSimplified.js
// ==/UserScript==

(function() {
    if (/^(http|https):\/\/(?!chrome\/|about\/).*$/i.test(document.URL)) {
        (new class Main extends Syntax {
            constructor() {
                super();
                this.Booster = null;
                this.Increase = null;
                this.StyleTag = false;
                this.Domain = location.hostname;
                this.Display = this.Language(navigator.language);
                this.BannedDomains = this.store("g", "BannedDomains", []);
                this.ExcludeStatus = this.BannedDomains.includes(this.Domain);

                /* 禁止網域 */
                this.BannedDomain = async(domain) => {
                    if (this.ExcludeStatus) {
                        // 從排除列表刪除網域
                        this.BannedDomains = this.BannedDomains.filter(d => {return d != domain});
                    } else {
                        // 添加網域到排除列表
                        this.BannedDomains.push(domain);
                    }
                    this.store("s", "BannedDomains", this.BannedDomains);
                    location.reload();
                }

                /* 開始註冊選單 */
                this.StatusMenu = async(name) => {
                    this.Menu({
                        [name]: {func: ()=> this.BannedDomain(this.Domain)}
                    });
                }

                /* 註冊快捷鍵(開啟菜單) */
                this.MenuHotkey = async(time) => {
                    this.Listen(document, "keydown", event => {
                        if (event.altKey && event.key.toUpperCase() == "B") {this.IncrementalSetting()}
                    }, { passive: true, capture: true }, state => {
                        state
                        ? this.Runtime(time, "Hotkey Success", {style: "\x1b[1m\x1b[32m%s\x1b[0m"})
                        : this.Runtime(time, "Hotkey Failed", {style: "\x1b[1m\x1b[31m%s\x1b[0m"});
                    });
                }

                /* 找到主要的影片 */
                this.FindMain = async(video, target) => {
                    target(video.sort((a, b) => b.offsetWidth - a.offsetWidth)[0]);
                }
            }

            /* 監聽注入 */
            async Injection() {
                if (!this.ExcludeStatus) {
                    const time = this.Runtime();
                    this.Observer(document.head, ()=> {
                        this.FindMain(this.$$("video", {all: true}), media=> {
                            if (media && !media.hasAttribute("Media-Audio-Booster")) {
                                this.MediaObserver.disconnect();
                                this.Trigger(media, time);
                            }
                        })
                    }, {mark: "Audio-Booster", throttle: 300}, back=> {
                        this.MediaObserver = back.ob;
                        this.ObserverOptions = back.op;
                    });
                    this.StatusMenu(this.Display.MD);
                } else {
                    this.StatusMenu(this.Display.MS);
                }
            }

            /* 找到元素後觸發操作 */
            async Trigger(media, time) {
                try {
                    this.Increase = this.store("g", this.Domain) || 1.0; // 重製增量
                    this.Booster = this.BoosterLogic(media, this.Increase, time); // 重新添加節點

                    if (!this.StyleTag) {
                        this.StyleTag = true;
                        this.AddStyle(`
                        .Booster-Modal-Background {
                            top: 0;
                            left: 0;
                            opacity: 1;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            z-index: 9999;
                            overflow: auto;
                            position: fixed;
                            align-items: center;
                            justify-content: center;
                            transition: opacity 0.4s ease;
                        }
                        .Booster-Modal-Button {
                            margin: 0 2% 2% 0;
                            color: #d877ff;
                            font-size: 16px;
                            font-weight: bold;
                            padding: 0 0.3rem;
                            border-radius: 3px;
                            background-color: #ffebfa;
                            border: 1px solid rgb(124, 183, 252);
                        }
                        .Booster-Modal-Button:hover,
                        .Booster-Modal-Button:focus {
                            color: #fc0e85;
                            cursor: pointer;
                            text-decoration: none;
                        }
                        .Booster-Modal-Content {
                            width: 400px;
                            padding: 5px;
                            overflow: auto;
                            background-color: #cff4ff;
                            border-radius: 10px;
                            text-align: center;
                            border: 2px ridge #82c4e2;
                            border-collapse: collapse;
                            margin: 2% auto 8px auto;
                        }
                        .Booster-Multiplier {
                            font-size:25px;
                            color:rgb(253, 1, 85);
                            margin: 15px;
                            font-weight:bold;
                        }
                        .Booster-Modal-Background-Closur {
                            opacity: 0;
                            pointer-events: none;
                        }
                        .Booster-Slider {width: 350px;}
                        div input {cursor: pointer;}
                        #sound-save {cursor: pointer;}
                        `);
                    }
                } catch (error) {
                    this.log("Trigger Error : ", error, "error");
                }
            }

            /* 音量增量邏輯 */
            BoosterLogic(media, increase, time) {
                const Support = window.AudioContext || window.oAudioContext;
                try {

                    if (!Support) {
                        throw this.Display.BT1;
                    }

                    const AudioContext = new Support();
                    const SourceNode = AudioContext.createMediaElementSource(media); // 音頻來源
                    const GainNode = AudioContext.createGain(); // 增益節點
                    const LowFilterNode = AudioContext.createBiquadFilter(); // 低音慮波器
                    const HighFilterNode = AudioContext.createBiquadFilter(); // 高音濾波器
                    const CompressorNode = AudioContext.createDynamicsCompressor(); // 動態壓縮節點

                    // 將預設音量調整至 100% (有可能被其他腳本調整)
                    media.volume = 1;
                    // 設置增量
                    GainNode.gain.value = increase ** 2;

                    // 設置動態壓縮器的參數(通用性測試!!)
                    CompressorNode.ratio.value = 6; // 壓縮率
                    CompressorNode.knee.value = 0.5; // 壓縮過渡反應時間(越小越快)
                    CompressorNode.threshold.value = -14; // 壓縮閾值
                    CompressorNode.attack.value = 0.020; // 開始壓縮的速度
                    CompressorNode.release.value = 0.40; // 釋放壓縮的速度

                    // 低音慮波增強
                    LowFilterNode.frequency.value = 250;
                    LowFilterNode.type = "lowshelf";
                    LowFilterNode.gain.value = 2.2;

                    // 高音慮波增強
                    HighFilterNode.frequency.value = 10000;
                    HighFilterNode.type = "highshelf";
                    HighFilterNode.gain.value = 1.8;

                    // 進行節點連結
                    SourceNode.connect(GainNode).connect(LowFilterNode).connect(HighFilterNode);
                    GainNode.connect(CompressorNode).connect(AudioContext.destination);

                    // 節點創建標記
                    media.setAttribute("Media-Audio-Booster", true);

                    // 完成後創建菜單
                    this.Menu({
                        [this.Display.MK]: {func: ()=> alert(this.Display.MKT)},
                        [this.Display.MM]: {func: ()=> this.IncrementalSetting()}
                    }, "Menu", 2);

                    // 顯示完成添加
                    this.log(
                        this.Display.BT3,
                        {
                            "Booster Media : ": media,
                            "Elapsed Time : ": `${(Date.now()-time)/1e3}s`
                        }
                    );

                    this.MenuHotkey(time);
                    // 最終確認完成後, 再次添加監聽器, 5秒後
                    media.hasAttribute("Media-Audio-Booster") && setTimeout(()=> {
                        this.MediaObserver.observe(document.head, this.ObserverOptions);
                    }, 5e3);

                    // 監聽保存值變化
                    this.storeListen([this.Domain], call=> {
                        if (call.far && call.key == this.Domain) { // 由遠端且觸發網域相同
                            this.Booster.setVolume(call.nv);
                        }
                    });

                    return {
                        // 設置音量
                        setVolume: increase => {
                            GainNode.gain.value = increase ** 2;
                            this.Increase = increase;
                        }
                    }

                } catch (error) {
                    this.log(this.Display.BT4, error);
                }
            }

            /* 調整菜單 */
            async IncrementalSetting() {
                if (!this.$$(".Booster-Modal-Background")) {
                    const modal = document.createElement("div");
                    modal.innerHTML = `
                        <div class="Booster-Modal-Background">
                            <div class="Booster-Modal-Content">
                                <h2 style="color: #3754f8;">${this.Display.ST}</h2>
                                <div style="margin:1rem auto 1rem auto;">
                                    <div class="Booster-Multiplier">
                                        <span><img src="https://cdn-icons-png.flaticon.com/512/8298/8298181.png" width="5%">${this.Display.S1}</span><span id="Booster-CurrentValue">${this.Increase}</span><span>${this.Display.S2}</span>
                                    </div>
                                    <input type="range" id="Adjustment-Sound-Enhancement" class="Booster-Slider" min="0" max="20.0" value="${this.Increase}" step="0.1"><br>
                                </div>
                                <div style="text-align: right;">
                                    <button class="Booster-Modal-Button" id="sound-save">${this.Display.SS}</button>
                                </div>
                            </div>
                        </div>
                    `
                    document.body.appendChild(modal);

                    const CurrentValue = this.$$("#Booster-CurrentValue");
                    const slider = this.$$("#Adjustment-Sound-Enhancement");

                    // 監聽設定拉條
                    let Current;
                    this.Listen(slider, "input", event => {
                        requestAnimationFrame(()=> {
                            Current = event.target.value;
                            CurrentValue.textContent = Current;
                            this.Booster.setVolume(Current);
                        });
                    }, { passive: true, capture: true });

                    // 監聽保存關閉
                    const Modal = this.$$(".Booster-Modal-Background");
                    this.Listen(Modal, "click", click => {
                        click.stopPropagation();
                        const target = click.target;
                        if (target.id === "sound-save") {
                            const value = parseFloat(slider.value);
                            this.Increase = value;
                            this.store("s", this.Domain, value);
                            DeleteMenu();
                        } else if (target.className === "Booster-Modal-Background") {DeleteMenu()}
                    }, { capture: true });

                    function DeleteMenu() {
                        Modal.classList.add("Booster-Modal-Background-Closur");
                        setTimeout(()=> {Modal.remove()}, 1200);
                    }
                }
            }

            /* 語言 */
            Language(lang) {
                const Display = {
                    Traditional: {
                        MS: "✅ 啟用增幅", MD: "❌ 禁用增幅",
                        MK: "📜 菜單熱鍵", MM: "🛠️ 調整菜單",
                        MKT: "熱鍵呼叫調整菜單!!\n\n快捷組合 : (Alt + B)",
                        BT1: "不支援音頻增強節點", BT2: "添加增強節點失敗",
                        BT3: "添加增強節點成功", BT4: "增強失敗",
                        ST: "音量增強", S1: "增強倍數 ", S2: " 倍",
                        SS: "保存設置",
                    },
                    Simplified: {
                        MS: "✅ 启用增幅", MD: "❌ 禁用增幅",
                        MK: "📜 菜单热键", MM: "🛠️ 调整菜单",
                        MKT: "热键呼叫调整菜单!!\n\n快捷组合 : (Alt + B)",
                        BT1: "不支援音频增强节点", BT2: "添加增强节点失败",
                        BT3: "添加增强节点成功", BT4: "增强失败",
                        ST: "音量增强", S1: "增强倍数 ", S2: " 倍",
                        SS: "保存设置",
                    },
                    English: {
                        MS: "✅ Enable Boost", MD: "❌ Disable Boost",
                        MK: "📜 Menu Hotkey", MM: "🛠️ Adjust Menu",
                        MKT: "Hotkey to Call Menu Adjustments!!\n\nShortcut: (Alt + B)",
                        BT1: "Audio enhancement node not supported", BT2: "Failed to add enhancement node",
                        BT3: "Enhancement node added successfully", BT4: "Enhancement failed",
                        ST: "Volume Boost", S1: "Boost Level ", S2: " X",
                        SS: "Save Settings",
                    }
                }, Match = {
                    "zh-TW": Display.Traditional,
                    "zh-HK": Display.Traditional,
                    "zh-MO": Display.Traditional,
                    "zh-CN": Display.Simplified,
                    "zh-SG": Display.Simplified,
                    "en-US": Display.English,
                };
                return Match[lang] || Match["en-US"];
            }
        }).Injection();
    }
})();