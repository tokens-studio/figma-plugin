import { splitIntoChunks } from '../splitIntoChunks';

describe('splitIntoChunks', () => {
  it('should split a string into chunks based on byte size', () => {
    const testString = 'a'.repeat(100);
    const maxBytes = 50; // 25 characters in UTF-16

    const chunks = splitIntoChunks(testString, maxBytes);

    expect(chunks.length).toBe(4);
    expect(chunks[0].length).toBe(25);
    expect(chunks[1].length).toBe(25);
    expect(chunks[2].length).toBe(25);
    expect(chunks[3].length).toBe(25);
  });

  it('should handle empty strings', () => {
    const chunks = splitIntoChunks('', 100);
    expect(chunks.length).toBe(0);
  });

  it('should handle strings smaller than max size', () => {
    const testString = 'small string';
    const maxBytes = 100; // 50 characters in UTF-16

    const chunks = splitIntoChunks(testString, maxBytes);

    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(testString);
  });

  it('should handle exact multiples of chunk size', () => {
    const testString = 'a'.repeat(50);
    const maxBytes = 50; // 25 characters in UTF-16

    const chunks = splitIntoChunks(testString, maxBytes);

    expect(chunks.length).toBe(2);
    expect(chunks[0].length).toBe(25);
    expect(chunks[1].length).toBe(25);
  });

  it('should handle odd-sized chunks correctly', () => {
    const testString = 'a'.repeat(51);
    const maxBytes = 50; // 25 characters in UTF-16

    const chunks = splitIntoChunks(testString, maxBytes);

    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(25);
    expect(chunks[1].length).toBe(25);
    expect(chunks[2].length).toBe(1);
  });
});
