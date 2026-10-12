export class GameError extends Error {
  constructor(readonly code:string,readonly status:number,readonly publicMessage:string){super(code);this.name='GameError';}
}
export const denied=()=>new GameError('session_required',401,'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
