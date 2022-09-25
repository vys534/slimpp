const websocketURI = "ws://127.0.0.1:24050/ws";

const currentPP = document.getElementById("pp");
const maximumPP = document.getElementById("pp-maximum-this-play");
const currentCombo = document.getElementById("combo");
const maximumCombo = document.getElementById("max-combo");
const hit100 = document.getElementById("hit100");
const hit50 = document.getElementById("hit50");
const hit0 = document.getElementById("hit0");
const unstableRate = document.getElementById("ur");
const mapInfo = document.getElementById("map-title");
const mapStarRating = document.getElementById("map-sr");
const modsEnabled = document.getElementById("map-mods");
const mapBPM = document.getElementById("map-bpm");
const mapProgress = document.getElementById("map-progress");

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

socket.onmessage = (e) => {
    const json = JSON.parse(e.data);

    if (json.menu.bm.metadata.title !== tempName || json.menu.bm.metadata.difficulty || tempDiff && json.menu.bm.metadata.mapper || tempMapper) {
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

        mapInfo.innerHTML = `${json.menu.bm.metadata.artist} - ${json.menu.bm.metadata.title} [${json.menu.bm.metadata.difficulty}]`
        mapStarRating.innerHTML = json.menu.bm.stats.fullSR;

    }
    if (json.menu.mods.str !== mods) {
        modsEnabled.innerHTML = `+${json.menu.mods.str}`
    }
    if (json.gameplay.pp.current !== '') {
        currentPP.innerHTML = Math.round(json.gameplay.pp.current);
    } else {
        currentPP.innerHTML = 0;
    }
    if (json.gameplay.pp.maxThisPlay !== '') {
        maximumPP.innerHTML = Math.round(json.gameplay.pp.maxThisPlay);
    } else {
        maximumPP.innerHTML = 0;
    }
    if (json.gameplay.combo.current !== '') {
        currentCombo.innerHTML = Math.round(json.gameplay.combo.current);
    } else {
        currentCombo.innerHTML = 0;
    }
    if (json.gameplay.combo.max !== '') {
        maximumCombo.innerHTML = Math.round(json.gameplay.combo.max);
    } else {
        maximumCombo.innerHTML = 0;
    }
    if (json.gameplay.hits[100] > 0) {
        hit100.innerHTML = json.gameplay.hits[100];
    } else {
        hit100.innerHTML = 0;
    }
    if (json.gameplay.hits[50] > 0) {
        hit50.innerHTML = json.gameplay.hits[50];
    } else {
        hit50.innerHTML = 0;
    }
    if (json.gameplay.hits[0] > 0) {
        hit0.innerHTML = json.gameplay.hits[0];
    } else {
        hit0.innerHTML = 0;
    }
    if (json.gameplay.hits.unstableRate > 0) {
        unstableRate.innerHTML = Math.round(json.gameplay.hits.unstableRate);
    } else {
        unstableRate.innerHTML = 0;
    }

    if (json.menu.bm.time.current > 0 && json.menu.bm.time.full > 0) {
        const val = (json.menu.bm.time.current / json.menu.bm.time.full);
        if (val > 1.01) return;
        mapProgress.setAttribute("style", `--value:${Math.floor(val * 100)}`);
    } else {
        mapProgress.setAttribute("style", "--value:0");
    }

}
