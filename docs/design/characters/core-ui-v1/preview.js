(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const names = {"wang-lin":{"name":"Vương Lâm","stage":"Áo xám · Giai đoạn ký danh"},"situ-nan":{"name":"Tư Đồ Nam","stage":"Linh thể · Tạo hình đứng v3"},"li-muwan":{"name":"Lý Mộ Uyển","stage":"Áo tím · Arc sau"}};
  const state = { format: new URLSearchParams(location.search).get('format') === 'png' ? 'png' : 'webp', generation: 0 };
  $('format').value = state.format;
  const path = (slug,size) => 'portraits/'+slug+'/native-v1/portrait-'+size+'.'+state.format;
  function applyTheme() { document.body.classList.toggle('dark',$('theme').value==='dark'); document.documentElement.dataset.theme=$('theme').value; }
  async function loadImage(img,source) {
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Không nạp được '+source));img.src=source;});
  }
  async function speaker() {
    const slug = $('speaker').value;
    $('speaker-stage').textContent = names[slug].stage;
    $('dialogue-portrait').alt='Chân dung '+names[slug].name+' ở cỡ hội thoại';
    await loadImage($('dialogue-portrait'),path(slug,160));
  }
  async function render() {
    const generation=++state.generation;
    document.documentElement.dataset.ready='loading';
    try {
      await Promise.all([...document.querySelectorAll('img[data-slug]')].map(img=>loadImage(img,path(img.dataset.slug,Number(img.dataset.size)))));
      await speaker();
      if(generation!==state.generation)return;
      document.documentElement.dataset.ready='true';
      document.documentElement.dataset.format=state.format;
      $('asset-status').textContent='Đã nạp ba chân dung: bản 512 px để xem nguồn, 160 px hội thoại và 64 px thumbnail.';
    } catch(error) { if(generation!==state.generation)return; $('asset-status').textContent=error.message; document.documentElement.dataset.ready='error'; }
  }
  $('theme').addEventListener('change',applyTheme);
  $('format').addEventListener('change',()=>{state.format=$('format').value;render();});
  $('speaker').addEventListener('change',()=>{speaker().catch(error=>{$('asset-status').textContent=error.message;});});
  applyTheme();render();
})();
