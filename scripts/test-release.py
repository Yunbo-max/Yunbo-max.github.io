from pathlib import Path
import json, unittest
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class ReleaseTests(unittest.TestCase):
    def test_research_home_and_founder_project_routes(self):
        body=(ROOT/'_pages/about.md').read_text()
        self.assertIn('about-homepage-header.html',body)
        self.assertIn('author_profile: true',body)
        self.assertNotIn('layout: lab',body)
        self.assertNotIn('lab-home.html',body)
        self.assertIn('lab-home.html',(ROOT/'_pages/research-autopilot.html').read_text())
    def test_navigation_exposes_research_and_judge(self):
        p=ROOT/'_layouts/lab.html'
        self.assertTrue(p.is_file(),'The new multi-page lab navigation is absent')
        if p.is_file():
            text=p.read_text()
            for path in ['href="/"','/research-autopilot/','/openjudge/']:self.assertIn(path,text)
            self.assertNotIn('href="/lab/"',text)
    def test_public_assets_do_not_include_the_internal_map_or_skill_bundle(self):
        for name in ['research-autopilot/skills','research-autopilot/manifest.json','assets/lab/research-map.json','assets/lab/research-map.svg','assets/lab/preview-map.svg']:
            self.assertFalse((ROOT/name).exists(),name+' would expose withdrawn internal material')
    def test_openjudge_links_existing_project_without_new_claims(self):
        p=ROOT/'_pages/openjudge.html'
        self.assertTrue(p.is_file(),'OpenJudge project page is absent')
        if p.is_file():self.assertIn('https://openjudge.longyunbo218.chatgpt.site',p.read_text())
    def test_public_navigation_loads_no_withdrawn_downloads(self):
        import re,subprocess
        subprocess.run(['python3',str(ROOT/'scripts/preview-lab.py')],check=True,capture_output=True)
        html=(ROOT/'.preview-navigation/research-autopilot/index.html').read_text()
        sources=re.findall(r'(?:href|src)="([^"]+)"',html)
        for source in sources:
            self.assertNotRegex(source,r'research-autopilot/(?:skills|manifest)|(?:research|preview)-map\.(?:svg|json)')
        self.assertNotIn('Get the skills',html)
        self.assertNotIn('Export SVG',html)
    def test_brand_assets_are_valid(self):
        for name in ['mark.svg','social-card.svg']:
            ET.parse(ROOT/'assets/lab'/name)
if __name__=='__main__':unittest.main()
