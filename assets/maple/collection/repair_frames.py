"""Recover missing API-listed frames without discarding partial collections."""
import hashlib
import io
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from collect import OUT, ROOT, fetch, dump

m=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
hashes={hashlib.sha256(p.read_bytes()).hexdigest():p.relative_to(ROOT).as_posix() for p in sorted((ROOT/'assets/maple').rglob('*.png'))}
jobs=[]
for a in m['assets']:
    for name,count in a['expected_actions'].items():
        action=next((x for x in a['actions'] if x['name']==name),None)
        if action is None:
            action={'name':name,'frame_count':0,'expected_frame_count':count,'frames':[]}
            a['actions'].append(action)
        present={f['index'] for f in action['frames']}
        for index in range(count):
            if index not in present: jobs.append((a,action,index))

def download(job):
    a,action,index=job
    url=a['source_url']+f'/render/{action["name"]}/{index}'
    data=fetch(url)
    with Image.open(io.BytesIO(data)) as im:
        im.verify()
    with Image.open(io.BytesIO(data)) as im:
        im.load()
        if im.format!='PNG':raise ValueError('not PNG')
        rgba=im.convert('RGBA')
        f={'index':index,'width':im.width,'height':im.height,'mode':im.mode,
           'has_transparency':rgba.getchannel('A').getextrema()[0]<255,
           'sha256':hashlib.sha256(data).hexdigest(),
           'pixel_sha256':hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest(),
           'wz_path':a['wz_path']+f'/{action["name"]}/{index}',
           'duration_ms':None,'origin':None,'decode':'pass','source_url':url,
           'retrieval':'resolved_frame_renderer'}
    return data,f

with ThreadPoolExecutor(max_workers=6) as pool:
    pending={pool.submit(download,job):job for job in jobs}
    for number,future in enumerate(as_completed(pending),1):
        a,action,index=pending[future]
        try:
            data,f=future.result()
            if f['sha256'] in hashes:
                f.update(github_path=hashes[f['sha256']],storage='sha256_reference')
            else:
                target=ROOT/a['github_path']/action['name']/f'{index:04d}.png'
                target.parent.mkdir(parents=True,exist_ok=True)
                if target.exists():assert target.read_bytes()==data
                else:target.write_bytes(data)
                f.update(github_path=target.relative_to(ROOT).as_posix(),storage='original_png')
                hashes[f['sha256']]=f['github_path']
            action['frames'].append(f)
        except Exception as error:
            a.setdefault('repair_failures',[]).append({'action':action['name'],'index':index,'error':str(error)})
        if number%25==0: print('repaired/attempted',number,'/',len(jobs),flush=True)
for a in m['assets']:
    for action in a['actions']:
        action['frames'].sort(key=lambda f:f['index'])
        action['frame_count']=len(action['frames'])
        action['indices_contiguous']=[f['index'] for f in action['frames']]==list(range(action['frame_count']))
        action['count_matches_api']=action['frame_count']==action['expected_frame_count']
    complete=bool(a['expected_actions']) and all(
        any(x['name']==name and x['count_matches_api'] and x['indices_contiguous'] for x in a['actions'])
        for name in a['expected_actions'])
    a['validation']['all_api_listed_action_frames_present']=complete
    a['status']='collected' if complete else 'partial'
    dump(ROOT/a['github_path']/'asset.json',a)
dump(OUT/'manifest.json',m)
print('repair finished',flush=True)
