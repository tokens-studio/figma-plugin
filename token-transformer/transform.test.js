const fs = require('fs');

describe('token-transformer', () => {
    it('generates dark theme files correctly', async () => {
        var shouldBuf = fs.readFileSync('output/dark.json');
        var testBuf = fs.readFileSync('temp/dark.json');
        expect(shouldBuf.toString()).toEqual(testBuf.toString());
    });
    it('generates light theme files correctly', async () => {
        var shouldBuf = fs.readFileSync('output/light.json');
        var testBuf = fs.readFileSync('temp/light.json');
        expect(shouldBuf.toString()).toEqual(testBuf.toString());
    });
    it('generates typography theme files correctly', async () => {
        var shouldBuf = fs.readFileSync('output/typography.json');
        var testBuf = fs.readFileSync('temp/typography.json');
        expect(shouldBuf.toString()).toEqual(testBuf.toString());
    });
    it('generates light theme files correctly from folder', async () => {
        var shouldBuf = fs.readFileSync('output/folder-light.json');
        var testBuf = fs.readFileSync('temp/folder-light.json');
        expect(shouldBuf.toString()).toEqual(testBuf.toString());
    });
    it('generates light theme files correctly and handles resolveReferences correctly', async () => {
        var shouldBuf = fs.readFileSync('output/resolve-false.json');
        var testBuf = fs.readFileSync('temp/resolve-false.json');
        expect(shouldBuf.toString()).toEqual(testBuf.toString());
    });
});