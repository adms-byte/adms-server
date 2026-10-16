import net from 'net';

export function sendToPrinter(
  ip: string,
  port: number,
  data: Buffer,
  timeoutMs = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      err ? reject(err) : resolve();
    };

    socket.setTimeout(timeoutMs);
    socket.once('timeout', () => done(new Error('Printer did not respond (timeout)')));
    socket.once('error', (e) => done(new Error(`Printer connection failed: ${e.message}`)));
    socket.connect(port, ip, () => {
      socket.write(data, () => socket.end(() => done()));
    });
  });
}