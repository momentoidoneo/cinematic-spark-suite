import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {isProductionTrackingHost} from '../lib/trackingHost';
describe('production-only advertising tags',()=>{
  it.each(['127.0.0.1','localhost','preview.workers.dev','silviocosta.net.evil.test'])('does not activate tags on %s',host=>expect(isProductionTrackingHost(host)).toBe(false));
  it.each(['silviocosta.net','www.silviocosta.net'])('retains production tags on %s',host=>expect(isProductionTrackingHost(host)).toBe(true));
  it('guards the early HTML loader before initializing GTM',()=>{
    const html=readFileSync(resolve(process.cwd(),'index.html'),'utf8');
    const guard=html.indexOf('silviocosta\\.net$/i.test(w.location.hostname)');
    expect(guard).toBeGreaterThan(0);
    expect(guard).toBeLessThan(html.indexOf('w[l] = w[l] || []'));
  });
});
