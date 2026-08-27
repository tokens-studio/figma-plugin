import { notifyUI } from './notifiers';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { fontWeightStyleCandidates } from './figmaTransforms/fontWeight';

export async function setFontStyleOnTarget({ target, value }: { target: BaseNode | TextStyle; value: Pick<ResolvedTypographyObject, 'fontFamily' | 'fontWeight'>; baseFontSize: string }) {
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
  } catch {
    const families = family.split(',')
      .map((candidateFontFamily) => candidateFontFamily.replace(/['"]/g, '').trim())
      .filter(Boolean);
    const weightCandidates = fontWeightStyleCandidates(style);
    const available = await figma.listAvailableFontsAsync() || [];

    const fontsToTry: { family: string; style: string; }[] = [];
    families.forEach((candidateFamily) => {
      const familyStyles = available
        .filter((font) => font.fontName.family === candidateFamily)
        .map((font) => font.fontName.style);
      // Keep Figma's canonical style string; match aliases case-insensitively.
      weightCandidates.forEach((candidate) => {
        const match = familyStyles.find((familyStyle) => familyStyle.toLowerCase() === candidate.toLowerCase());
        if (match) {
          fontsToTry.push({ family: candidateFamily, style: match });
        }
      });
    });

    // Installed styles first; candidate loads cover a stale font list.
    if (fontsToTry.length === 0) {
      families.forEach((candidateFamily) => {
        weightCandidates.forEach((candidateStyle) => {
          fontsToTry.push({ family: candidateFamily, style: candidateStyle });
        });
      });
    }

    let applied = false;
    for (let i = 0; i < fontsToTry.length; i += 1) {
      try {
        await figma.loadFontAsync({ family: fontsToTry[i].family, style: fontsToTry[i].style });
        target.fontName = {
          family: fontsToTry[i].family,
          style: fontsToTry[i].style,
        };
        applied = true;
        break;
      } catch {
        // Try the next family/style pair.
      }
    }
    if (!applied) {
      notifyUI(`Error setting font family/weight combination for ${family}/${style}`);
    }
  }
}
