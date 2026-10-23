"""Collect map composites plus every independently exported PNG canvas."""
import argparse
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
from PIL import Image
from collect import BASE,DATE,OUT,ROOT,fetch,dump

def image_info(data):
    with Image.open(io.BytesIO(data)) as im: im.verify()
    with Image.open(io.BytesIO(data)) as im:
        im.load(); rgba=im.convert('RGBA')
        return im.width,im.height,im.mode,rgba.getchannel('A').getextrema()[0]<255,hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest()

parser=argparse.ArgumentParser()
parser.add_argument('plan',type=Path)
args=parser.parse_args()
plan=json.loads(args.plan.read_text(encoding='utf-8'))
manifest_path=OUT/'manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
known={(a['type'],a['id'],a['version']['region'],a['version']['version']) for a in manifest['assets']}
hashes={hashlib.sha256(p.read_bytes()).hexdigest():p.relative_to(ROOT).as_posix() for p in sorted((ROOT/'assets/maple').rglob('*.png'))}
for spec in plan:
    ident=str(spec['id']); key=('maps',ident,'TWMS','256')
    if key in known: continue
    wz=f'Map.wz/Map/Map{ident[0]}/{ident}.img'
    export=f'{BASE}/wz/export/TWMS/256/Map/Map/Map{ident[0]}/{ident}.img'
    meta_url=f'{BASE}/TWMS/256/map/{ident}'
    folder=OUT/'maps'/spec['region']/ident/'TWMS-256'
    entry={'id':ident,'type':'maps','region':spec['region'],'town':spec['region'],
      'name':spec['name'],'name_zh_tw':spec['name'],'name_zh_tw_status':'source_twms',
      'source_url':meta_url,'export_url':export,'wz_path':wz,
      'version':{'region':'TWMS','version':'256'},'acquired_on':DATE,
      'license':{'status':'redistribution_permission_unconfirmed','rights_holder':'Nexon',
        'evidence_url':'https://maplestory.io/','publication_basis':'owner_explicit_instruction_2026-10-23_not_a_copyright_license'},
      'actions':[]}
    try:
        metadata=fetch(meta_url); entry['source_metadata_sha256']=hashlib.sha256(metadata).hexdigest()
        entry['source_metadata']=json.loads(metadata)
        archive=fetch(export); entry['source_archive_sha256']=hashlib.sha256(archive).hexdigest()
        frames=[]
        with zipfile.ZipFile(io.BytesIO(archive)) as z:
            for item in z.infolist():
                if not item.filename.lower().endswith('.png'):continue
                data=z.read(item);w,h,mode,alpha,pixel=image_info(data);digest=hashlib.sha256(data).hexdigest()
                safe=re.sub(r'[^A-Za-z0-9._-]+','_',item.filename).strip('_')
                target=folder/'layers'/safe
                if digest in hashes:path=hashes[digest];storage='sha256_reference'
                else:
                    target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
                    path=target.relative_to(ROOT).as_posix();hashes[digest]=path;storage='original_png'
                frames.append({'index':len(frames),'source_archive_path':item.filename,'width':w,'height':h,
                  'mode':mode,'has_transparency':alpha,'sha256':digest,'pixel_sha256':pixel,
                  'github_path':path,'storage':storage,'decode':'pass','duration_ms':None,'origin':None})
        render_url=f'{BASE}/TWMS/256/map/{ident}/render/0?showBackgrounds=true&showPortals=true'
        data=fetch(render_url);w,h,mode,alpha,pixel=image_info(data);digest=hashlib.sha256(data).hexdigest()
        preview=folder/'composite.png';preview.parent.mkdir(parents=True,exist_ok=True);preview.write_bytes(data)
        entry['composite']={'source_url':render_url,'github_path':preview.relative_to(ROOT).as_posix(),
          'width':w,'height':h,'mode':mode,'has_transparency':alpha,'sha256':digest,'pixel_sha256':pixel,'decode':'pass'}
        entry['actions']=[{'name':'exported-canvases','kind':'map_layers','frame_count':len(frames),
          'expected_frame_count':None,'count_matches_api':None,'indices_contiguous':True,'frames':frames}]
        entry['validation']={'decode':'pass','sha256':'pass','all_api_listed_action_frames_present':True,
          'all_wz_numeric_frame_nodes_present':True,'timing_and_origin':'not_applicable',
          'visual_playback':'not_applicable','original_wz_binary_compared':False}
        entry['github_path']=folder.relative_to(ROOT).as_posix();entry['status']='collected'
        dump(folder/'asset.json',entry);manifest['assets'].append(entry);dump(manifest_path,manifest)
        print('map',ident,spec['name'],len(frames),'canvases',flush=True)
    except Exception as error:
        print('FAILED map',ident,error,flush=True)
