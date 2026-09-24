#!/usr/bin/env python3
"""Dependency-free source/asset quality gate. Accessibility counts are warnings, not certification."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.targets, self.controls, self.labels, self.inline_scripts = [], [], [], set(), []
        self.label_depth = 0
        self.script = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get('id'):
            self.ids.append(attributes['id'])
        if tag == 'label':
            self.label_depth += 1
            if attributes.get('for'):
                self.labels.add(attributes['for'])
        if tag in ('input', 'select', 'textarea'):
            self.controls.append((attributes, self.label_depth > 0))
        if tag in ('script', 'img', 'audio', 'video', 'source', 'iframe') and attributes.get('src'):
            self.targets.append(attributes['src'])
        if tag in ('a', 'link') and attributes.get('href'):
            self.targets.append(attributes['href'])
        if tag == 'script' and not attributes.get('src') and attributes.get('type', '') in ('', 'text/javascript', 'application/javascript'):
            self.script = ''

    def handle_endtag(self, tag):
        if tag == 'label':
            self.label_depth = max(0, self.label_depth - 1)
        if tag == 'script' and self.script is not None:
            self.inline_scripts.append(self.script)
            self.script = None

    def handle_data(self, data):
        if self.script is not None:
            self.script += data


def run():
    pages = [ROOT / 'index.html', *sorted(ROOT.glob('toys/*/index.html'))]
    scripts, errors, warnings = [], [], []
    for file in pages:
        relative = file.relative_to(ROOT).as_posix()
        document = Document()
        document.feed(file.read_text())
        for identifier, count in Counter(document.ids).items():
            if count > 1:
                errors.append({'path': relative, 'duplicate_id': identifier})
        for target in document.targets:
            url = urlsplit(target)
            if url.scheme or url.netloc or not url.path:
                continue
            # Root-relative internal assets break on GitHub Pages project sites.
            if url.path.startswith('/'):
                errors.append({'path': relative, 'root_relative_target': target})
                continue
            resolved = (file.parent / unquote(url.path)).resolve()
            if not resolved.is_relative_to(ROOT) or not resolved.exists():
                errors.append({'path': relative, 'missing_target': target})
        for attributes, implicit_label in document.controls:
            if attributes.get('type') in ('hidden', 'button', 'submit', 'reset', 'image'):
                continue
            if not (implicit_label or attributes.get('id') in document.labels or attributes.get('aria-label') or attributes.get('aria-labelledby')):
                warnings.append({'path': relative, 'unlabelled_control': attributes.get('id', '(no id)')})
        for index, code in enumerate(document.inline_scripts):
            scripts.append({'path': f'{relative}:inline-{index}', 'code': code})
    for file in sorted(ROOT.glob('toys/**/*.js')):
        scripts.append({'path': file.relative_to(ROOT).as_posix(), 'code': file.read_text()})
    base_url = 'https://stephen-taipei.github.io/awesome-web-toys-1000/'
    for name in ['sitemap.xml', 'news-sitemap.xml']:
        try:
            tree = ET.parse(ROOT / name)
            locations = [element.text or '' for element in tree.iter() if element.tag.endswith('}loc')]
            if len(locations) != len(set(locations)):
                errors.append({'path': name, 'duplicate_sitemap_location': True})
            for location in locations:
                relative = unquote(urlsplit(location).path.removeprefix('/awesome-web-toys-1000/'))
                target = (ROOT / (relative or 'index.html')).resolve()
                if not location.startswith(base_url) or not target.is_relative_to(ROOT) or not target.is_file():
                    errors.append({'path': name, 'invalid_sitemap_target': location})
            if name == 'sitemap.xml':
                expected = {base_url if file == ROOT / 'index.html' else base_url + file.relative_to(ROOT).as_posix() for file in pages}
                for missing in sorted(expected - set(locations)):
                    errors.append({'path': name, 'missing_sitemap_location': missing})
        except (OSError, ET.ParseError) as error:
            errors.append({'path': name, 'sitemap_error': str(error)})
    check = """const vm=require('node:vm'),fs=require('node:fs');
const errors=[];
for(const entry of JSON.parse(fs.readFileSync(0,'utf8'))) {
 try { new vm.Script(entry.code,{filename:entry.path}); }
 catch(error) { errors.push({path:entry.path,syntax_error:error.message}); }
}
process.stdout.write(JSON.stringify(errors));"""
    result = subprocess.run(['node', '-e', check], input=json.dumps(scripts), capture_output=True, text=True, check=True)
    errors.extend(json.loads(result.stdout))
    report = {'toy_pages': len(pages) - 1, 'javascript_files': len(list(ROOT.glob('toys/**/*.js'))),
              'checked_scripts': len(scripts), 'errors': errors, 'accessibility_warnings': warnings}
    output = ROOT / 'audit-evidence' / 'static.json'
    output.parent.mkdir(exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({**report, 'accessibility_warnings': len(warnings)}, ensure_ascii=False))
    return bool(errors)


if __name__ == '__main__':
    sys.exit(run())
