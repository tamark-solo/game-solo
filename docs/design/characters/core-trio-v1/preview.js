(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const directions = ['south','west','east','north'];
  const state = { ready: false, direction: 'south', scale: 2 };
  const configs = [
    { id: 'wanglin', data: window.WangLinAtlasData, atlasPath: '../wang-lin-gray-walk-v1/native-v2/atlas.png', mode: 'stand', size: [64,96], anchor: [32,88] },
    { id: 'situ', data: window.SituNanStaticData, atlasPath: 'situ-nan/native-v4/atlas.png', mode: 'static', size: [64,96], anchor: [32,88] },
    { id: 'muwan', data: window.LiMuwanStaticData, atlasPath: 'li-muwan/native-v2/atlas.png', mode: 'static', size: [64,96], anchor: [32,88] }
  ];
  function imageAt(path) {
    return new Promise((resolve,reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Không nạp được ' + path)); image.src = path; });
  }
  function draw() {
    if(!state.ready)return;
    for(const config of configs) {
      const canvas = $('sprite-' + config.id), context = canvas.getContext('2d');
      canvas.style.width = config.size[0]*state.scale + 'px'; canvas.style.height = config.size[1]*state.scale + 'px';
      context.clearRect(0,0,...config.size); context.imageSmoothingEnabled = false;
      const name = config.data.animations[config.mode+'_'+state.direction][0];
      const frame = config.data.frames[name].frame;
      context.drawImage(config.image,frame.x,frame.y,frame.w,frame.h,0,0,...config.size);
      if($('anchor').checked){const [x,y]=config.anchor;context.fillStyle='#ab4b38';context.fillRect(x-3,y,7,1);context.fillRect(x,y-3,1,7);}
      canvas.dataset.frame = name;
    }
    $('comparison').classList.toggle('dark',$('backdrop').value==='dark');
    document.querySelectorAll('[data-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.direction===state.direction)));
    Object.assign(document.documentElement.dataset,{direction:state.direction,scale:String(state.scale),ready:'true'});
  }
  document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>{state.direction=button.dataset.direction;draw();}));
  $('scale').addEventListener('change',()=>{state.scale=Number($('scale').value);draw();});
  ['backdrop','anchor'].forEach(id=>$(id).addEventListener('change',draw));
  async function start() {
    try {
      configs.forEach(config=>{if(!config.data)throw new Error('Thiếu metadata: '+config.id);directions.forEach(direction=>{if(!config.data.animations[config.mode+'_'+direction]?.length)throw new Error('Thiếu hướng '+direction);});});
      const images = await Promise.all(configs.map(config=>imageAt(config.atlasPath)));
      configs.forEach((config,index)=>config.image=images[index]);
      state.ready=true; draw();
      $('asset-status').textContent='Đã nạp 4 mẫu đứng linh thể Tư Đồ Nam, 4 mẫu đứng Lý Mộ Uyển và 4 frame đứng Vương Lâm để đối chiếu. Mỗi bộ có palette 24 mục gồm trong suốt.';
    }catch(error){$('asset-status').textContent=error.message;document.documentElement.dataset.ready='error';}
  }
  start();
})();
