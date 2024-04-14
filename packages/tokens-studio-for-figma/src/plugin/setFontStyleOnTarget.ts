import { transformValue } from './helpers';
import { notifyUI } from './notifiers';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';

export async function setFontStyleOnTarget({ target, value, baseFontSize }: { target: BaseNode | TextStyle; value: Pick<ResolvedTypographyObject, 'fontFamily' | 'fontWeight'>; baseFontSize: string }) {
  if (!('fontName' in target)) return;
  const {
    fontFamily, fontWeight,
  } = value;

  const family = fontFamily?.toString() || (target.fontName !== figma.mixed ? target.fontName.family : '');
  const style = fontWeight?.toString() || (target.fontName !== figma.mixed ? target.fontName.style : '');

  try {
    await figma.loadFontAsync({ family, style });
    if (fontFamily || fontWeight) {
      target.fontName = {
        family,
        style,
      };
    }
  } catch (e) {
    const splitFontFamily = family.split(',');
    const candidateStyles = transformValue(style, 'fontWeights', baseFontSize);
    const candidateFonts: { family: string; style: string; }[] = [];
    splitFontFamily?.forEach((candidateFontFamily) => {
      const normalizedFontFamily = candidateFontFamily?.replace(/['"]/g, '').trim();
      if (candidateStyles.length > 0) {
        candidateStyles.forEach((candidateStyle) => {
          candidateFonts.push({
            family: normalizedFontFamily,
            style: candidateStyle,
          });
        });
      } else {
        candidateFonts.push({
          family: normalizedFontFamily,
          style,
        });
      }
    });

    let hasErrored = false;

    for (let i = 0; i < candidateFonts.length; i += 1) {
      let isApplied = false; // if font is applied then skip other font families
      await figma
        .loadFontAsync({ family: candidateFonts[i].family, style: candidateFonts[i].style })
        .then(() => {
          if (candidateFonts[i]) {
            target.fontName = {
              family: candidateFonts[i].family,
              style: candidateFonts[i].style,
            };
            isApplied = true;
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        .catch(() => {
          hasErrored = true;
        });
      if (isApplied) {
        hasErrored = false;
        break;
      }
    }
    if (hasErrored) {
      notifyUI(`Error setting font family/weight combination for ${family}/${style}`);
    }
  }
}
