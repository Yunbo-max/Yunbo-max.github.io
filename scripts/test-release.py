from pathlib import Path
import json, unittest
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class ReleaseTests(unittest.TestCase):
    def test_founder_home_replaces_education_intro(self):
        body=(ROOT/'_pages/about.md').read_text()
        self.assertNotIn('I am a PhD student in the Department',body)
        self.assertIn('lab-home.html',body)
    def test_navigation_exposes_research_and_judge(self):
        p=ROOT/'_layouts/lab.html'
        self.assertTrue(p.is_file(),'The new multi-page lab navigation is absent')
        if p.is_file():
            text=p.read_text()
            for path in ['/research-autopilot/','/lab/','/openjudge/','/research/']:self.assertIn(path,text)
    def test_map_retains_all_nodes_edges_and_actual_source_identity(self):
        p=ROOT/'assets/lab/research-map.json'
        self.assertTrue(p.is_file(),'Public node map is absent')
        if p.is_file():
            d=json.loads(p.read_text());self.assertEqual(len(d['nodes']),84);self.assertEqual(len(d['edges']),221)
            ids={n['id'] for n in d['nodes']}
            for n in d['nodes']:self.assertTrue(n['sources']);self.assertIn('runtime_validation',n)
            for e in d['edges']:self.assertIn(e['from'],ids);self.assertIn(e['to'],ids)
    def test_openjudge_links_existing_project_without_new_claims(self):
        p=ROOT/'_pages/openjudge.html'
        self.assertTrue(p.is_file(),'OpenJudge project page is absent')
        if p.is_file():self.assertIn('https://openjudge.longyunbo218.chatgpt.site',p.read_text())
    def test_download_package_is_installable(self):
        for name in ['research-autopilot','writing-top-tier-papers','designing-pipeline-figures','designing-experiment-figures']:
            self.assertTrue((ROOT/'research-autopilot/skills'/name/'SKILL.md').is_file(),name)
    def test_preview_svg_is_valid_and_contains_the_full_map(self):
        svg=ET.parse(ROOT/'assets/lab/preview-map.svg').getroot()
        ns={'s':'http://www.w3.org/2000/svg'}
        self.assertEqual(len(svg.findall('s:circle',ns)),84)
        self.assertEqual(len(svg.findall('s:path',ns)),221)
        self.assertIn('P · Researcher & projects',[t.text for t in svg.findall('s:text',ns)])
        for name in ['mark.svg','social-card.svg']:
            ET.parse(ROOT/'assets/lab'/name)
        export=ET.parse(ROOT/'assets/lab/research-map.svg').getroot()
        self.assertEqual(len(export.findall("s:g[@id='nodes']/s:g",ns)),84)
        self.assertEqual(len(export.findall("s:g[@id='relationships']/s:path",ns)),221)
if __name__=='__main__':unittest.main()
