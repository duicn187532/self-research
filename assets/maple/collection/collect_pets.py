"""Collect selected TWMS pet frames, names, and timing from the versioned pet API."""
import argparse
import base64
import hashlib
import io
import json
import urllib.request
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'pets'
PETS = (5000001, 5000002, 5000004, 5000008, 5000020, 5000023)
SOURCE = 'https://maplestory.io/api/TWMS/256/pet/'


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def collect(ident):
    url = SOURCE + str(ident)
    request = urllib.request.Request(url, headers={'User-Agent': 'MapleCollectionResearch/1.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        raw_metadata = response.read()
    metadata = json.loads(raw_metadata)
    if metadata['id'] != ident or metadata['description']['id'] != ident:
        raise ValueError(f'pet ID mismatch: {ident}')
    folder = OUT / str(ident) / 'TWMS-256'
    actions = []
    for source_action, output_action in (('stand0', 'stand'), ('move', 'move')):
        books = metadata['frameBooks'].get(source_action, [])
        if len(books) != 1 or not books[0].get('frames'):
            raise ValueError(f'{ident} has no single {source_action} framebook')
        frames = []
        for index, frame in enumerate(books[0]['frames']):
            data = base64.b64decode(frame['image'], validate=True)
            with Image.open(io.BytesIO(data)) as image:
                image.load()
                if image.format != 'PNG':
                    raise ValueError(f'{ident}/{source_action}/{index} is not PNG')
                width, height = image.size
            origin = frame['origin']
            if not isinstance(origin.get('x'), int) or not isinstance(origin.get('y'), int):
                raise ValueError(f'{ident}/{source_action}/{index} has no origin')
            target = folder / source_action / f'{index:04d}.png'
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            frames.append({
                'index': index, 'width': width, 'height': height,
                'duration_ms': frame.get('delay'),
                'origin': {'x': origin['x'], 'y': origin['y']},
                'sha256': hashlib.sha256(data).hexdigest(),
                'github_path': target.relative_to(ROOT).as_posix()
            })
        actions.append({'name': output_action, 'source_action': source_action, 'frames': frames})
    asset = {
        'type': 'pets', 'id': str(ident), 'name_zh_tw': metadata['description']['name'],
        'name_zh_tw_status': 'source_twms', 'version': {'region': 'TWMS', 'version': '256'},
        'source_url': url, 'source_response_sha256': hashlib.sha256(raw_metadata).hexdigest(),
        'wz_path': f'Pet.wz/{ident}.img', 'acquired_on': date.today().isoformat(),
        'license': {'status': 'redistribution_permission_unconfirmed', 'rights_holder': 'Nexon',
                    'publication_basis': 'owner_explicit_instruction_2026-10-23_not_a_copyright_license'},
        'actions': actions
    }
    save_json(folder / 'asset.json', asset)
    return asset


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--acknowledge-unconfirmed-rights', action='store_true')
    args = parser.parse_args()
    if not args.acknowledge_unconfirmed_rights:
        parser.error('Read RIGHTS.md and acknowledge the unconfirmed redistribution rights')
    assets = [collect(ident) for ident in PETS]
    save_json(OUT / 'manifest.json', {'schema_version': 1, 'assets': assets})
    print('collected', len(assets), 'TWMS pet kinds')


if __name__ == '__main__':
    main()
