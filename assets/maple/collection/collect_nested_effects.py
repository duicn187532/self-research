"""Preserve nested attack/hit PNG nodes in already collected mob exports."""
import hashlib
import io
import json
import re
import zipfile
from PIL import Image
from collect import OUT,ROOT,fetch,dump

m=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
hashes={hashlib.sha256(p.read_bytes()).hexdigest():p.relative_to(ROOT).as_posix() for p in sorted((ROOT/'assets/maple').rglob('*.png'))}
for a in m['assets']:
    wanted=a.get('unmapped_export_nodes',[])
    if not wanted:continue
    remaining=[]
    with zipfile.ZipFile(io.BytesIO(fetch(a['export_url']))) as z:
        for node in wanted:
            match=re.fullmatch(r'(?:Npc|Mob)-\d+\.img-([A-Za-z0-9_-]+)-(\d+)\.png',node)
            if not match:
                leaf=re.fullmatch(r'(?:Npc|Mob)-\d+\.img-(info-default)\.png',node)
                if not leaf:
                    remaining.append(node);continue
                action=leaf[1].replace('-','/')
                index=0
                wz_path=a['wz_path']+'/'+action
            else:
                action=match[1].replace('-','/')
                index=int(match[2])
                wz_path=a['wz_path']+f'/{action}/{index}'
            data=z.read(node)
            with Image.open(io.BytesIO(data)) as im:
                im.verify()
            with Image.open(io.BytesIO(data)) as im:
                im.load();rgba=im.convert('RGBA')
                frame={'index':index,'width':im.width,'height':im.height,'mode':im.mode,
                    'has_transparency':rgba.getchannel('A').getextrema()[0]<255,
                    'sha256':hashlib.sha256(data).hexdigest(),
                    'pixel_sha256':hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest(),
                    'wz_path':wz_path,
                    'duration_ms':None,'origin':None,'decode':'pass'}
            if frame['sha256'] in hashes:
                frame.update(github_path=hashes[frame['sha256']],storage='sha256_reference')
            else:
                target=ROOT/a['github_path']/action/f'{index:04d}.png'
                target.parent.mkdir(parents=True,exist_ok=True)
                if target.exists():assert target.read_bytes()==data
                else:target.write_bytes(data)
                frame.update(github_path=target.relative_to(ROOT).as_posix(),storage='original_png')
                hashes[frame['sha256']]=frame['github_path']
            group=next((x for x in a['actions'] if x['name']==action),None)
            if group is None:
                group={'name':action,'expected_frame_count':None,'frames':[],
                       'kind':'auxiliary_canvas' if action=='info/default' else 'nested_attack_effect','count_matches_api':None}
                a['actions'].append(group)
            if not any(f['index']==index for f in group['frames']):group['frames'].append(frame)
            group['frames'].sort(key=lambda f:f['index'])
            group['frame_count']=len(group['frames'])
            group['indices_contiguous']=[f['index'] for f in group['frames']]==list(range(group['frame_count']))
    a['unmapped_export_nodes']=remaining
    a['validation']['timing_and_origin']='partial'
    dump(ROOT/a['github_path']/'asset.json',a)
    print('nested effects',a['id'],len(wanted)-len(remaining),flush=True)
dump(OUT/'manifest.json',m)
