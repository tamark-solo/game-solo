import {performance,monitorEventLoopDelay} from 'node:perf_hooks';
import type {GameLogger} from '../core/ports';

const SAFE_FIELDS=new Set(['requestId','accountId','characterId','realmId','clientId','nodeId','code','status','durationMs','count','route','method']);
export class GameObserver implements GameLogger {
  private counters=new Map<string,number>();
  private started=Date.now();
  private lag=monitorEventLoopDelay({resolution:20});
  constructor(private nodeId:string,private output:(line:string)=>void=line=>process.stdout.write(line+'\n')){this.lag.enable();}
  private write(level:string,event:string,fields:Record<string,string|number|boolean>={},error?:unknown){
    this.counters.set(event,(this.counters.get(event)??0)+1);
    const safe=Object.fromEntries(Object.entries(fields).filter(([key])=>SAFE_FIELDS.has(key)));
    const stack=error instanceof Error?error.stack?.split('\n').slice(1,9).filter(line=>/^\s+at /.test(line)):undefined;
    this.output(JSON.stringify({at:new Date().toISOString(),level,module:'game-entry',event,nodeId:this.nodeId,...safe,stack}));
  }
  event(event:string,fields?:Record<string,string|number|boolean>){this.write('info',event,fields);}
  failure(event:string,fields?:Record<string,string|number|boolean>,error?:unknown){this.write('error',event,fields,error);}
  snapshot(){return {nodeId:this.nodeId,uptimeSeconds:Math.floor((Date.now()-this.started)/1000),memoryBytes:process.memoryUsage(),eventLoopDelayMs:{mean:Number.isFinite(this.lag.mean)?Math.round(this.lag.mean/1e6):0,p99:Math.round(this.lag.percentile(99)/1e6)},eventLoopUtilization:performance.eventLoopUtilization().utilization,counters:Object.fromEntries(this.counters)};}
  dispose(){this.lag.disable();}
}
