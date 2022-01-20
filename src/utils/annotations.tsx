import {notifyUI} from '@/plugin/notifiers';

const DIST = 50;
const BG_COLOR = {r: 0.1, g: 0.1, b: 0.1};
const STROKE_COLOR = {r: 0.482, g: 0.38, b: 1};
const PROP_COLOR = {r: 1, g: 1, b: 1};
const VALUE_COLOR = {r: 1, g: 0.839, b: 0.078};

function getParentSelection(sel, distance, dir) {
    const selection = sel;
    if (sel.parent.type !== 'PAGE') {
        distance += sel[dir];
        return getParentSelection(sel.parent, distance, dir);
    }
    return {
        selection,
        distance,
    };
}

function calcPosition(sel, anno, direction) {
    let x = 0;
    let y = 0;

    // Loop through the parent nodes to get a correct X & Y position
    const updatedSelection = getParentSelection(sel, DIST, ['top', 'bottom'].includes(direction) ? 'y' : 'x');
    sel = updatedSelection.selection;

    switch (direction) {
        case 'top':
            x = sel.x + sel.width / 2 - anno.width / 2;
            y = sel.y - DIST - anno.height;
            break;
        case 'right':
            x = sel.x + sel.width + DIST;
            y = sel.y + sel.height / 2 - anno.height / 2;
            break;
        case 'bottom':
            x = sel.x + sel.width / 2 - anno.width / 2;
            y = sel.y + sel.height + DIST;
            break;
        default:
            // left
            x = sel.x - DIST - anno.width;
            y = sel.y + sel.height / 2 - anno.height / 2;
            break;
    }

    return {x, y, distance: updatedSelection.distance};
}

function createProperties(anno, tokens) {
    for (const [key, value] of Object.entries(tokens)) {
        const prop = figma.createFrame();
        prop.layoutMode = 'HORIZONTAL';
        prop.itemSpacing = 8;
        prop.fills = [{visible: false, type: 'SOLID', color: BG_COLOR}];
        prop.primaryAxisSizingMode = 'AUTO';
        prop.counterAxisSizingMode = 'AUTO';
        prop.name = 'annotation-prop';

        const propText = figma.createText();
        const propValue = figma.createText();
        propText.fontName = propValue.fontName = {family: 'Roboto Mono', style: 'Regular'};
        propText.fontSize = propValue.fontSize = 14;
        propText.fills = [{type: 'SOLID', color: PROP_COLOR}];
        propValue.fills = [{type: 'SOLID', color: VALUE_COLOR}];

        propText.characters = `${key}:`;
        propValue.characters = value as string;

        prop.appendChild(propText);
        prop.appendChild(propValue);
        anno.appendChild(prop);
    }
}

function createAnno(tokens, direction) {
    /* Create the alignment container */
    const cont = figma.createFrame();
    cont.layoutMode = ['top', 'bottom'].includes(direction) ? 'VERTICAL' : 'HORIZONTAL';
    cont.fills = [];
    cont.clipsContent = false;
    cont.primaryAxisSizingMode = cont.counterAxisSizingMode = 'AUTO';
    cont.primaryAxisAlignItems = cont.counterAxisAlignItems = 'CENTER';

    /* Create the annotation card */
    const anno = figma.createFrame();
    anno.layoutMode = 'VERTICAL';
    anno.paddingTop = anno.paddingLeft = anno.paddingBottom = anno.paddingRight = 16;
    anno.itemSpacing = 8;
    anno.fills = [{type: 'SOLID', color: BG_COLOR}];
    anno.strokes = [{type: 'SOLID', color: STROKE_COLOR}];
    anno.strokeWeight = 1;
    anno.cornerRadius = 8;
    anno.primaryAxisSizingMode = anno.counterAxisSizingMode = 'AUTO';
    anno.name = 'annotation-card';

    /* Add the tokens */
    createProperties(anno, tokens);

    /* Position the container */
    const selection = figma.currentPage.selection[0];
    const position = calcPosition(selection, anno, direction);
    cont.x = position.x;
    cont.y = position.y;

    /* Rename the annotation based on selection */
    cont.name = `${selection.name}_annotation`;

    /* Add the arrow */
    const arrowAnchor = figma.createFrame();
    arrowAnchor.resize(0.01, 0.01);
    arrowAnchor.fills = [];
    arrowAnchor.clipsContent = false;
    arrowAnchor.name = 'arrow-anchor';

    const arrow = figma.createLine();
    arrow.strokes = [{type: 'SOLID', color: STROKE_COLOR}];
    arrow.strokeWeight = 2;
    arrow.strokeCap = 'ARROW_EQUILATERAL';
    switch (direction) {
        case 'top':
            arrow.rotation = -90;
            break;
        case 'right':
            arrow.rotation = 180;
            break;
        case 'bottom':
            arrow.rotation = 90;
            break;
        default:
            break;
    }
    arrow.resize(position.distance, 0);
    arrowAnchor.appendChild(arrow);

    // Add the child frames
    if (['top', 'left'].includes(direction)) {
        cont.appendChild(anno);
        cont.appendChild(arrowAnchor);
    } else {
        cont.appendChild(arrowAnchor);
        cont.appendChild(anno);
    }

    /* Add it to the page */
    figma.currentPage.appendChild(cont);
}

// update credentials
export async function createAnnotation(tokens, direction) {
    await figma.loadFontAsync({family: 'Roboto Mono', style: 'Regular'});
    try {
        await createAnno(tokens, direction);
    } catch (err) {
        console.log(err);
        notifyUI('There was an issue creating the annotation. Please try again.');
    }
}
