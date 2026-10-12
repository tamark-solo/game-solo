import {GAME_ENTRY_IDS as IDS} from '../../core/game-entry-elements';

export interface EntryActions {authenticate:(login:string,password:string)=>void;create:(name:string)=>void;action:(action:string)=>void;realm:(id:string)=>void;character:(id:string)=>void;avatar:(id:string)=>void;name:(value:string)=>void}
export function attachEntryControls(root:HTMLElement,actions:EntryActions,signal:AbortSignal){
  root.addEventListener('submit',event=>{event.preventDefault();const form=event.target as HTMLFormElement;if(form.dataset.entryForm==='auth')actions.authenticate(root.querySelector<HTMLInputElement>('#'+IDS.login)!.value,root.querySelector<HTMLInputElement>('#'+IDS.password)!.value);else if(form.dataset.entryForm==='create')actions.create(root.querySelector<HTMLInputElement>('#'+IDS.characterName)!.value);},{signal});
  root.addEventListener('input',event=>{const node=event.target as HTMLInputElement;if(node.id===IDS.characterName)actions.name(node.value);},{signal});
  root.addEventListener('click',event=>{
    const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!button||button.disabled)return;
    if(button.dataset.entryRealm)actions.realm(button.dataset.entryRealm);
    else if(button.dataset.entryCharacter)actions.character(button.dataset.entryCharacter);
    else if(button.dataset.entryAvatar)actions.avatar(button.dataset.entryAvatar);
    else if(button.dataset.entryAction==='show-password'){const input=root.querySelector<HTMLInputElement>('#'+IDS.password)!;input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'Hiện':'Ẩn';button.setAttribute('aria-label',input.type==='password'?'Hiện mật khẩu':'Ẩn mật khẩu');}
    else if(button.dataset.entryAction)actions.action(button.dataset.entryAction);
  },{signal});
  root.addEventListener('keydown',event=>event.stopPropagation(),{signal});
}
