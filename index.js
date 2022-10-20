const websocketURI = "ws://127.0.0.1:24050/ws";
const baseTitleAnimTime = 7;

const currentPP = document.getElementById("pp");
const maximumPP = document.getElementById("pp-maximum-this-play");
const hit100 = document.getElementById("hit100");
const hit50 = document.getElementById("hit50");
const hit0 = document.getElementById("hit0");
const unstableRate = document.getElementById("ur");
const sliderBreaks = document.getElementById("sb")
const mapInfo = document.getElementById("map-title");
const mapStarRating = document.getElementById("map-sr");
const modsEnabled = document.getElementById("map-mods");
const mapBPM = document.getElementById("map-bpm");
const bg = document.getElementById("bg");

// Needed so fonts don't mess up mapInfo.clientWidth
let initialMapTitleUpdate = true;

function updateMapTitle(newTitle) {
    setTimeout(() => {
        mapInfo.classList.remove("marquee");
        mapInfo.innerHTML = newTitle;
        void mapInfo.clientWidth;
        const mapTitleWidth = getComputedStyle(document.documentElement).getPropertyValue('--map-title-width');
        if (mapInfo.clientWidth >= mapTitleWidth) {
            document.documentElement.style.setProperty('--animation-time', `${baseTitleAnimTime + (baseTitleAnimTime * ((mapInfo.clientWidth - mapTitleWidth) / mapTitleWidth))}s`);
            document.documentElement.style.setProperty('--offset', `-${mapInfo.clientWidth}px`);
            mapInfo.classList.add("marquee");
        }
        if (initialMapTitleUpdate) {
            initialMapTitleUpdate = false;
        }
    }, initialMapTitleUpdate ? 1000:0);
}

// TODO: remove unless there's a mod that doesn't properly adjust bpm
function changeBPM(min, max, scalar) {
    min = Math.round(min * scalar);
    max = Math.round(max * scalar);
    let str = min;
    if (min !== '' && max > min) {
        str = `${min} - ${max}`;
    }
    mapBPM.innerHTML = str;
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

let tempSR;

let tempBg = "";

let tempState;

let tempMinBPM;
let tempMaxBPM;

let tempMD5;

let tempGameMode;

socket.onmessage = (e) => {
    const json = JSON.parse(e.data);
    if (tempState !== json.menu.state) {
        tempState = json.menu.state;
    }
    if (tempGameMode !== json.menu.gameMode) {
        tempGameMode = json.menu.gameMode;
        if (tempGameMode === 1) {
            document.getElementById("hit50").style.opacity = 0;
        } else {
            document.getElementById("hit50").style.opacity = 1;
        }
    }
    if (tempBg !== json.menu.bm.path.full) {
        tempBg = json.menu.bm.path.full;
        let img = json.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25');
        bg.setAttribute("src", "");
        bg.setAttribute("src", `http://127.0.0.1:24050/Songs/${img}?a=${Math.random()}`);
    }
    if (json.menu.bm.md5 !== tempMD5) {
        tempMD5 = json.menu.bm.md5;
        updateMapTitle(`${json.menu.bm.metadata.artist} - ${json.menu.bm.metadata.title} [${json.menu.bm.metadata.difficulty}]`);
    }
    if (json.menu.bm.stats['fullSR'] !== tempSR) {
        tempSR = json.menu.bm.stats.fullSR;
        mapStarRating.innerHTML = `~${json.menu.bm.stats.fullSR}`;
    }
    if (json.menu.bm.stats.BPM.min !== tempMinBPM || json.menu.bm.stats.BPM.max !== tempMaxBPM) {
        tempMinBPM = json.menu.bm.stats.BPM.min;
        tempMaxBPM = json.menu.bm.stats.BPM.max;
        changeBPM(tempMinBPM, tempMaxBPM, 1);
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
        sliderBreaks.innerHTML = json.gameplay.hits.sliderBreaks;
    } else {
        hit100.innerHTML = 0;
        hit50.innerHTML = 0;
        hit0.innerHTML = 0;
        unstableRate.innerHTML = 0;
        currentPP.innerHTML = 0;
        maximumPP.innerHTML = 0;
    }
}
