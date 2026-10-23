"""Read original WZ frame delay and origin; null values never imply defaults."""
import json
from concurrent.futures import ThreadPoolExecutor
from collect import OUT, BASE, fetch, dump

def enrich_frame(job):
    path,field=job
    url=f'{BASE}/wz/GMS/83/{path.replace(".wz/", "/")}/{field}'
    try:
        data=json.loads(fetch(url))
        value=data.get('value')
        if field=='delay' and isinstance(value,int): return job,value,None
        if field=='origin' and isinstance(value,dict) and 'x' in value and 'y' in value:
            return job,{'x':value['x'],'y':value['y']},None
        return job,None,'node missing or unexpected type'
    except Exception as e: return job,None,str(e)

manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
cache_path=OUT/'frame-metadata-cache.json'
cache=json.loads(cache_path.read_text(encoding='utf-8')) if cache_path.exists() else {}
jobs=[]
for a in manifest['assets']:
    for action in a['actions']:
        for f in action['frames']:
            for field in ('delay','origin'):
                if f['wz_path']+'/'+field not in cache: jobs.append((f['wz_path'],field))
with ThreadPoolExecutor(max_workers=6) as pool:
    for count,(job,value,error) in enumerate(pool.map(enrich_frame,jobs),1):
        cache[job[0]+'/'+job[1]]={'value':value,'error':error}
        if count%100==0:
            dump(cache_path,cache)
            print('frame metadata',count,'/',len(jobs),flush=True)
dump(cache_path,cache)
for a in manifest['assets']:
    complete=True
    for action in a['actions']:
        for f in action['frames']:
            f.pop('metadata_issues',None)
            for field,target in [('delay','duration_ms'),('origin','origin')]:
                result=cache[f['wz_path']+'/'+field]
                f[target]=result['value']
                if result['error']:
                    complete=False
                    f.setdefault('metadata_issues',{})[field]=result['error']
    a['validation']['timing_and_origin']='complete' if complete else 'partial'
    dump(OUT.parents[2]/a['github_path']/'asset.json',a)
dump(OUT/'manifest.json',manifest)
print('metadata complete',flush=True)
