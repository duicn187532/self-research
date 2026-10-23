"""Validate collection image hashes, decoding, order, and existing-asset preservation."""
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]

def main():
    manifest = json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
    failures=[]; paths={}; keys=set(); frames=0
    for asset in manifest['assets']:
        key=(asset['type'],asset['id'],asset['version']['region'],asset['version']['version'])
        if key in keys: failures.append(f'duplicate entity: {key}')
        keys.add(key)
        for action in asset['actions']:
            indices=[f['index'] for f in action['frames']]
            if indices != sorted(set(indices)): failures.append(f'invalid order: {key}/{action["name"]}')
            if action['frame_count'] != len(indices): failures.append(f'frame count: {key}')
            for f in action['frames']:
                frames+=1
                p=(ROOT/f['github_path']).resolve()
                if not p.is_relative_to(ROOT.resolve()): raise ValueError('path escapes repository')
                try:
                    digest=hashlib.sha256(p.read_bytes()).hexdigest()
                    if digest != f['sha256']: failures.append(f'hash: {p}')
                    with Image.open(p) as im:
                        im.load()
                        if im.format != 'PNG' or list(im.size) != [f['width'],f['height']]:
                            failures.append(f'image format/dimensions: {p}')
                    paths[str(p)]=digest
                except Exception as e: failures.append(f'{p}: {e}')
    groups=defaultdict(list)
    for p,digest in paths.items(): groups[digest].append(p)
    duplicates=[v for v in groups.values() if len(v)>1]
    if duplicates: failures.append('duplicate storage among referenced collection images')
    inventory=[]
    for p in sorted((ROOT/'assets/maple').iterdir()):
        if p.suffix.lower() not in ('.png','.jpg','.jpeg'): continue
        try:
            with Image.open(p) as im:
                im.load()
                inventory.append({'github_path':p.relative_to(ROOT).as_posix(),
                    'width':im.width,'height':im.height,'mode':im.mode,
                    'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode':'pass',
                    'new_asset':False,'rights_status':'not_reassessed'})
        except Exception as e: failures.append(f'existing {p}: {e}')
    (OUT/'existing-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    report={'verified_on':'2026-10-23','entity_records':len(keys),
        'by_type':dict(Counter(a['type'] for a in manifest['assets'])),
        'by_region':dict(Counter(a['region'] for a in manifest['assets'])),
        'npc_by_town':dict(Counter(a['town'] for a in manifest['assets'] if a['type']=='npc')),
        'frame_references':frames,'unique_referenced_pngs':len(paths),
        'complete_api_action_frame_sets':sum(a['validation']['all_api_listed_action_frames_present'] for a in manifest['assets']),
        'timing_and_origin_complete':sum(a['validation']['timing_and_origin']=='complete' for a in manifest['assets']),
        'existing_images_preserved_inventory_count':len(inventory),
        'duplicate_storage':duplicates,'failures':failures}
    (OUT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if failures: raise SystemExit(1)

if __name__=='__main__': main()
