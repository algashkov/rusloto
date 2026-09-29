#!/usr/bin/env python3
"""Генерирует логотип и иллюстрации для РусЛото через OpenAI Images API.

Ключ берётся из OPENAI_API_KEY или из файла .env в корне проекта.
Уже существующие картинки пропускаются (удалите файл, чтобы перегенерировать).

  python3 tools/generate_images.py            # всё
  python3 tools/generate_images.py logo kot   # только выбранные
  IMAGE_MODEL=gpt-image-1 python3 tools/generate_images.py
"""
import base64, json, os, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'img'
MODELS = [os.environ.get('IMAGE_MODEL', 'gpt-image-1.5'), 'gpt-image-1']

STYLE = ('Cute cartoon illustration for a children\'s game, bright cheerful saturated colors, '
         'soft thick dark outlines, glossy 3D-ish shading, friendly and funny, single subject centered, '
         'isolated on a fully transparent background, no text, no letters, no shadows on the ground.')

OBJECTS = {
    # анаграммы
    'stuk': 'a cartoon fist knocking on a wooden door with little motion lines',
    'kust': 'a round lush green bush',
    'pion': 'a pink peony flower with leaves',
    'poni': 'a cute smiling pony with a rainbow mane',
    'sort': 'three apples: red, yellow and green, different varieties',
    'rost': 'a smiling kid standing next to a height measuring ruler',
    'akter': 'a theatre actor holding comedy and tragedy masks',
    'terka': 'a metal kitchen cheese grater with a red handle',
    'oplata': 'a red coin purse with a stack of gold coins',
    'lopata': 'a garden shovel with a red handle',
    # шарады
    'stul': 'a wooden chair', 'stol': 'a wooden dining table', 'stolb': 'a striped road pole with a road sign',
    'dver': 'a friendly wooden front door', 'zver': 'a funny roaring tiger cub',
    'rak': 'a red crayfish walking backwards', 'mak': 'a sweet bun sprinkled with poppy seeds',
    'krug': 'a big bright circle ring', 'drug': 'two happy kids hugging as best friends',
    # ребусы и ответы
    'vesna': 'spring flowers: tulips and snowdrops with a butterfly',
    'semya': 'a happy family: grandpa, grandma, mom, dad and a child',
    'tykva': 'a big orange pumpkin', 'vorona': 'a funny black crow', 'izyum': 'a small bowl of raisins',
    'moroz': 'a snowflake and frosty ice crystals', 'morkov': 'a bright orange carrot with green leaves',
    'tuchi': 'three blue rain clouds with falling rain drops', 'uchitel': 'a kind smiling teacher woman with a pointer and a book',
    'molotok': 'a hammer with a wooden handle', 'kot': 'a fluffy tabby cat with its tail up',
    'moloko': 'a glass bottle of milk and a glass of milk', 'venik': 'a traditional straw broom',
    'uchenik': 'a happy school pupil with a backpack',
    # пословица-ребус
    'dom': 'a small cozy house with a red roof', 'el': 'a green fir tree', 'lozhka': 'a black kitchen spoon',
    'ochki': 'black eyeglasses', 'mukha': 'a funny fly insect', 'ananas': 'a pineapple', 'syr': 'a wedge of cheese with holes',
    'tort': 'a birthday cake with candles', 'enot': 'a cute raccoon', 'ryba': 'a colorful tropical fish',
    'apelsin': 'an orange fruit with a slice', 'babochka': 'a blue butterfly', 'okno': 'a window with curtains',
    'igla': 'a sewing needle with green thread', 'telefon': 'a red retro rotary telephone', 'sobaka': 'a cute white puppy dog',
    'yabloko': 'a green apple',
    # прочее
    'zayac': 'a grey hare eating a carrot', 'pol': 'a wooden parquet floor with a mop', 'nozhnicy': 'scissors cutting fabric with a measuring tape',
    'kolobok': 'Kolobok, a round smiling yellow bun character from a Russian fairy tale', 'obezyana': 'a monkey hanging on a vine',
    'druzya': 'a group of happy diverse friends waving', 'vorobi': 'a small flock of cute sparrows', 'lampa': 'a glowing light bulb with a book',
    'nos': 'a funny cartoon boy face in profile with a big nose', 'gulyat': 'a kid happily walking with colorful balloons',
}

LOGO = ('A bright, fun, glossy 3D logo for a children\'s educational game. The logo text is exactly "РусЛото" '
        'written in Russian Cyrillic in TWO lines: first line "Рус", second line "Лото". Chunky bubbly rounded letters, '
        'each letter a different candy color (red, orange, yellow, green, blue, purple), thick white outline and a dark '
        'purple 3D extrusion. Next to the text a small wooden lotto barrel (keg) with the number 40. Playful sparkles. '
        'Spelling must be exactly Рус and Лото. Transparent background.')


BARREL = ('A single glossy cartoon wooden lotto barrel (small keg) standing upright, straight front view, perfectly symmetric, '
          'same candy 3D mobile-game style as a bubbly logo: warm caramel wood with glossy highlights, two dark brown metal hoops, '
          'thick dark purple outline. In the exact center of the barrel front there is a large empty glossy candy-red round badge '
          'with a thin white rim, completely blank, NO number, NO text. Barrel fills most of the image. Transparent background.')


def load_key():
    key = os.environ.get('OPENAI_API_KEY')
    env = ROOT / '.env'
    if not key and env.exists():
        for line in env.read_text().splitlines():
            if line.startswith('OPENAI_API_KEY='):
                key = line.split('=', 1)[1].strip()
    if not key:
        sys.exit('Нет OPENAI_API_KEY (ни в окружении, ни в .env)')
    return key


def generate(key, name, prompt, size='1024x1024'):
    out = IMG / f'{name}.webp'
    if out.exists():
        return name, 'skip'
    last = None
    for model in dict.fromkeys(MODELS):
        body = json.dumps({'model': model, 'prompt': prompt, 'size': size, 'quality': 'medium',
                           'background': 'transparent', 'output_format': 'webp', 'output_compression': 75, 'n': 1})
        req = urllib.request.Request('https://api.openai.com/v1/images/generations', body.encode(),
                                     {'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.load(r)
            out.write_bytes(base64.b64decode(data['data'][0]['b64_json']))
            return name, f'ok ({model})'
        except urllib.error.HTTPError as e:
            last = f'{e.code} {e.read().decode()[:300]}'
            if e.code not in (400, 404):  # модель недоступна → пробуем следующую
                break
        except Exception as e:
            last = str(e)
            break
    return name, f'ERROR {last}'


def write_manifest():
    files = sorted(p.stem for p in IMG.glob('*.webp'))
    mapping = {k: f'img/{k}.webp' for k in files}
    (ROOT / 'js' / 'images.js').write_text(
        '// Генерируется скриптом tools/generate_images.py. Пусто — значит используются эмодзи.\n'
        f'window.GEN_IMAGES = {json.dumps(mapping, ensure_ascii=False, indent=1)};\n')
    print(f'images.js: {len(files)} картинок')


def main():
    IMG.mkdir(exist_ok=True)
    key = load_key()
    jobs = {'logo': (LOGO, '1536x1024'), 'barrel': (BARREL, '1024x1024'), **{k: (f'{v}. {STYLE}', '1024x1024') for k, v in OBJECTS.items()}}
    wanted = sys.argv[1:] or list(jobs)
    with ThreadPoolExecutor(6) as ex:
        for name, status in ex.map(lambda n: generate(key, n, *jobs[n]), wanted):
            print(f'{name:10} {status}', flush=True)
    write_manifest()


if __name__ == '__main__':
    main()
