import { Router, Request, Response } from 'express';
import net from 'net';
import { buildReceipt, ReceiptData } from './escpos';
import { sendToPrinter } from './printer';

const printRouter = Router();

const DEFAULT_PORT = 9100;

function resolveTarget(body: any) {
  const printerIp: string | undefined = body?.printerIp;
  const port: number = Number(body?.port) || DEFAULT_PORT;
  if (!printerIp || net.isIP(printerIp) === 0) {
    return { error: 'Invalid printer IP' as const };
  }
  return { printerIp, port };
}

// POST /api/print/receipt  { printerIp, port?, receipt }
printRouter.post('/receipt', async (req: Request, res: Response) => {
  const target = resolveTarget(req.body);
  if ('error' in target) {
    res.status(400).json({ ok: false, error: target.error });
    return;
  }
  try {
    const receipt = req.body.receipt as ReceiptData;
    await sendToPrinter(target.printerIp, target.port, buildReceipt(receipt));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

// POST /api/print/test  { printerIp, port? }
printRouter.post('/test', async (req: Request, res: Response) => {
    console.log(req.body, 'API');
    
  const target = resolveTarget(req.body);
  if ('error' in target) {
    res.status(400).json({ ok: false, error: target.error });
    return;
  }
  try {
    await sendToPrinter(
      target.printerIp,
      target.port,
      buildReceipt({ receiptNo: 'TEST', name: 'Test Print', amount: '0' })
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

export default printRouter;