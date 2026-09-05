import { valuesEquivalent } from '../valuesEquivalent';

describe('valuesEquivalent', () => {
  describe('aliases', () => {
    const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id } as VariableAlias);

    it('matches same target id', () => {
      expect(valuesEquivalent(alias('v1'), alias('v1'))).toBe(true);
    });

    it('rejects different target id', () => {
      expect(valuesEquivalent(alias('v1'), alias('v2'))).toBe(false);
    });

    it('rejects alias vs raw color (never equivalent even if resolved value matches)', () => {
      expect(valuesEquivalent(alias('v1'), {
        r: 1, g: 1, b: 1, a: 1,
      })).toBe(false);
      expect(valuesEquivalent({
        r: 1, g: 1, b: 1, a: 1,
      }, alias('v1'))).toBe(false);
    });

    it('rejects alias vs number/string/boolean', () => {
      expect(valuesEquivalent(alias('v1'), 4)).toBe(false);
      expect(valuesEquivalent(alias('v1'), 'text')).toBe(false);
      expect(valuesEquivalent(alias('v1'), true)).toBe(false);
    });
  });

  describe('colors', () => {
    it('matches identical colors', () => {
      expect(valuesEquivalent({
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      }, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      })).toBe(true);
    });

    it('matches approximately equal colors within threshold', () => {
      expect(valuesEquivalent({
        r: 0.50000001, g: 0.2, b: 0.1, a: 1,
      }, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      })).toBe(true);
    });

    it('treats missing alpha as 1', () => {
      expect(valuesEquivalent({ r: 0.5, g: 0.2, b: 0.1 }, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      })).toBe(true);
    });

    it('rejects differing colors', () => {
      expect(valuesEquivalent({
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      }, {
        r: 0.6, g: 0.2, b: 0.1, a: 1,
      })).toBe(false);
    });

    it('rejects differing alpha', () => {
      expect(valuesEquivalent({
        r: 0.5, g: 0.2, b: 0.1, a: 0.5,
      }, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      })).toBe(false);
    });
  });

  describe('numbers', () => {
    it('matches equal numbers', () => {
      expect(valuesEquivalent(16, 16)).toBe(true);
    });

    it('matches approximately equal numbers', () => {
      expect(valuesEquivalent(16.0000000001, 16)).toBe(true);
    });

    it('rejects different numbers', () => {
      expect(valuesEquivalent(16, 17)).toBe(false);
    });

    it('rejects number vs string', () => {
      expect(valuesEquivalent(16, '16')).toBe(false);
    });
  });

  describe('strings and booleans', () => {
    it('matches equal strings', () => {
      expect(valuesEquivalent('Inter', 'Inter')).toBe(true);
    });

    it('rejects different strings', () => {
      expect(valuesEquivalent('Inter', 'Roboto')).toBe(false);
    });

    it('matches equal booleans', () => {
      expect(valuesEquivalent(true, true)).toBe(true);
      expect(valuesEquivalent(false, false)).toBe(true);
    });

    it('rejects different booleans', () => {
      expect(valuesEquivalent(true, false)).toBe(false);
    });
  });

  describe('undefined handling', () => {
    it('never matches undefined (inherited/absent parent value)', () => {
      expect(valuesEquivalent(undefined, undefined)).toBe(false);
      expect(valuesEquivalent(16, undefined)).toBe(false);
      expect(valuesEquivalent(undefined, 16)).toBe(false);
    });
  });
});
