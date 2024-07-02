import JSON5 from 'json5';

export default function parseJson(payload: string) {
  return JSON.parse(JSON.stringify(JSON5.parse(payload), null, ' '));
}
