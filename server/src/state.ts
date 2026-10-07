import { schema, t, type SchemaType } from '@colyseus/schema';

export const Disciple = schema({
  name: t.string(), avatarId: t.string(),
  x: t.number(), y: t.number(), direction: t.string(),
  moving: t.boolean(), connected: t.boolean(), ack: t.number(),
}, 'PreviewDisciple');
export type Disciple = SchemaType<typeof Disciple>;
export const CourtyardState = schema({
  players: t.map(Disciple), tick: t.number(),
}, 'PreviewCourtyardState');
export type CourtyardState = SchemaType<typeof CourtyardState>;
