"""Import configured shared map resource sets as independent transparent canvases."""
import argparse, hashlib, io, json, re, zipfile
from pathlib import Path
from PIL import Image
from collect import BASE, OUT, ROOT, fetch, dump

parser=argparse.ArgumentParser(); parser.add_argument('plan',type=Path); args=parser.parse_args()
plan=json.loads(args.plan.read_text(encoding='utf-8'))
manifest_path=OUT/'manifest.json'; manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
hashes={hashlib.sha256(p.read_bytes()).hexdigest():p.relative_to(ROOT).as_posix() for p in (ROOT/'assets/maple').rglob('*.png')}
links={}
for spec in plan:
    region,kind,name=spec['region'],spec['kind'],spec['name']; low=kind.lower()
    root=OUT/'maps'/region/'shared-resource-sets'/'TWMS-256'/low/name
    url=f'{BASE}/wz/export/TWMS/256/Map/{kind}/{name}.img'; archive=fetch(url); frames=[]
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        for item in z.infolist():
            if not item.filename.lower().endswith('.png'): continue
            data=z.read(item)
            with Image.open(io.BytesIO(data)) as im:
                im.load(); rgba=im.convert('RGBA'); w,h,mode=im.width,im.height,im.mode
                alpha=rgba.getchannel('A').getextrema()[0]<255; pixel=hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest()
            digest=hashlib.sha256(data).hexdigest(); safe=re.sub(r'[^A-Za-z0-9._-]+','_',item.filename).strip('_'); target=root/safe
            if digest in hashes: path=hashes[digest]; storage='sha256_reference'
            else:
                target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data)
                path=target.relative_to(ROOT).as_posix(); hashes[digest]=path; storage='original_png'
            frames.append({'index':len(frames),'source_archive_path':item.filename,'width':w,'height':h,'mode':mode,
              'has_transparency':alpha,'sha256':digest,'pixel_sha256':pixel,'github_path':path,'storage':storage,'decode':'pass'})
    record={'kind':low,'name':name,'wz_path':f'Map.wz/{kind}/{name}.img','source_url':url,
      'source_archive_sha256':hashlib.sha256(archive).hexdigest(),'canvas_count':len(frames),'canvases':frames}
    path=root/'resource-set.json'; dump(path,record)
    ref={k:record[k] for k in ('kind','name','wz_path','source_url','canvas_count')}; ref['manifest_path']=path.relative_to(ROOT).as_posix()
    for mid in spec['maps']: links.setdefault(mid,[]).append(ref)
    print(region,kind,name,len(frames),flush=True)
for asset in manifest['assets']:
    if asset['type']=='maps' and asset['id'] in links:
        asset['resource_sets']=links[asset['id']]; asset['validation']['independent_resource_canvases']='pass'
        dump(ROOT/asset['github_path']/'asset.json',asset)
dump(manifest_path,manifest)
