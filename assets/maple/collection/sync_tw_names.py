"""Synchronize Traditional Chinese display names from the TWMS/256 ID indexes."""
import json
from collect import BASE, OUT, ROOT, fetch, dump

INDEX_URLS={'npc':f'{BASE}/TWMS/256/npc','mobs':f'{BASE}/TWMS/256/mob','bosses':f'{BASE}/TWMS/256/mob'}
PHASE_LABELS={
    ('bosses','8880100'):'第一階段',
    ('bosses','8880150'):'第一階段',
    ('bosses','8880151'):'第二階段',
    ('bosses','8880152'):'第三形態',
    ('bosses','8880300'):'第一階段',
    ('bosses','8880301'):'第二階段',
}

indexes={}
for kind,url in INDEX_URLS.items():
    indexes[kind]={str(row['id']):row.get('name','').strip() for row in json.loads(fetch(url))}

manifest_path=OUT/'manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
unresolved=[]
for asset in manifest['assets']:
    kind=asset['type']
    if kind in indexes:
        source_name=indexes[kind].get(asset['id'])
        if not source_name:
            unresolved.append({'type':kind,'id':asset['id']})
            continue
        asset['name_zh_tw']=source_name
        asset['name_zh_tw_status']='source_twms_256_id_match' if asset['version']['region']!='TWMS' else 'source_twms'
        asset['name_zh_tw_source_url']=INDEX_URLS[kind]
        label=PHASE_LABELS.get((kind,asset['id']))
        if label:
            asset['variant_label_zh_tw']=label
            asset['display_name_zh_tw']=f'{source_name}（{label}）'
        else:
            asset.pop('variant_label_zh_tw',None)
            asset['display_name_zh_tw']=source_name
    else:
        # Map names already come from the TWMS map endpoint.
        asset['display_name_zh_tw']=asset.get('name_zh_tw') or asset.get('name')
    dump(ROOT/asset['github_path']/'asset.json',asset)

if unresolved:
    raise SystemExit('Unresolved TWMS names: '+json.dumps(unresolved,ensure_ascii=False))
manifest['name_fields']={
    'preferred_display':'display_name_zh_tw',
    'canonical_tw_name':'name_zh_tw',
    'fallback':'name',
    'locale':'zh-TW',
    'source_version':'TWMS/256'
}
dump(manifest_path,manifest)
name_index={'schema_version':1,'locale':'zh-TW','preferred_field':'display_name_zh_tw','records':[
    {'key':f"{a['type']}/{a['id']}/{a['version']['region']}-{a['version']['version']}",
     'type':a['type'],'id':a['id'],'version':a['version'],
     'name_zh_tw':a['name_zh_tw'],'display_name_zh_tw':a['display_name_zh_tw'],
     'variant_label_zh_tw':a.get('variant_label_zh_tw'),
     'status':a['name_zh_tw_status'],'github_path':a['github_path']}
    for a in manifest['assets']
]}
dump(OUT/'name-index.zh-TW.json',name_index)
print('synchronized',len(manifest['assets']),'records; unresolved 0')
