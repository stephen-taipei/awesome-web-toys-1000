"""Reproduce the HTTP-only CI boundary without relying on hover event timing."""
from pathlib import Path
import json
import os
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(os.environ.get('THEREMIN_TEST_SOURCE', ROOT / 'toys/069-theremin/script.js'))


class ThereminRegressionTests(unittest.TestCase):
    def execute(self, assertions):
        # Run the complete real toy source. Only DOM/audio scheduling are doubles.
        # The gradient deliberately rejects non-finite color channels as Chromium does.
        harness = r"""
        const vm = require('node:vm'), fs = require('node:fs'), assert = require('node:assert/strict');
        const colors = [];
        const ctx = new Proxy({
            createRadialGradient() {
                return {addColorStop(offset, color) {
                    assert(!/NaN|Infinity/.test(color), `Invalid gradient color: ${color}`);
                    colors.push(color);
                }};
            }
        }, {get: (object, key) => key in object ? object[key] : () => {}});
        const element = {addEventListener() {}, getContext: () => ctx};
        const sandbox = {
            document: {getElementById: () => element},
            window: {innerWidth:1280, innerHeight:800, addEventListener() {}},
            requestAnimationFrame() {}, assert, colors
        };
        vm.createContext(sandbox);
        vm.runInContext(fs.readFileSync(process.argv[1], 'utf8'), sandbox);
        vm.runInContext(ASSERTIONS, sandbox);
        """.replace('ASSERTIONS', json.dumps(assertions))
        result = subprocess.run(['node', '-e', harness, str(SOURCE)], text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_playing_before_audio_update_has_a_finite_gradient(self):
        self.execute("""
            isPlaying = true;
            drawIndicator();
            assert(colors.length > 0);
            assert(currentFreq > 0 && targetFreq > 0);
        """)

    def test_silent_invalid_and_equal_range_frequencies_are_safe(self):
        self.execute("""
            isPlaying = true;
            for (const frequency of [0, -1, NaN, Infinity, -Infinity, 100, 440, 2000]) {
                currentFreq = frequency;
                drawIndicator();
                const position = frequencyPosition(frequency);
                assert(Number.isFinite(position) && position >= 0 && position <= 1);
            }
            config.minFreq = config.maxFreq = 500;
            currentFreq = 500;
            drawIndicator();
            assert.equal(frequencyPosition(500), 0);
            assert.equal(frequencyToNote(NaN), '--');
            assert.equal(frequencyToNote(Infinity), '--');
        """)


if __name__ == '__main__':
    unittest.main()
