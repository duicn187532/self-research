"""Import independently composable Back/Obj/Tile canvases used by collected maps."""
import hashlib, io, json, re, zipfile
from pathlib import Path
from PIL import Image
from collect import BASE, OUT, ROOT, fetch, dump

SETS=[('back','Back','Lacheln'),('obj','Obj','Lacheln')]
MAP_IDS={'450003000','450003200','450003300','450003400','450003600'}

def inspect(data):
    with Image.open(io.BytesIO(data)) as im:
        im.load(); rgba=im.convert('RGBA')
        return im.width,im.height,im.mode,rgba.getchannel('A').getextrema()[0]<255,hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest()

manifest_path=OUT/'manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
root=OUT/'maps'/'lachelein'/'shared-resource-sets'/'TWMS-256'
hashes={hashlib.sha256(p.read_bytes()).hexdigest():p.relative_to(ROOT).as_posix() for p in (ROOT/'assets/maple').rglob('*.png')}
summaries=[]
for kind,wz_kind,name in SETS:
    wz=f'Map.wz/{wz_kind}/{name}.img'
    url=f'{BASE}/wz/export/TWMS/256/Map/{wz_kind}/{name}.img'
    archive=fetch(url); frames=[]
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        for item in z.infolist():
            if not item.filename.lower().endswith('.png'): continue
            data=z.read(item); w,h,mode,alpha,pixel=inspect(data); digest=hashlib.sha256(data).hexdigest()
            safe=re.sub(r'[^A-Za-z0-9._-]+','_',item.filename).strip('_')
            target=root/kind/safe
            if digest in hashes: path=hashes[digest]; storage='sha256_reference'
            else:
                target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data)
                path=target.relative_to(ROOT).as_posix(); hashes[digest]=path; storage='original_png'
            frames.append({'index':len(frames),'source_archive_path':item.filename,'width':w,'height':h,'mode':mode,
              'has_transparency':alpha,'sha256':digest,'pixel_sha256':pixel,'github_path':path,
              'storage':storage,'decode':'pass'})
    summary={'kind':kind,'name':name,'wz_path':wz,'source_url':url,
      'source_archive_sha256':hashlib.sha256(archive).hexdigest(),'canvas_count':len(frames),'canvases':frames}
    dump(root/kind/'resource-set.json',summary); summaries.append(summary)
    print(kind,name,len(frames),flush=True)
for asset in manifest['assets']:
    if asset['type']=='maps' and asset['id'] in MAP_IDS:
        asset['resource_sets']=[{'kind':s['kind'],'name':s['name'],'wz_path':s['wz_path'],
          'source_url':s['source_url'],'canvas_count':s['canvas_count'],
          'manifest_path':(root/s['kind']/'resource-set.json').relative_to(ROOT).as_posix()} for s in summaries]
        asset['validation']['independent_resource_canvases']='pass'
        dump(ROOT/asset['github_path']/'asset.json',asset)
dump(manifest_path,manifest)
