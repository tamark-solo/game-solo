import type {HudFeatureId} from '../core/dao-hud-system';

const routes = [
  ['world','Màn chơi'],['character','Nhân vật'],['inventory','Hành trang'],['spells','Công pháp'],
  ['quest','Mệnh Kiếp Chí'],['map','Bản đồ'],['crafting','Đan–Khí'],['settings','Thiết lập'],
] as const;

/** Shared menu navigation only. Existing presenters still own their commands and state. */
export class DaoAnNavigation {
  private observer:MutationObserver;
  private controller=new AbortController();
  private frame=0;
  constructor(private shell:HTMLElement,private open:(id:HudFeatureId|'world')=>void){
    this.observer=new MutationObserver(()=>this.sync());
    this.observer.observe(shell,{subtree:true,childList:true,attributes:true,attributeFilter:['open','data-tab','data-mode','data-screen']});
    shell.addEventListener('click',event=>{
      const button=(event.target as Element).closest<HTMLButtonElement>('[data-dao-an-route]');
      if(!button)return;
      const route=routes.find(([id])=>id===button.dataset.daoAnRoute)?.[0];
      if(!route)return;
      event.preventDefault();
      if(button.getAttribute('aria-current')==='page')return;
      shell.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog=>dialog.close());
      cancelAnimationFrame(this.frame);
      // A journal may restore its source character sheet on close. Let that
      // existing lifecycle finish before transferring to another workspace.
      this.frame=requestAnimationFrame(()=>{
        shell.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog=>dialog.close());
        this.open(route);
      });
    },{signal:this.controller.signal});
    this.sync();
  }
  private sync(){
    for(const dialog of this.shell.querySelectorAll<HTMLDialogElement>('dialog[open]')){
      const header=dialog.querySelector<HTMLElement>('.character-heading,.sect-dialog-heading,.chapter-heading,.game-menu-heading,.dao-runtime-dialog-heading');
      if(!header)continue;
      let nav=dialog.querySelector<HTMLElement>('.dao-an-menu-nav');
      if(!nav){
        nav=document.createElement('nav');nav.className='dao-an-menu-nav';nav.setAttribute('aria-label','Các hệ thống trong game');
        nav.innerHTML=routes.map(([id,label])=>`<button type="button" data-dao-an-route="${id}">${label}</button>`).join('');
        header.after(nav);
      }
      const tab=dialog.querySelector<HTMLElement>('.character-window')?.dataset.tab;
      const active=dialog.id==='character-dialog'?(tab==='inventory'?'inventory':tab==='spells'?'spells':'character'):
        dialog.id==='game-menu'?'settings':dialog.id==='sect-dialog'?'quest':
        dialog.classList.contains('chapter-dialog')?(dialog.dataset.tab==='crafting'?'crafting':'quest'):
        dialog.dataset.screen==='map'?'map':'';
      for(const button of nav.querySelectorAll<HTMLButtonElement>('button')){
        const selected=button.dataset.daoAnRoute===active;
        if(selected&&button.getAttribute('aria-current')!=='page')button.setAttribute('aria-current','page');
        else if(!selected&&button.hasAttribute('aria-current'))button.removeAttribute('aria-current');
      }
    }
  }
  dispose(){this.observer.disconnect();this.controller.abort();cancelAnimationFrame(this.frame);}
}
