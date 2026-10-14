"""Dependency-free regression checks for the two project-page themes.
Run from any directory: python scripts/test_project_editorial.py
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ProjectEditorialTests(unittest.TestCase):
    def test_stylesheet_exists_and_is_page_scoped(self):
        path = ROOT / 'assets/project-editorial.css'
        self.assertTrue(path.is_file(), 'The isolated project stylesheet is missing')
        css = path.read_text()
        self.assertIn('.project-page.project-editorial', css)
        self.assertIn('.project-editorial.research-page', css)
        self.assertIn('.project-editorial.judge-page', css)
        self.assertNotIn('@import', css, 'Do not make rendering depend on remote fonts')

    def test_layout_limits_enhancements_to_the_two_project_urls(self):
        html = (ROOT / '_layouts/project.html').read_text()
        self.assertIn("page.permalink == '/research-autopilot/'", html)
        self.assertIn("page.permalink == '/openjudge/'", html)
        self.assertIn('{% if editorial %}', html)
        self.assertIn('project-editorial.css', html)
        self.assertIn('project-editorial.js', html)
        self.assertIn('aria-current="page"', html)

    def test_motion_is_optional_and_content_does_not_require_js(self):
        path = ROOT / 'assets/project-editorial.css'
        self.assertTrue(path.is_file(), 'Motion policy stylesheet is missing')
        css = path.read_text()
        self.assertIn('prefers-reduced-motion: reduce', css)
        self.assertNotIn('opacity: 0;', css)
        self.assertNotIn('scroll-snap-type', css)
        js = (ROOT / 'assets/project-editorial.js').read_text()
        self.assertIn('requestAnimationFrame', js)
        self.assertIn('passive: true', js)
        self.assertNotIn('preventDefault', js)

    def test_retired_page_and_navigation_are_removed(self):
        nav = (ROOT / '_data/navigation.yml').read_text()
        self.assertNotIn('/research-progress/', nav)
        self.assertFalse((ROOT / 'research-progress/index.html').exists())
        for route in ['/research-autopilot/', '/openjudge/', '/files/Yunbo_Long_CV27.pdf']:
            self.assertIn(route, nav)

    def test_keyboard_and_mobile_treatments_exist(self):
        path = ROOT / 'assets/project-editorial.css'
        self.assertTrue(path.is_file(), 'Responsive stylesheet is missing')
        css = path.read_text()
        self.assertIn(':focus-visible', css)
        self.assertIn('@media (max-width: 640px)', css)
        self.assertIn('min-height: 44px', css)
        self.assertIn('overflow-wrap: anywhere', css)

if __name__ == '__main__':
    unittest.main()
