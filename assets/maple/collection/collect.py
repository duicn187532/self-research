"""Collect versioned MapleStory.io PNG exports. Requires Pillow; run from any cwd.

No blanket art license is asserted. Publication requires the repository owner's
explicit decision; see RIGHTS.md. Existing assets are never overwritten.
"""
import argparse
import hashlib
import io
import json
import re
import time
import urllib.request
import urllib.error
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
BASE = 'https://maplestory.io/api'
VERSION = '83'
DATE = '2026-10-23'

def fetch(url):
    cache_dir = OUT / '.download-cache'
    cache_path = cache_dir / hashlib.sha256(url.encode()).hexdigest()
    if cache_path.exists():
        return cache_path.read_bytes()
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'MapleCollectionResearch/1.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read()
                cache_dir.mkdir(exist_ok=True)
                cache_path.write_bytes(data)
                return data
        except Exception as error:
            if isinstance(error, urllib.error.HTTPError) and error.code in (400,401,403,404):
                raise
            if attempt == 1:
                raise
            time.sleep(attempt + 1)

def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def prepare(spec):
    kind, ident, region, town, zh = spec
    api_kind = 'npc' if kind == 'npc' else 'mob'
    package = 'Npc' if kind == 'npc' else 'Mob'
    wz_id = str(ident).zfill(7)
    url = f'{BASE}/GMS/{VERSION}/{api_kind}/{ident}'
    export_url = f'{BASE}/wz/export/GMS/{VERSION}/{package}/{wz_id}.img'
    entry = {'id': str(ident), 'type': kind, 'region': region, 'town': town,
             'region_status': 'curated_target_not_exclusive_spawn_location',
             'name_zh_tw': zh, 'name_zh_tw_status': 'unverified_translation' if zh else 'unavailable',
             'source_url': url, 'export_url': export_url,
             'wz_path': f'{package}.wz/{wz_id}.img', 'version': {'region': 'GMS', 'version': VERSION},
             'license': {'status': 'redistribution_permission_unconfirmed', 'rights_holder': 'Nexon',
                         'evidence_url': 'https://maplestory.io/', 'publication_basis': 'owner_explicit_instruction_2026-10-23_not_a_copyright_license'},
             'actions': [], 'acquired_on': DATE}
    try:
        meta_bytes = fetch(url)
        meta = json.loads(meta_bytes)
        assert int(meta['id']) == ident
        entry.update(name=meta.get('name'), role=meta.get('function'), is_shop=meta.get('isShop'),
                     source_locations=meta.get('foundAt', []), expected_actions=meta.get('framebooks', {}),
                     source_metadata_sha256=hashlib.sha256(meta_bytes).hexdigest())
        if kind == 'mobs' and meta.get('meta', {}).get('isBoss'):
            raise ValueError('Boss flag conflicts with ordinary monster classification')
        archive = fetch(export_url)
        entry['source_archive_sha256'] = hashlib.sha256(archive).hexdigest()
        frames = []
        with zipfile.ZipFile(io.BytesIO(archive)) as z:
            for item in z.infolist():
                if not item.filename.lower().endswith('.png'):
                    continue
                # Export API uses '-' to join the WZ node path.
                match = re.fullmatch(rf'{package}-{wz_id}\.img-([A-Za-z0-9_-]+)-(\d+)\.png', item.filename)
                if not match:
                    entry.setdefault('unmapped_export_nodes', []).append(item.filename)
                    continue
                action_path = match[1].replace('-', '/')
                data = z.read(item)
                with Image.open(io.BytesIO(data)) as im:
                    im.verify()
                with Image.open(io.BytesIO(data)) as im:
                    im.load()
                    assert im.format == 'PNG'
                    rgba = im.convert('RGBA')
                    alpha = rgba.getchannel('A').getextrema()
                    frame = {'index': int(match[2]), 'width': im.width, 'height': im.height,
                             'mode': im.mode, 'has_transparency': alpha[0] < 255,
                             'sha256': hashlib.sha256(data).hexdigest(),
                             'pixel_sha256': hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest(),
                             'wz_path': f'{package}.wz/{wz_id}.img/{action_path}/{match[2]}',
                             'duration_ms': None, 'origin': None, 'decode': 'pass'}
                frames.append((action_path, frame, data))
        present={(action,frame['index']) for action,frame,_ in frames}
        for action,count in entry['expected_actions'].items():
            if not re.fullmatch(r'[A-Za-z0-9_]+',action):
                continue
            if not count:
                continue
            try:
                node_url=f'{BASE}/wz/GMS/{VERSION}/{package}/{wz_id}.img/{action}'
                node=json.loads(fetch(node_url))
                indices=sorted(int(x) for x in node['children'] if str(x).isdigit())
                entry.setdefault('source_frame_indices',{})[action]=indices
            except Exception as error:
                entry.setdefault('index_lookup_errors',{})[action]=str(error)
                continue
            failures = 0
            for ordinal,index in enumerate(indices):
                if (action,index) in present:
                    continue
                # Export omits UOL aliases; the frame renderer resolves those nodes.
                render_url=f'{url}/render/{action}/{ordinal}'
                try:
                    data=fetch(render_url)
                    with Image.open(io.BytesIO(data)) as im:
                        im.verify()
                    with Image.open(io.BytesIO(data)) as im:
                        im.load()
                        assert im.format=='PNG'
                        rgba=im.convert('RGBA')
                        frame={'index':index,'width':im.width,'height':im.height,'mode':im.mode,
                            'has_transparency':rgba.getchannel('A').getextrema()[0]<255,
                            'sha256':hashlib.sha256(data).hexdigest(),
                            'pixel_sha256':hashlib.sha256(str(im.size).encode()+rgba.tobytes()).hexdigest(),
                            'wz_path':f'{package}.wz/{wz_id}.img/{action}/{index}',
                            'duration_ms':None,'origin':None,'decode':'pass',
                            'source_url':render_url,'retrieval':'resolved_frame_renderer'}
                    frames.append((action,frame,data))
                except Exception as error:
                    entry.setdefault('missing_frames',[]).append({'action':action,'index':index,'error':str(error)})
                    failures += 1
                    if failures >= 2:
                        entry.setdefault('incomplete_actions',[]).append(action)
                        break
        if not frames:
            raise ValueError('No decodable PNG frames in export or frame renderer')
        return entry, frames, None
    except Exception as error:
        return entry, [], str(error)

def collect(plan):
    manifest_path = OUT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {
        'schema_version': 1, 'created_on': DATE, 'assets': [],
        'counting_policy': 'Unique type/ID/version records; actions and frame aliases are not entities. IDs may still represent alternate costumes; species/character totals require identity review.',
        'license_warning': 'Original Nexon artwork; no public redistribution permission confirmed. See RIGHTS.md.'}
    known = {(a['type'], a['id'], a['version']['version']) for a in manifest['assets']}
    plan = [x for x in plan if (x[0], str(x[1]), VERSION) not in known]
    hashes = {}
    for p in sorted((ROOT / 'assets/maple').rglob('*.png')):
        hashes.setdefault(hashlib.sha256(p.read_bytes()).hexdigest(), p.relative_to(ROOT).as_posix())
    candidates_path = OUT / 'candidates.json'
    candidates = json.loads(candidates_path.read_text(encoding='utf-8')) if candidates_path.exists() else {'assets': []}
    with ThreadPoolExecutor(max_workers=4) as pool:
        for entry, frames, error in pool.map(prepare, plan):
            if error:
                entry.update(status='download_failed', reason=error)
                candidates['assets'].append(entry)
                print('FAILED', entry['type'], entry['id'], error, flush=True)
                dump(candidates_path, candidates)
                continue
            folder = OUT / entry['type'] / entry['region'] / entry['id'] / 'GMS-83'
            actions = {}
            for action, frame, data in sorted(frames, key=lambda x: (x[0], x[1]['index'])):
                digest = frame['sha256']
                if digest in hashes:
                    frame['github_path'] = hashes[digest]
                    frame['storage'] = 'sha256_reference'
                else:
                    target = folder / action / f"{frame['index']:04d}.png"
                    target.parent.mkdir(parents=True, exist_ok=True)
                    if target.exists():
                        assert target.read_bytes() == data, 'Refusing to overwrite different image'
                    else:
                        target.write_bytes(data)
                    frame['github_path'] = target.relative_to(ROOT).as_posix()
                    frame['storage'] = 'original_png'
                    hashes[digest] = frame['github_path']
                actions.setdefault(action, []).append(frame)
            for action, values in actions.items():
                expected = entry['expected_actions'].get(action)
                entry['actions'].append({'name': action, 'frame_count': len(values),
                    'expected_frame_count': expected, 'frames': values,
                    'count_matches_api': expected == len(values),
                    'indices_contiguous': [v['index'] for v in values] == list(range(len(values)))})
            complete = bool(entry['expected_actions']) and all(
                count == 0 or (name in actions and len(actions[name]) == count and
                [f['index'] for f in actions[name]] == entry.get('source_frame_indices',{}).get(name,list(range(count))))
                for name, count in entry['expected_actions'].items())
            entry['validation'] = {'decode': 'pass', 'sha256': 'pass',
                'all_api_listed_action_frames_present': complete,
                'timing_and_origin': 'not_retrieved', 'visual_playback': 'not_verified',
                'original_wz_binary_compared': False}
            entry['github_path'] = folder.relative_to(ROOT).as_posix()
            entry['status'] = 'collected' if complete else 'partial'
            dump(folder / 'asset.json', entry)
            manifest['assets'].append(entry)
            dump(manifest_path, manifest)
            print(entry['type'], entry['id'], entry['name'], len(frames), entry['status'], flush=True)
    dump(candidates_path, candidates)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('plan', type=Path)
    parser.add_argument('--acknowledge-unconfirmed-rights', action='store_true', required=True)
    args = parser.parse_args()
    collect(json.loads(args.plan.read_text(encoding='utf-8')))
