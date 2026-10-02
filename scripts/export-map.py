"""Build the editable public SVG from the published node registry."""
from pathlib import Path
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
data = json.loads((ROOT / 'assets/lab/research-map.json').read_text())
svg = ET.Element(f'{{{NS}}}svg', {'viewBox':'0 0 2320 1680', 'width':'2320', 'height':'1680'})
def element(parent, tag, attrs=None, text=None):
    child = ET.SubElement(parent, f'{{{NS}}}{tag}', {k:str(v) for k,v in (attrs or {}).items()})
    child.text = text
    return child
element(svg, 'title', text='Research Autopilot: 16 regions, 84 task nodes, 221 directed connections')
element(svg, 'desc', text='Editable vector text, region backgrounds and task relationships. Node and edge identifiers match research-map.json.')
element(svg, 'style', text='.region-label{font:600 17px sans-serif;fill:#434950}.region-sub{font:12px sans-serif;fill:#6d7480}.map-edge{fill:none;stroke:#9faabb;stroke-width:1.5;opacity:.32}.map-node circle{fill:#fff;stroke:#87909b;stroke-width:1.7}.node-label{font:13px sans-serif;fill:#323943}')
defs = element(svg, 'defs')
marker = element(defs, 'marker', {'id':'map-arrow','viewBox':'0 0 10 10','refX':9,'refY':5,'markerWidth':5,'markerHeight':5,'orient':'auto-start-reverse'})
element(marker, 'path', {'d':'M 0 0 L 10 5 L 0 10 z','fill':'#8e9cad'})
regions = element(svg, 'g', {'id':'regions'})
links = element(svg, 'g', {'id':'relationships'})
points = element(svg, 'g', {'id':'nodes'})
colors = ['#e8edf8','#e9f2ed','#fff2dc','#eee9fa','#f7e8ed','#e4f0f5','#f4ecd9','#e7edfa','#f1e8df','#e5f2f0','#f4e6e9','#e8ecf9','#f5eddc','#e7eff7','#ece9f5','#e5f0e9']
positions = {}
for i, group in enumerate(data['groups']):
    x, y = 20 + i % 4 * 575, 20 + i // 4 * 415
    region = element(regions, 'g', {'id':'region-' + group[0]})
    element(region, 'rect', {'x':x,'y':y,'width':555,'height':395,'rx':20,'fill':colors[i],'opacity':'.85'})
    element(region, 'text', {'x':x+22,'y':y+35,'class':'region-label'}, group[0] + ' · ' + group[1])
    element(region, 'text', {'x':x+22,'y':y+59,'class':'region-sub'}, str(len(group[3])) + ' tasks')
    for j, node in enumerate(n for n in data['nodes'] if n['id'][0] == group[0]):
        positions[node['id']] = x + 28 + j % 2 * 273, y + 100 + j // 2 * 59
for edge in data['edges']:
    ax, ay = positions[edge['from']]
    bx, by = positions[edge['to']]
    curve = max(18, min(100, abs(bx-ax)*.15 + abs(by-ay)*.08))
    path = element(links, 'path', {'id':edge['id'],'class':'map-edge','data-from':edge['from'],'data-to':edge['to'],'marker-end':'url(#map-arrow)','d':f'M {ax} {ay} Q {(ax+bx)/2+curve} {(ay+by)/2-curve} {bx} {by}'})
    element(path, 'title', text=f"{edge['from']} → {edge['to']} · {edge['type']} · {edge['when']}")
for node in data['nodes']:
    x, y = positions[node['id']]
    point = element(points, 'g', {'id':node['id'],'class':'map-node'})
    element(point, 'circle', {'cx':x,'cy':y,'r':6})
    element(point, 'text', {'x':x+16,'y':y-3,'class':'node-label'}, node['id'] + ' ' + node['name'])
ET.indent(svg)
ET.ElementTree(svg).write(ROOT/'assets/lab/research-map.svg', encoding='utf-8', xml_declaration=True)
print('Exported 84 editable task nodes and 221 directed relationships.')
