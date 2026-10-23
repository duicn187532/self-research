"""Build website sprite strips from verified collection records without changing lesson content."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
COL=ROOT/'assets/maple/collection'
OUT=ROOT/'assets/maple'
SELECTION={
 'mob-baby-snail':('mobs','100100','嫩寶',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-dark-wooden-mask':('mobs','1110101','黑木妖',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-octopus':('mobs','1120100','三眼章魚',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-fire-boar':('mobs','3210100','火肥肥',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-monkey':('mobs','3210800','猴子',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-stone-golem':('mobs','5130101','石巨人',{'stand':'stand','move':'move','hit':'hit1','die':'die1','skill':'skill1'}),
 'mob-jr-cellion-blue':('mobs','3210202','幼藍獨角獅',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-clockwork-rat':('mobs','3210205','黑色發條鼠',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-clockwork-fighter':('mobs','3210206','黃色戰鬥機',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-haunted-clock-bear':('mobs','7130010','怨靈發條熊',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1'}),
 'mob-hellhound':('mobs','7130001','地獄獵犬',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1'}),
 'mob-metal-beetle':('mobs','7130003','金屬甲蟲',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1','skill':'skill1'}),
 'mob-dark-rash':('mobs','7130501','黑暗萊西',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1'}),
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
 'npc-lina':('npc','1010100','麗娜',{'stand':'stand','say':'smile'}),
 'npc-elder-stan':('npc','1012003','長老斯坦',{'stand':'stand','say':'swing'}),
 'npc-conductor':('npc','2040000','車掌',{'stand':'stand','say':'talk'}),
 'npc-shaolan':('npc','3003201','防毒面具',{'stand':'stand'}),
 'npc-knight-mihile':('npc','1101003','米哈逸',{'stand':'stand','say':'say'}),
 'npc-knight-oz':('npc','1101004','奧茲',{'stand':'stand','say':'say'}),
 'npc-knight-irena':('npc','1101005','伊麗娜',{'stand':'stand','say':'say'}),
 'npc-knight-eckhart':('npc','1101006','伊卡勒特',{'stand':'stand','say':'say'}),
 'npc-knight-hawkeye':('npc','1101007','鷹眼',{'stand':'stand','say':'say'}),
}

manifest=json.loads((COL/'manifest.json').read_text(encoding='utf-8'))
assets={(a['type'],a['id']):a for a in manifest['assets']}
ASSET_TYPE={'mob':'mobs','npc':'npc','boss':'bosses'}
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
    asset=assets[(ASSET_TYPE.get(kind,kind),ident)]
    spec={'label':label,'kind':{'mobs':'mob','bosses':'boss'}.get(kind,kind),'asset_id':ident,
          'name_zh_tw':asset['name_zh_tw'],'acts':{}}
    if spec['kind']=='npc':
        spec['role']=label
    for out_action,source_action in actions.items():
        path=OUT/f'spr-{key}-{out_action}.png'
        spec['acts'][out_action]=strip(asset,source_action,path)
    if spec['kind']=='npc' and 'say' not in spec['acts']:
        say_action=next((a for a in ('say','talk','smile','wink','heart','swing','magic','bow','hand','sword','cough','move') if any(x['name']==a for x in asset['actions'])),None)
        if say_action: spec['acts']['say']=strip(asset,say_action,OUT/f'spr-{key}-say.png')
    table[key]=spec

# Add versioned modern boss phases; these downloaded IDs are distinct and have complete combat actions.
for key, ident, label, actions in (
 ('boss-lucid','8880150','露希妲',{'stand':'fly','move':'fly','hit':'hit1','die':'die1','attack':'skill1','skill':'skill3'}),
 ('boss-will','8880301','威爾',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1','skill':'skill3'}),
):
    asset=assets[('bosses',ident)]
    spec={'label':label,'kind':'boss','asset_id':ident,'name_zh_tw':asset['name_zh_tw'],'acts':{}}
    for out_action,source_action in actions.items():
        spec['acts'][out_action]=strip(asset,source_action,OUT/f'spr-{key}-{out_action}.png')
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

# The exact scenes already collected from the TWMS map index; rendered as distinct, responsive backdrops.
table['scenes']={
 'ludibrium':{'label':'玩具城','asset_id':'220000000','path':'collection/maps/ludibrium/220000000/TWMS-256/composite.png'},
 'clocktower':{'label':'時間塔','asset_id':'220080000','path':'collection/maps/ludibrium/220080000/TWMS-256/composite.png'},
 'orbis':{'label':'天空之城','asset_id':'200000000','path':'collection/maps/orbis/200000000/TWMS-256/composite.png'},
 'el-nath':{'label':'冰原雪域','asset_id':'211000000','path':'collection/maps/el-nath/211000000/TWMS-256/composite.png'},
 'leafre':{'label':'神木村','asset_id':'240000000','path':'collection/maps/leafre/240000000/TWMS-256/composite.png'},
 'lachelein':{'label':'拉契爾恩','asset_id':'450003000','path':'collection/maps/lachelein/450003000/TWMS-256/composite.png'}
}

for key,scene in table['scenes'].items():
    source=OUT/scene['path']
    with Image.open(source) as im:
        im=ImageOps.fit(im.convert('RGB'),(1600,760),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
        im.save(OUT/f'scene-{key}.jpg',quality=78,optimize=True,progressive=True)
        im.resize((768,365),Image.Resampling.LANCZOS).save(OUT/f'scene-{key}-sm.jpg',quality=72,optimize=True,progressive=True)
table_path.write_text(prefix+json.dumps(table,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('built',len(SELECTION),'collection sprites; table entries',len(table))



