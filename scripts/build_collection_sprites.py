"""Build website sprite strips from verified collection records without changing lesson content."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
COL=ROOT/'assets/maple/collection'
OUT=ROOT/'assets/maple'
SELECTION={
 'hero-7':('npc','9400804','凱內西斯',{'stand':'stand'}),
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
 'mob-fat-pig':('mobs','1210100','肥肥',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-ribbon-pig':('mobs','1210101','緞帶肥肥',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-blue-mushroom':('mobs','2220100','藍菇菇',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-green-slime':('mobs','210100','綠水靈',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-spiked-mushroom':('mobs','2110200','刺菇菇',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-fireboar-eye':('mobs','2230100','火獨眼獸',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-zombie-mushroom':('mobs','2230101','殭屍菇菇',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-black-pig':('mobs','2230102','黑肥肥',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-little-ghost':('mobs','3230101','小幽靈',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-crocodile':('mobs','3110100','鱷魚',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-angel-monkey':('mobs','4230101','天使猴',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1'}),
 'mob-black-crystal-golem':('mobs','5130102','黑曜石巨人',{'stand':'stand','move':'move','hit':'hit1','die':'die1','skill':'skill1'}),
 'mob-mixed-golem':('mobs','5150000','混種石巨人',{'stand':'stand','move':'move','hit':'hit1','die':'die1','skill':'skill1'}),
 'mob-fire-spirit':('mobs','5100002','火精靈',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1','skill':'skill1'}),
 'mob-clockwork-bear-captain':('mobs','7130300','怨靈發條熊隊長',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1'}),
 'mob-young-yellow-cellion':('mobs','3210201','幼黃獨角獅',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-dream-cleaner':('mobs','8643000','淨化者',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-paper-bag-resident':('mobs','8643001','紙袋後街居民',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-calina':('mobs','8643003','卡利納',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'mob-angry-ballgoer':('mobs','8643008','生氣的舞會居民',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'boss-stumpy':('bosses','3220000','樹妖王',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'boss-mushmom':('bosses','6130101','蘑菇王',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'boss-king-slime':('bosses','9300003','超級綠水靈',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'boss-papulatus':('bosses','8500002','拉圖斯',{'stand':'stand','move':'fly','hit':'hit1','die':'die1'}),
 'boss-eliza':('bosses','8220000','艾利傑',{'stand':'stand','move':'move','hit':'hit1','die':'die1'}),
 'npc-robin':('npc','2003','羅賓',{'stand':'stand'}),
 'npc-mai':('npc','12100','麥加',{'stand':'stand'}),
 'npc-pio':('npc','10000','皮奧',{'stand':'stand'}),
 'npc-roger':('npc','2000','羅傑',{'stand':'stand'}),
 'npc-john':('npc','20000','約翰',{'stand':'stand'}),
 'npc-al':('npc','1002103','領袖阿爾',{'stand':'stand'}),
 'npc-tru':('npc','1002104','特魯',{'stand':'stand'}),
 'npc-hines':('npc','1032001','漢斯',{'stand':'stand'}),
 'npc-dances-with-balrog':('npc','1022000','武術教練',{'stand':'stand'}),
 'npc-mcgigis':('npc','1022002','麥吉',{'stand':'stand'}),
 'npc-dark-lord':('npc','1052001','達克魯',{'stand':'stand'}),
 'npc-kyrin':('npc','1090000','卡伊琳',{'stand':'stand'}),
 'npc-icarus':('npc','1052106','伊卡路斯',{'stand':'stand'}),
 'npc-bartos':('npc','1012006','寵物訓練師巴特斯',{'stand':'stand'}),
 'npc-tobo':('npc','1092000','湯寶寶',{'stand':'stand'}),
 'npc-marcel':('npc','2041004','馬賽爾',{'stand':'stand','say':'say'}),
 'npc-gas-mask':('npc','3003202','防毒面具',{'stand':'stand'}),
 'npc-ticket-agent':('npc','1032007','售票員',{'stand':'stand'}),
 'npc-winston':('npc','1022006','溫斯頓',{'stand':'stand'}),
 'npc-elder-aron':('npc','1012001','差不多院長',{'stand':'stand'}),
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
for obsolete in ('boss-lucid','boss-will','npc-lucas','npc-cleaner','mob-orange-mushroom','mob-green-shroom'):
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
    spec={'label':label,'kind':'hero' if key=='hero-7' else {'mobs':'mob','bosses':'boss'}.get(kind,kind),'asset_id':ident,
          'name_zh_tw':asset['name_zh_tw'],'wz_path':asset.get('wz_path'),'source_url':asset.get('source_url'),
          'version':asset.get('version'),'acts':{}}
    if key.startswith(('npc-robin','npc-lucas','npc-mai','npc-pio','npc-roger','npc-john','npc-al','npc-tru','npc-hines','npc-dances-with-balrog','npc-mcgigis','npc-dark-lord','npc-kyrin','npc-icarus','npc-bartos','npc-tobo','npc-ticket-agent','npc-winston','npc-elder-aron')):
        spec['featured']=True
    if spec['kind']=='npc':
        spec['role']=label
    for out_action,source_action in actions.items():
        path=OUT/f'spr-{key}-{out_action}.png'
        spec['acts'][out_action]=strip(asset,source_action,path)
    if spec['kind']=='npc' and 'say' not in spec['acts']:
        say_action=next((a for a in ('say','talk','smile','wink','heart','swing','magic','bow','hand','sword','cough','move') if any(x['name']==a for x in asset['actions'])),None)
        if say_action: spec['acts']['say']=strip(asset,say_action,OUT/f'spr-{key}-say.png')
    table[key]=spec

pet_manifest=json.loads((COL/'pets'/'manifest.json').read_text(encoding='utf-8'))
pet_assets={a['id']:a for a in pet_manifest['assets']}
for key,ident in (
    ('pet-puppy','5000001'),('pet-pink-bunny','5000002'),
    ('pet-black-kitty','5000004'),('pet-panda','5000008'),
    ('pet-yeti','5000020'),('pet-penguin','5000023'),
):
    asset=pet_assets[ident]
    table[key]={'label':asset['name_zh_tw'],'kind':'pet','asset_id':ident,
                'name_zh_tw':asset['name_zh_tw'],'source_url':asset['source_url'],
                'version':asset['version'],'acts':{
                    action:strip(asset,action,OUT/f'spr-{key}-{action}.png')
                    for action in ('stand','move')
                }}
table['pet-husky']['label']='哈士奇'
table['pet-dino']['label']='迪諾龍'

# Preserve the pre-existing strip key; the separately versioned classic Pig is `mob-fat-pig`.
table['mob-pig']={'label':'緞帶肥肥','kind':'mob','acts':{'stand':[69,49,3],'move':[67,50,3],'hit':[60,54,1],'die':[69,56,3]}}

# Add versioned modern boss phases; these downloaded IDs are distinct and have complete combat actions.
for key, ident, label, actions in (
 ('boss-lucid','8880150','露希妲',{'stand':'fly','move':'fly','hit':'hit1','die':'die1','attack':'skill1','skill':'skill3'}),
 ('boss-lucid-phase2','8880151','露希妲（第二階段）',{'stand':'fly','hit':'hit1','die':'die1','attack':'skill1','skill':'skill3'}),
 ('boss-will','8880301','威爾',{'stand':'stand','move':'move','hit':'hit1','die':'die1','attack':'attack1','skill':'skill3'}),
):
    asset=assets[('bosses',ident)]
    spec={'label':label,'kind':'boss','asset_id':ident,'name_zh_tw':asset['name_zh_tw'],
          'wz_path':asset.get('wz_path'),'source_url':asset.get('source_url'),'version':asset.get('version'),'acts':{}}
    for out_action,source_action in actions.items():
        spec['acts'][out_action]=strip(asset,source_action,OUT/f'spr-{key}-{out_action}.png')
    table[key]=spec

# Correct legacy labels that were generic or missing; drop the unidentified screenshot.
table['npc-clerk']['role']='彼特'
table['npc-girl']['role']='內拉'
table.pop('npc-chief',None)
for key in ('npc-bowman','npc-wizard','npc-strategist','npc-knight','npc-flame','npc-wind','npc-night','npc-thunder','npc-lina','npc-elder-stan','npc-tatamo','npc-lucid','npc-girl'):
    if key in table: table[key]['featured']=True
for key,label in {
    'hero-1':'夜光','hero-2':'幻影俠盜','hero-3':'狂狼勇士','hero-4':'精靈遊俠',
    'hero-5':'隱月','hero-6':'龍魔導士','hero-7':'凱內西斯'
}.items():
    table[key]['label']=label

# The exact scenes already collected from the TWMS map index; rendered as distinct, responsive backdrops.
table['scenes']={
 'henesys':{'label':'弓箭手村','asset_id':'100000000','path':'collection/maps/victoria/100000000/TWMS-256/composite.png'},
 'ellinia-town':{'label':'魔法森林','asset_id':'101000000','path':'collection/maps/victoria/101000000/TWMS-256/composite.png'},
 'perion':{'label':'勇士之村','asset_id':'102000000','path':'collection/maps/victoria/102000000/TWMS-256/composite.png'},
 'kerning':{'label':'墮落城市','asset_id':'103000000','path':'collection/maps/victoria/103000000/TWMS-256/composite.png'},
 'lith-harbor':{'label':'維多利亞港','asset_id':'104000000','path':'collection/maps/victoria/104000000/TWMS-256/composite.png'},
 'sleepywood':{'label':'奇幻村','asset_id':'105000000','path':'collection/maps/victoria/105000000/TWMS-256/composite.png'},
 'nautilus':{'label':'鯨魚號','asset_id':'120000000','path':'collection/maps/victoria/120000000/TWMS-256/composite.png'},
 'edelstein':{'label':'埃德爾斯坦','asset_id':'310000000','path':'collection/maps/edelstein/310000000/TWMS-256/composite.png'},
 'mu-lung':{'label':'桃花仙境','asset_id':'250000000','path':'collection/maps/mu-lung/250000000/TWMS-256/composite.png'},
 'ariant':{'label':'納希綠洲城','asset_id':'260000000','path':'collection/maps/ariant/260000000/TWMS-256/composite.png'},
 'ludibrium':{'label':'玩具城','asset_id':'220000000','path':'collection/maps/ludibrium/220000000/TWMS-256/composite.png'},
 'clocktower':{'label':'時間塔','asset_id':'220080000','path':'collection/maps/ludibrium/220080000/TWMS-256/composite.png'},
 'orbis':{'label':'天空之城','asset_id':'200000000','path':'collection/maps/orbis/200000000/TWMS-256/composite.png'},
 'el-nath':{'label':'冰原雪域','asset_id':'211000000','path':'collection/maps/el-nath/211000000/TWMS-256/composite.png'},
 'leafre':{'label':'神木村','asset_id':'240000000','path':'collection/maps/leafre/240000000/TWMS-256/composite.png'},
 'lachelein':{'label':'拉契爾恩','asset_id':'450003000','path':'collection/maps/lachelein/450003000/TWMS-256/composite.png'}
}

def back_canvas(region, name, frame):
    folder=COL/'maps'/region/'shared-resource-sets'/'TWMS-256'/'back'
    manifest=folder/name/'resource-set.json' if name else folder/'resource-set.json'
    record=json.loads(manifest.read_text(encoding='utf-8'))
    match=next(row for row in record['canvases'] if row['source_archive_path'].endswith('.img-'+frame+'.png'))
    with Image.open(ROOT/match['github_path']) as source:
        return source.convert('RGBA')

def authentic_backdrop(key):
    # The map API's composite omits WZ Back layers. These are curated static
    # arrangements of the matching TWMS-256 canvases, not exact WZ parallax positions.
    specs={
      'henesys':('victoria','grassySoil_new','back-0', [('back-3',(100,115,1100,288)),('back-3',(920,175,850,222))]),
      'ellinia-town':('victoria','shineWood','back-0', [('back-4',(-100,-155,440,1117)),('back-1',(1240,-85,440,607))]),
      'perion':('victoria','dryRock','back-1', []),
      'kerning':('victoria','sunsetCity','back-0', []),
      'ludibrium':('ludibrium','toyCastle','back-1', [('back-6',(90,40,750,435)),('back-6',(960,100,690,400))]),
      'clocktower':('ludibrium','toyCastleDungeon','back-0', []),
      'orbis':('orbis','skyStation','back-1', [('back-4',(95,45,450,387)),('back-4',(1080,110,420,361)),('back-19',(785,35,440,712))]),
      'lachelein':('lachelein','','back-2', [('back-4',(0,0,1600,760))]),
    }
    if key not in specs: return None
    region,name,base,overlays=specs[key]
    sky=Image.new('RGBA',(1600,760),(139,202,240,255))
    sky.alpha_composite(back_canvas(region,name,base).resize((1600,760),Image.Resampling.BILINEAR))
    for frame,(x,y,w,h) in overlays:
        layer=back_canvas(region,name,frame).resize((w,h),Image.Resampling.LANCZOS)
        sky.paste(layer,(x,y),layer)
    return sky

for key,scene in table['scenes'].items():
    source=OUT/scene['path']
    with Image.open(source) as im:
        rgba=im.convert('RGBA')
        sky=authentic_backdrop(key)
        if sky is None:
            sky=Image.new('RGBA',rgba.size,(139,202,240,255))
            sky.alpha_composite(rgba)
            im=ImageOps.fit(sky.convert('RGB'),(1600,760),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
        else:
            foreground=ImageOps.fit(rgba,(1600,760),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
            sky.alpha_composite(foreground)
            im=sky.convert('RGB')
        im.save(OUT/f'scene-{key}.jpg',quality=78,optimize=True,progressive=True)
        im.resize((768,365),Image.Resampling.LANCZOS).save(OUT/f'scene-{key}-sm.jpg',quality=72,optimize=True,progressive=True)
table_path.write_text(prefix+json.dumps(table,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('built',len(SELECTION),'collection sprites; table entries',len(table))



