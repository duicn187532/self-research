"""Build website sprite strips from verified collection records without changing lesson content."""
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
COL=ROOT/'assets/maple/collection'
OUT=ROOT/'assets/maple'
SELECTION={
 'mob-clockwork-panda':('mobs','3210203','發條貓熊',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-toy-duck':('mobs','3210204','玩具鴨',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-jr-cellion':('mobs','3210200','幼紅獨角獅',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-jr-yeti':('mobs','5100000','小雪球',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-beetle':('mobs','7130002','橡木甲蟲',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-rash':('mobs','7130500','萊西',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'boss-damien':('bosses','8880100','戴米安（第一階段）',{'stand':'stand'}),
 'npc-toy-soldier':('npc','2040001','玩具士兵-迪布',{'stand':'stand','say':'smile'}),
 'npc-kriel':('npc','2012011','妖精 克莉爾',{'stand':'stand','say':'say'}),
 'npc-roben':('npc','2020000','伯堅',{'stand':'stand','say':'say0'}),
 'npc-tatamo':('npc','2081000','村長塔塔曼',{'stand':'stand','say':'say'}),
 'npc-lucid':('npc','3003200','露希妲',{'stand':'stand','say':'say'}),
 'npc-cleaner':('npc','3003249','淨化者',{'stand':'stand','say':'move'}),
}

manifest=json.loads((COL/'manifest.json').read_text(encoding='utf-8'))
assets={(a['type'],a['id']):a for a in manifest['assets']}
table_path=OUT/'sprites.js'
prefix='window.MAPLE_SPRITES = '
raw=table_path.read_text(encoding='utf-8').strip()
start=raw.index(prefix)+len(prefix)
table=json.loads(raw[start:].rstrip(';'))
for obsolete in ('boss-lucid','boss-will'):
    table.pop(obsolete,None)

def strip(asset, action_name, target):
    action=next(a for a in asset['actions'] if a['name']==action_name)
    frames=[]
    for frame in sorted(action['frames'],key=lambda f:f['index']):
        im=Image.open(ROOT/frame['github_path']).convert('RGBA')
        origin=frame.get('origin') or {'x':im.width//2,'y':im.height}
        frames.append((im,origin))
    left=min(-o['x'] for _,o in frames); top=min(-o['y'] for _,o in frames)
    right=max(im.width-o['x'] for im,o in frames); bottom=max(im.height-o['y'] for im,o in frames)
    width=max(1,right-left); height=max(1,bottom-top)
    sheet=Image.new('RGBA',(width*len(frames),height))
    for i,(im,o) in enumerate(frames):
        sheet.alpha_composite(im,(i*width-o['x']-left,-o['y']-top))
    sheet.save(target,optimize=True)
    return [width,height,len(frames)]

for key,(kind,ident,label,actions) in SELECTION.items():
    asset=assets[(kind,ident)]
    spec={'label':label,'kind':'boss' if kind=='bosses' else kind.rstrip('s'),'asset_id':ident,
          'name_zh_tw':asset['name_zh_tw'],'acts':{}}
    if spec['kind']=='npc':
        spec['role']=label
    for out_action,source_action in actions.items():
        path=OUT/f'spr-{key}-{out_action}.png'
        spec['acts'][out_action]=strip(asset,source_action,path)
    table[key]=spec

# Correct legacy labels that were generic or missing; drop the unidentified screenshot.
table['npc-clerk']['role']='彼特'
table['npc-girl']['role']='內拉'
table.pop('npc-chief',None)
for key,label in {
    'hero-1':'夜光','hero-2':'幻影俠盜','hero-3':'狂狼勇士','hero-4':'精靈遊俠',
    'hero-5':'隱月','hero-6':'龍魔導士','hero-7':'凱內西斯'
}.items():
    table[key]['label']=label

table_path.write_text(prefix+json.dumps(table,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('built',len(SELECTION),'collection sprites; table entries',len(table))
