"""Negative tests for the gate plus the approved landing-page design contract."""
import hashlib
import importlib.util
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('audit', ROOT / 'scripts/audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class SourceGateTests(unittest.TestCase):
    def test_implicit_and_explicit_labels(self):
        document = audit.Document()
        document.feed('<label><input id="wrapped"></label><label for="named">Name</label><input id="named">')
        self.assertTrue(document.controls[0][1])
        self.assertIn('named', document.labels)

    def test_shader_data_is_not_javascript(self):
        document = audit.Document()
        document.feed('<script type="x-shader/x-fragment">precision highp float;</script><script>let count=1;</script>')
        self.assertEqual(document.inline_scripts, ['let count=1;'])

    def test_gate_rejects_broken_source_and_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'scripts').mkdir()
            (root / 'toys/001-fixture').mkdir(parents=True)
            shutil.copy(ROOT / 'scripts/audit.py', root / 'scripts/audit.py')
            (root / 'index.html').write_text('<!doctype html><a href="missing.html">broken</a>')
            (root / 'toys/001-fixture/index.html').write_text('<div id="duplicate"></div><div id="duplicate"></div><script src="script.js"></script>')
            (root / 'toys/001-fixture/script.js').write_text('const broken = ;')
            result = subprocess.run(['python3', str(root / 'scripts/audit.py')], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('syntax_error', result.stdout)
            self.assertIn('missing_target', result.stdout)
            self.assertIn('duplicate_id', result.stdout)

    def test_landing_design_is_unchanged(self):
        html = (ROOT / 'index.html').read_text()
        hashes = {
            r'<body[\s\S]*</body>': '1c53f9b6c45f227659b25fd7fac8b022bc64a624eaa89137513cfadabc7dbded',
            r'<style[\s\S]*?</style>': '9308705c0134f79eb574ee4b921e1f5120feec466f8fca5c03df3a5da9c89d17',
        }
        for pattern, expected in hashes.items():
            self.assertEqual(hashlib.sha256(re.search(pattern, html)[0].encode()).hexdigest(), expected)


if __name__ == '__main__':
    unittest.main()
