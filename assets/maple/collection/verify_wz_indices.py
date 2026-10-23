"""Verify real WZ numeric nodes; renderer positions are not always node numbers.

Run --prepare while other metadata work runs, then --apply after it finishes.
"""
import argparse
import json
from concurrent.futures import ThreadPoolExecutor,as_completed
from collect import OUT,ROOT,BASE,fetch,dump

parser=argparse.ArgumentParser()
parser.add_argument('--prepare',action='store_true')
parser.add_argument('--apply',action='store_true')
args=parser.parse_args()
cache=OUT/'wz-index-check.json'
m=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))

def inspect(job):
    a,g=job
    path=a['wz_path']+'/'+g['name']
    url=f"{BASE}/wz/{a['version']['region']}/{a['version']['version']}/{path.replace('.wz/','/')}"
    try:
        data=json.loads(fetch(url))
        key=f"{a['version']['region']}/{a['version']['version']}/{path}"
        return key,{'source_url':url,'indices':sorted(int(v) for v in data['children'] if str(v).isdigit()),'error':None}
    except Exception as error:
        key=f"{a['version']['region']}/{a['version']['version']}/{path}"
        return key,{'source_url':url,'indices':None,'error':str(error)}

if args.prepare:
    jobs=[(a,g) for a in m['assets'] if a['type']!='maps' for g in a['actions'] if g.get('kind')!='auxiliary_canvas' and (g['frames'] or g.get('expected_frame_count'))]
    results={}
    with ThreadPoolExecutor(max_workers=16) as pool:
        futures=[pool.submit(inspect,job) for job in jobs]
        for i,future in enumerate(as_completed(futures),1):
            path,result=future.result();results[path]=result
            if i%100==0:print('verified WZ actions',i,'/',len(jobs),flush=True)
    dump(cache,results)
if args.apply:
    results=json.loads(cache.read_text(encoding='utf-8'))
    for a in m['assets']:
        if a['type']=='maps':
            dump(ROOT/a['github_path']/'asset.json',a)
            continue
        complete=True
        for g in a['actions']:
            if g.get('kind')=='auxiliary_canvas':continue
            if not g['frames'] and not g.get('expected_frame_count'):continue
            key=f"{a['version']['region']}/{a['version']['version']}/{a['wz_path']}/{g['name']}"
            result=results.get(key) or results.get(a['wz_path']+'/'+g['name'])
            g['wz_index_verification']=result
            if not result or result['error']:
                complete=False;continue
            indices=result['indices']
            invalid=[f for f in g['frames'] if f['index'] not in indices]
            # Only discard ordinal renderer insertions; never delete original export nodes.
            if any(f.get('retrieval')!='resolved_frame_renderer' for f in invalid):
                raise ValueError('Original export disagrees with WZ index: '+a['id'])
            g['frames']=[f for f in g['frames'] if f['index'] in indices]
            g['frame_count']=len(g['frames'])
            g['indices_contiguous']=[f['index'] for f in g['frames']]==list(range(g['frame_count']))
            g['count_matches_api']=g['frame_count']==g.get('expected_frame_count')
            g['wz_indices_match']=[f['index'] for f in g['frames']]==indices
            complete=complete and g['wz_indices_match']
        a['validation']['all_wz_numeric_frame_nodes_present']=complete
        a['validation']['timing_and_origin']='complete' if all(
            f['duration_ms'] is not None and f['origin'] is not None
            for g in a['actions'] for f in g['frames']) else 'partial'
        a['validation']['all_api_listed_action_frames_present']=all(
            any(g['name']==name and g['frame_count']==count for g in a['actions'])
            for name,count in a['expected_actions'].items())
        a['status']='collected' if complete else 'partial'
        dump(ROOT/a['github_path']/'asset.json',a)
    dump(OUT/'manifest.json',m)
    print('WZ index results applied',flush=True)
