const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const csvPath = path.join(repoRoot, 'prisma', 'data', 'products_seed.csv');
const imagesDir = path.join(repoRoot, 'public', 'images', 'products');

function readCsvImagePaths(csvFile) {
  const raw = fs.readFileSync(csvFile, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const imgIdx = header.indexOf('image_path');
  if (imgIdx === -1) return [];
  return lines.slice(1).map(l => {
    // basic CSV split (seed file is simple, no quoted commas)
    const cols = l.split(',');
    return cols[imgIdx].trim();
  }).filter(Boolean);
}

function listImageFiles(dir) {
  try {
    return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
  } catch {
    return [];
  }
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/[^a-z0-9]+/g, ' ') // non-alphanum to space
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenSet(s) {
  return new Set(s.split(' ').filter(Boolean));
}

function jaccardScore(a, b) {
  const A = tokenSet(a);
  const B = tokenSet(b);
  const inter = new Set([...A].filter(x => B.has(x)));
  const union = new Set([...A, ...B]);
  if (union.size === 0) return 0;
  return inter.size / union.size;
}

function main() {
  const csvImages = readCsvImagePaths(csvPath).map(p => p.replace(/^\/*images\/?products\//i, '').replace(/^\//, ''));
  const files = listImageFiles(imagesDir);

  const filesLower = files.map(f => f);

  const results = [];

  for (const img of csvImages) {
    const basename = path.basename(img);
    const exactIndex = files.indexOf(basename);
    const ciIndex = files.findIndex(f => f.toLowerCase() === basename.toLowerCase());

    let match = null;
    if (exactIndex !== -1) {
      match = { type: 'exact', file: files[exactIndex] };
    } else if (ciIndex !== -1) {
      match = { type: 'case-insensitive', file: files[ciIndex] };
    } else {
      // fuzzy: compute jaccard over tokenized names
      const normA = normalizeName(basename);
      let best = { score: 0, file: null };
      for (const f of files) {
        const normF = normalizeName(f);
        const s = jaccardScore(normA, normF);
        if (s > best.score) best = { score: s, file: f };
      }
      if (best.score >= 0.45) {
        match = { type: 'fuzzy', file: best.file, score: best.score };
      }
    }

    results.push({ csv: img, match });
  }

  // Print report
  console.log('Product image scan report');
  console.log('Images dir:', imagesDir);
  console.log('Found image files:', files.length);
  console.log('CSV image entries:', csvImages.length);
  console.log('');

  let missing = 0;
  for (const r of results) {
    if (r.match) {
      console.log(`OK: ${r.csv} -> [${r.match.type}] ${r.match.file}${r.match.score ? ` (score=${r.match.score.toFixed(2)})` : ''}`);
    } else {
      console.log(`MISSING: ${r.csv} -> no candidate found`);
      missing++;
    }
  }

  console.log('');
  console.log(`Summary: ${results.length - missing} matched, ${missing} missing`);

  // exit with non-zero code if missing
  process.exit(missing === 0 ? 0 : 2);
}

main();

