import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
theme = root / 'theme'
section = theme / 'sections/dolce-product.liquid'
text = section.read_text()
marker = '  {%- if product_story.settings.headline != blank -%}\n    {%- liquid'
if "render 'dolce-sales-story'" not in text:
    text = text.replace(marker, "  {% render 'dolce-sales-story', product: product, story: product_story, gallery: gallery_media %}\n" + marker, 1)
prefix, schema = text.split('{% schema %}', 1)
raw, suffix = schema.split('{% endschema %}', 1)
data = json.loads(raw)
story = next(b for b in data['blocks'] if b['type'] == 'product_story')
extra = [
    ('image_picker', 'sales_editorial', 'Composición editorial'),
    ('text', 'sales_heading1', 'Título editorial 1'),
    ('textarea', 'sales_text1', 'Texto editorial 1'),
    ('text', 'sales_heading2', 'Título editorial 2'),
    ('textarea', 'sales_text2', 'Texto editorial 2'),
    ('image_picker', 'detail_image_one', 'Foto de detalle 1'),
    ('image_picker', 'detail_image_two', 'Foto de detalle 2'),
]
known = {s['id'] for s in story['settings']}
for typ, key, label in extra:
    if key not in known:
        story['settings'].append({'type':typ,'id':key,'label':label})
section.write_text(prefix + '{% schema %}\n' + json.dumps(data, ensure_ascii=False, indent=2) + '\n{% endschema %}' + suffix)

template = theme / 'templates/product.json'
data = json.loads(template.read_text())
copy = json.loads((root / 'docs/product-sales-copy.json').read_text())
for block in data['sections']['main']['blocks'].values():
    if block['type'] != 'product_story':
        continue
    settings = block['settings']
    handle = settings['product']
    settings.update(copy[handle])
    # Exact official photography is used when an AI reconstruction alters the garment.
    if False:  # Generated garments failed the official-product fidelity review.
        settings['sales_editorial'] = f'shopify://shop_images/editorial-{handle}.webp'
    else:
        settings.pop('sales_editorial', None)
template.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

schema_path = theme / 'config/settings_schema.json'
schema = json.loads(schema_path.read_text())
if not any(g.get('name') == 'Contenido editorial oficial' for g in schema):
    schema.append({'name':'Contenido editorial oficial','settings':[
        {'type':'url','id':'brand_film_url','label':'Video oficial de la marca'},
        {'type':'image_picker','id':'brand_film_poster','label':'Portada del video'},
        {'type':'image_picker','id':'editorial_canvas','label':'Fondo editorial decorativo'},
        {'type':'image_picker','id':'proof_image1','label':'Comunidad: imagen oficial 1'},
        {'type':'image_picker','id':'proof_image2','label':'Comunidad: imagen oficial 2'},
    ]})
schema_path.write_text(json.dumps(schema,ensure_ascii=False,indent=2) + '\n')
settings_path = theme / 'config/settings_data.json'
data = json.loads(settings_path.read_text())
data['current'].update({
    'brand_film_url':'https://samuelacuna12.github.io/propuestas-comerciales/dolce/assets/dolce-backstage.mp4',
    'brand_film_poster':'shopify://shop_images/dolce-backstage-oficial.jpg',
    'editorial_canvas':'shopify://shop_images/dolce-editorial-canvas.webp',
})
settings_path.write_text(json.dumps(data,ensure_ascii=False,indent=2) + '\n')

fragment = json.loads((root / 'locales/long-sales-strings.json').read_text())
for lang in ['en.default.json','es.json']:
    path = theme / 'locales' / lang
    data = json.loads(path.read_text())
    data['dolce']['sales'] = fragment['dolce']['sales']
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2) + '\n')
print('Integrated 13 product narratives, editorial media and official backstage.')
