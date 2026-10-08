(() => {
  "use strict";
  const data = window.WangLinAtlasData;
  if (!data || !data.frames || !data.animations) {
    document.documentElement.dataset.ready = "error";
    document.getElementById("asset-status").textContent = "Không nạp được metadata atlas.";
    return;
  }
  const params = new URLSearchParams(location.search);
  const directions = ["south", "west", "east", "north"];
  const labels = {south: "Xuống", west: "Trái", east: "Phải", north: "Lên"};
  const assetBase = new URL(".", document.querySelector("script[data-atlas]").src).href;
  const get = (id) => document.getElementById(id);
  const context = get("detail-canvas").getContext("2d");
  const map = get("map-canvas");
  const mapContext = map.getContext("2d");
  const overview = Array.from(document.querySelectorAll("[data-overview]")).map((canvas) => ({direction: canvas.dataset.overview, context: canvas.getContext("2d")}));
  const state = {
    direction: directions.includes(params.get("direction")) ? params.get("direction") : "south",
    motion: params.get("motion") === "stand" ? "stand" : "walk",
    scale: [1,2,4,8].includes(Number(params.get("scale"))) ? Number(params.get("scale")) : 4,
    fps: [6,8,10].includes(Number(params.get("fps"))) ? Number(params.get("fps")) : 8,
    playing: params.get("paused") !== "1" && !matchMedia("(prefers-reduced-motion: reduce)").matches,
    frame: Math.max(0, Math.min(5, Number(params.get("frame")) || 0)),
    grid: false, anchor: true, time: 0, ready: false
  };
  const actor = {x: 480, y: 400, direction: "south", time: 0};
  const held = new Set();
  const movementKeys = {ArrowDown: "south", s: "south", ArrowLeft: "west", a: "west", ArrowRight: "east", d: "east", ArrowUp: "north", w: "north"};
  const vectors = {south:[0,1],west:[-1,0],east:[1,0],north:[0,-1]};
  function names(direction, motion) { return data.animations[motion + "_" + direction]; }
  function frameName(direction, motion, index) {
    const list = names(direction, motion);
    return list[index % list.length];
  }
  function paint(ctx, name, x, y) {
    const rectangle = data.frames[name].frame;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(texture, rectangle.x, rectangle.y, rectangle.w, rectangle.h, Math.round(x), Math.round(y), 64, 96);
  }
  function syncControls() {
    document.querySelectorAll("[data-direction]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.direction === state.direction)));
    document.querySelectorAll("[data-motion]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.motion === state.motion)));
    get("scale").value = String(state.scale);
    get("fps").value = String(state.fps);
    get("play-toggle").textContent = state.playing ? "Tạm dừng" : "Phát";
    get("frame-slider").value = String(state.frame);
    get("frame-slider").disabled = state.motion === "stand";
    const canvas = get("detail-canvas");
    canvas.style.width = 64 * state.scale + "px";
    canvas.style.height = 96 * state.scale + "px";
    get("detail-stage").style.minWidth = Math.max(272, 64 * state.scale + 16) + "px";
    get("detail-stage").style.minHeight = Math.max(208, 96 * state.scale + 16) + "px";
    document.documentElement.dataset.direction = state.direction;
    document.documentElement.dataset.motion = state.motion;
    document.documentElement.dataset.frame = String(state.frame);
    document.documentElement.dataset.playing = String(state.playing);
  }
  function drawDetails() {
    if (!state.ready) return;
    context.clearRect(0,0,64,96);
    paint(context, frameName(state.direction, state.motion, state.frame), 0, 0);
    if (state.grid) {
      context.strokeStyle = "rgba(36,92,83,0.32)";
      context.lineWidth = 0.35;
      context.beginPath();
      for (let x = 0; x <= 64; x += 8) { context.moveTo(x,0); context.lineTo(x,96); }
      for (let y = 0; y <= 96; y += 8) { context.moveTo(0,y); context.lineTo(64,y); }
      context.stroke();
    }
    if (state.anchor) {
      context.fillStyle = "#B94F44";
      context.fillRect(29,88,7,1); context.fillRect(32,85,1,7);
    }
    overview.forEach((view) => {
      view.context.clearRect(0,0,64,96);
      paint(view.context, frameName(view.direction, state.motion, state.frame),0,0);
    });
    get("frame-status").textContent = labels[state.direction] + " · " + (state.motion === "stand" ? "Đứng" : "Đi · Frame " + state.frame) + " · " + state.fps + " FPS · " + state.scale + "×";
    syncControls();
  }
  function drawMap(delta) {
    if (!state.ready) return;
    const direction = Array.from(held).pop();
    if (direction) {
      actor.direction = direction;
      const vector = vectors[direction];
      actor.x = Math.max(48, Math.min(912, actor.x + vector[0] * 64 * delta));
      actor.y = Math.max(130, Math.min(612, actor.y + vector[1] * 64 * delta));
      actor.time += delta * state.fps;
    } else { actor.time = 0; }
    mapContext.imageSmoothingEnabled = true;
    mapContext.clearRect(0,0,960,640);
    mapContext.fillStyle='#eee5d3';mapContext.fillRect(0,0,960,640);
    mapContext.fillStyle = "rgba(48,43,31,0.20)";
    mapContext.beginPath(); mapContext.ellipse(Math.round(actor.x),Math.round(actor.y)-1,12,3,0,0,Math.PI*2); mapContext.fill();
    paint(mapContext,frameName(actor.direction,direction ? "walk" : "stand",Math.floor(actor.time)),actor.x-32,actor.y-88);
    mapContext.font = "14px Segoe UI, Arial, sans-serif";
    const name = "Vương Lâm · Nhân vật truyện";
    const width = mapContext.measureText(name).width + 16;
    mapContext.fillStyle = "#FBF7EE"; mapContext.fillRect(Math.round(actor.x-width/2),Math.round(actor.y-112),Math.ceil(width),22);
    mapContext.fillStyle = "#245C53"; mapContext.textAlign = "center"; mapContext.fillText(name,Math.round(actor.x),Math.round(actor.y-96));
    mapContext.textAlign = "left";
    get("map-status").textContent = "Vương Lâm · " + labels[actor.direction] + " · " + (direction ? "Đang đi" : "Đứng") + " · Cỡ gốc 1×";
    get("map-status").dataset.x = String(Math.round(actor.x));
    get("map-status").dataset.y = String(Math.round(actor.y));
  }
  function resetTime() { state.time = state.frame / state.fps; }
  document.querySelectorAll("[data-direction]").forEach((button) => button.addEventListener("click",() => {state.direction=button.dataset.direction;state.frame=0;resetTime();drawDetails();}));
  document.querySelectorAll("[data-motion]").forEach((button) => button.addEventListener("click",() => {state.motion=button.dataset.motion;state.frame=0;resetTime();drawDetails();}));
  get("scale").addEventListener("change",(event) => {state.scale=Number(event.target.value);drawDetails();});
  get("fps").addEventListener("change",(event) => {state.fps=Number(event.target.value);resetTime();drawDetails();});
  get("background").addEventListener("change",(event) => get("detail-stage").classList.toggle("dark",event.target.value==="dark"));
  get("show-grid").addEventListener("change",(event) => {state.grid=event.target.checked;drawDetails();});
  get("show-anchor").addEventListener("change",(event) => {state.anchor=event.target.checked;drawDetails();});
  get("play-toggle").addEventListener("click",() => {state.playing=!state.playing;resetTime();drawDetails();});
  function step(amount) {state.playing=false;state.motion="walk";state.frame=(state.frame+amount+6)%6;resetTime();drawDetails();}
  get("step-back").addEventListener("click",() => step(-1));
  get("step-forward").addEventListener("click",() => step(1));
  get("frame-slider").addEventListener("input",(event) => {state.playing=false;state.frame=Number(event.target.value);resetTime();drawDetails();});
  map.addEventListener("pointerdown",() => map.focus());
  map.addEventListener("keydown",(event) => {const direction=movementKeys[event.key] || movementKeys[event.key.toLowerCase()];if(direction){event.preventDefault();held.add(direction);}});
  window.addEventListener("keyup",(event) => {const direction=movementKeys[event.key] || movementKeys[event.key.toLowerCase()];if(direction)held.delete(direction);});
  window.addEventListener("blur",() => held.clear());
  map.addEventListener("blur",() => held.clear());
  document.querySelectorAll("[data-drive]").forEach((button) => {
    button.addEventListener("pointerdown",(event) => {event.preventDefault();map.focus();button.setPointerCapture(event.pointerId);held.add(button.dataset.drive);});
    ["pointerup","pointercancel","lostpointercapture"].forEach((type) => button.addEventListener(type,() => held.delete(button.dataset.drive)));
    button.addEventListener("keydown",(event) => {if(event.key==="Enter" || event.key===" "){event.preventDefault();held.add(button.dataset.drive);}});
    button.addEventListener("keyup",() => held.delete(button.dataset.drive));
  });
  get("reset-position").addEventListener("click",() => {held.clear();actor.x=480;actor.y=400;actor.direction="south";drawMap(0);});
  data.palette.forEach((color,index) => {
    const swatch=document.createElement("span");swatch.className="swatch"+(index===0 ? " transparent" : "");
    swatch.style.backgroundColor=color;swatch.title=index+" · "+color;get("palette").append(swatch);
  });
  function loadImage(url) {return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Không nạp được "+url));image.src=url;});}
  let texture;
  let previous=0;
  function loop(timestamp) {
    const delta=previous ? Math.min(0.06,(timestamp-previous)/1000) : 0;previous=timestamp;
    if(state.playing && state.motion==="walk") {state.time+=delta;state.frame=Math.floor(state.time*state.fps)%6;}
    drawDetails();drawMap(delta);requestAnimationFrame(loop);
  }
  Promise.all([
    loadImage(new URL(data.meta.image,assetBase).href)
  ]).then((images)=>{
    texture=images[0];
    if(texture.width!==448 || texture.height!==384 || Object.keys(data.frames).length!==28) throw new Error("Atlas không khớp metadata.");
    state.ready=true;document.documentElement.dataset.ready="true";
    get("asset-status").textContent="Đã nạp 28 frame · 64 × 96 px · 24 mục palette · Điểm chân (32, 88)";
    resetTime();drawDetails();drawMap(0);
    const viewport=get("map-viewport");
    if(viewport.clientWidth<960){viewport.scrollLeft=(960-viewport.clientWidth)/2;viewport.scrollTop=120;}
    requestAnimationFrame(loop);
  }).catch((error)=>{document.documentElement.dataset.ready="error";get("asset-status").textContent=error.message;get("asset-status").setAttribute("role","alert");});
})();
