import fs from 'fs';

const dir = 'stakeengine-slot/stakeengine_package';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
for (const f of files) {
  const lines = fs.readFileSync(`${dir}/${f}`, 'utf8').trim().split('\n');
  const headers = lines[0].split(',');
  const dataLines = lines.slice(1);
  let maxPayout = 0;
  let totalProb = 0;
  for (const line of dataLines) {
    const parts = line.split(',');
    const prob = parseFloat(parts[1]);
    const payout = parseInt(parts[2], 10);
    totalProb += prob;
    if (payout > maxPayout) maxPayout = payout;
  }
  console.log(`${f}: rows=${dataLines.length}, maxPayoutMultiplier=${maxPayout}, totalProb=${totalProb}`);
}
