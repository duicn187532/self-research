"""Deduplicate decoded pixels, retaining original frame order and source hashes."""
import json
from collect import OUT,ROOT,dump

m=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
canonical={}; old_paths=set(); changes=0
for a in m['assets']:
    for action in a['actions']:
        for f in action['frames']:
            key=f['pixel_sha256']
            if key not in canonical:
                canonical[key]=(f['github_path'],f['sha256'])
                continue
            target,digest=canonical[key]
            if target!=f['github_path']:
                old_paths.add(f['github_path'])
                f.setdefault('source_png_sha256',f['sha256'])
                f.update(github_path=target,sha256=digest,storage='identical_pixels_reference')
                changes+=1
    dump(ROOT/a['github_path']/'asset.json',a)
referenced={f['github_path'] for a in m['assets'] for action in a['actions'] for f in action['frames']}
for relative in sorted(old_paths-referenced):
    p=(ROOT/relative).resolve()
    if p.is_relative_to(OUT.resolve()) and p.suffix=='.png':
        p.unlink()
dump(OUT/'manifest.json',m)
print('pixel-deduplicated frame references:',changes)
