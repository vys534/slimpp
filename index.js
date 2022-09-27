const websocketURI = "ws://127.0.0.1:24050/ws";
const baseTitleAnimTime = 7;

const currentPP = document.getElementById("pp");
const maximumPP = document.getElementById("pp-maximum-this-play");
const hit100 = document.getElementById("hit100");
const hit50 = document.getElementById("hit50");
const hit0 = document.getElementById("hit0");
const unstableRate = document.getElementById("ur");
const mapInfo = document.getElementById("map-title");
const mapStarRating = document.getElementById("map-sr");
const modsEnabled = document.getElementById("map-mods");
const mapBPM = document.getElementById("map-bpm");
const mapProgress = document.getElementById("map-progress");
const bg = document.getElementById("bg");

function updateMapTitle(newTitle) {
    mapInfo.classList.remove("marquee");
    mapInfo.innerHTML = newTitle;
    void mapInfo.clientWidth;
    const mapTitleWidth = getComputedStyle(document.documentElement).getPropertyValue('--map-title-width');
    if (mapInfo.clientWidth >= mapTitleWidth) {
        document.documentElement.style.setProperty('--animation-time', `${baseTitleAnimTime + (baseTitleAnimTime * ((mapInfo.clientWidth - mapTitleWidth) / mapTitleWidth))}s`);
        document.documentElement.style.setProperty('--offset', `-${mapInfo.clientWidth}px`);
        mapInfo.classList.add("marquee");
    }
}

function clampMax(x, lim) {
    if (x > lim) return lim;
    return x;
}

const socket = new ReconnectingWebSocket(websocketURI);

socket.onopen = () => {
    console.log("Connected");
}

socket.onclose = (e) => {
    console.log(`Websocket closed connection: ${e}`);
    socket.send("Client closed");
}

socket.onerror = (e) => {
    console.error(`Websocket encountered an error!: ${e}`);
}

let mods = "";

let tempName = "";
let tempDiff = "";
let tempMapper = "";
let tempSR = 0;

let tempBg = "";

let tempState = 0;

socket.onmessage = (e) => {
    const json = JSON.parse(e.data);
    if (tempState !== json.menu.state) {
        tempState = json.menu.state;
    }
    if (tempBg !== json.menu.bm.path.full) {
        tempBg = json.menu.bm.path.full;
        let img = json.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25');
        bg.setAttribute("src", `http://127.0.0.1:24050/Songs/${img}?a=${Math.random()}`);
        document.documentElement.style.setProperty('--bg-offset', `-${bg.clientHeight / 3}px`);
    }
    if (json.menu.bm.metadata.title !== tempName || json.menu.bm.metadata.difficulty !== tempDiff || json.menu.bm.metadata.mapper !== tempMapper) {
        tempName = json.menu.bm.metadata.title;
        tempDiff = json.menu.bm.metadata.difficulty;
        tempMapper = json.menu.bm.metadata.mapper;

        if (json.menu.bm.stats.BPM.min !== '') {
            let str = json.menu.bm.stats.BPM.min;
            if (json.menu.bm.stats.BPM.max !== '' && json.menu.bm.stats.BPM.max > json.menu.bm.stats.BPM.min) {
                str = `${json.menu.bm.stats.BPM.min} - ${json.menu.bm.stats.BPM.max}`;
            }
            mapBPM.innerHTML = str;
        }
        updateMapTitle(`${json.menu.bm.metadata.artist} - ${json.menu.bm.metadata.title} [${json.menu.bm.metadata.difficulty}]`);
    }
    if (json.menu.bm.stats['fullSR'] !== tempSR) {
        tempSR = json.menu.bm.stats.fullSR;
        mapStarRating.innerHTML = `~${json.menu.bm.stats.fullSR}`;
    }
    if (json.menu.mods.str !== mods) {
        mods = json.menu.mods.str;
        modsEnabled.innerHTML = `+${json.menu.mods.str}`
    }
    if (tempState === 2 || tempState === 7 || tempState === 14) {
        currentPP.innerHTML = Math.round(json.gameplay.pp.current);
        maximumPP.innerHTML = Math.round(json.gameplay.pp.maxThisPlay);
        hit100.innerHTML = json.gameplay.hits[100];
        hit50.innerHTML = json.gameplay.hits[50];
        hit0.innerHTML = json.gameplay.hits[0];
        unstableRate.innerHTML = Math.round(json.gameplay.hits.unstableRate);
    } else {
        hit100.innerHTML = 0;
        hit50.innerHTML = 0;
        hit0.innerHTML = 0;
        unstableRate.innerHTML = 0;
        currentPP.innerHTML = 0;
        maximumPP.innerHTML = 0;
    }
    if (json.menu.bm.time.current !== undefined && json.menu.bm.time.full !== undefined) {
        mapProgress.setAttribute("style", `--value:${clampMax((json.menu.bm.time.current / json.menu.bm.time.full) * 100, 100)}`);
    } else {
        mapProgress.setAttribute("style", "--value:0");
    }
}
