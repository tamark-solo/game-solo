const port = Number(process.env.PORT ?? 2567);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT không hợp lệ.');

export const serverConfig = {
  port,
  host: process.env.HOST ?? '127.0.0.1',
  transport: { maxPayload: 8192, pingInterval: 3000 },
};

export const courtyardLimits = {
  maxClients: 20, // A test-room limit, not a measured MMO capacity.
  maxMessagesPerSecond: 90,
  inputBufferSize: 64,
  reconnectSeconds: 15,
};
