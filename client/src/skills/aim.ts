import type { Input } from '@shared/world/types';
import { facingAim, normalizedAim } from '../../../shared/skills/aim';

// Input intent is separate from actor motion and the server-confirmed active cast.
export class SkillAim {
  private intent?:Input;
  private movement:Input={x:0,y:0};
  source:'facing'|'movement'|'pointer'='facing';

  observeMovement(input:Input):void {
    if(!Number.isFinite(input.x)||!Number.isFinite(input.y))return;
    if(input.x===this.movement.x&&input.y===this.movement.y)return;
    this.movement={...input};
    const direction=normalizedAim(input);
    // Stopping preserves aim. Unchanged held input must not erase a later pointer aim.
    if(direction){this.intent=direction;this.source='movement';}
  }
  point(input:Input):void {
    const direction=normalizedAim(input);
    if(direction){this.intent=direction;this.source='pointer';}
  }
  value(facing:string):Input {return {...(this.intent??facingAim(facing))};}
  reset():void {this.intent=undefined;this.movement={x:0,y:0};this.source='facing';}
}
