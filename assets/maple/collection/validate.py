"""Validate collection image hashes, decoding, order, and existing-asset preservation."""
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]

def visual_key(im):
    rgba=im.convert('RGBA')
    bbox=rgba.getchannel('A').getbbox()
    if not bbox:return 'transparent'
    rgba=rgba.crop(bbox)
    raw=bytearray(rgba.tobytes())
    for i in range(0,len(raw),4):
        if raw[i+3]==0:raw[i:i+3]=b'\x00\x00\x00'
    return hashlib.sha256(str(rgba.size).encode()+raw).hexdigest()

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
            check=action.get('wz_index_verification')
            if action.get('wz_indices_match') and (not check or indices!=check['indices']):
                failures.append(f'WZ index mismatch: {key}/{action["name"]}')
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
                        pixels=hashlib.sha256(str(im.size).encode()+im.convert('RGBA').tobytes()).hexdigest()
                        if pixels!=f['pixel_sha256']: failures.append(f'pixel hash: {p}')
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
    old_visuals=set()
    sprite_text=(ROOT/'assets/maple/sprites.js').read_text(encoding='utf-8')
    old_sprites=json.loads(sprite_text.split('window.MAPLE_SPRITES = ',1)[1].strip().rstrip(';'))
    for ident,spec in old_sprites.items():
        for action,(w,h,n) in spec['acts'].items():
            p=ROOT/f'assets/maple/spr-{ident}-{action}.png'
            with Image.open(p) as im:
                for index in range(n):old_visuals.add(visual_key(im.crop((index*w,0,(index+1)*w,h))))
    content_cache={}
    content_groups=defaultdict(list)
    new_content=Counter();existing_only=[]
    new_unique=Counter();seen_visual_groups=set()
    for a in manifest['assets']:
        visuals=set()
        for group in a['actions']:
            for f in group['frames']:
                path=f['github_path']
                if path not in content_cache:
                    with Image.open(ROOT/path) as im:content_cache[path]=visual_key(im)
                visuals.add(content_cache[path])
        content_groups[tuple(sorted(visuals))].append(a['type']+'/'+a['id'])
        visual_group=(a['type'],tuple(sorted(visuals)))
        if visuals-old_visuals:
            new_content[a['type']]+=1
            if visual_group not in seen_visual_groups:new_unique[a['type']]+=1
        else:existing_only.append(a['type']+'/'+a['id'])
        seen_visual_groups.add(visual_group)
    report={'verified_on':'2026-10-24','entity_records':len(keys),
        'by_type':dict(Counter(a['type'] for a in manifest['assets'])),
        'by_region':dict(Counter(a['region'] for a in manifest['assets'])),
        'npc_by_town':dict(Counter(a['town'] for a in manifest['assets'] if a['type']=='npc')),
        'frame_references':frames,'unique_referenced_pngs':len(paths),
        'unique_decoded_pixel_frames':len({f['pixel_sha256'] for a in manifest['assets'] for x in a['actions'] for f in x['frames']}),
        'complete_api_action_frame_sets':sum(a['validation']['all_api_listed_action_frames_present'] for a in manifest['assets']),
        'complete_wz_numeric_frame_sets':sum(a['validation'].get('all_wz_numeric_frame_nodes_present',False) for a in manifest['assets']),
        'timing_and_origin_complete':sum(a['validation']['timing_and_origin']=='complete' for a in manifest['assets']),
        'frames_missing_origin':sum(f['origin'] is None for a in manifest['assets'] for g in a['actions'] for f in g['frames']),
        'frames_missing_explicit_delay':sum(f['duration_ms'] is None for a in manifest['assets'] for g in a['actions'] for f in g['frames']),
        'existing_images_preserved_inventory_count':len(inventory),
        'records_with_new_visual_frames_vs_existing_strips':dict(new_content),
        'new_unique_visual_sets_excluding_existing_and_duplicate_npcs':dict(new_unique),
        'records_only_reusing_existing_visuals':existing_only,
        'identical_visual_content_entity_groups':[v for v in content_groups.values() if len(v)>1],
        'duplicate_storage':duplicates,'failures':failures}
    (OUT/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if failures: raise SystemExit(1)

if __name__=='__main__': main()
