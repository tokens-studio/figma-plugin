import setValuesOnNode from './setValuesOnNode';

import * as setTextValuesOnTarget from './setTextValuesOnTarget';

describe('updateNode', () => {
    const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');

    const atomicValues = {
        textCase: 'TITLE',
        textDecoration: 'STRIKETHROUGH',
    };

    const typographyValues = {
        typography: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
        },
    };

    const dataOnNode = {
        typography: 'type.heading.h1',
    };

    let textNodeMock;
    let solidNodeMock;

    beforeEach(() => {
        textNodeMock = {
            type: 'TEXT',
            fontName: {
                family: 'Inter',
                style: 'Regular',
            },
        };

        solidNodeMock = {
            type: 'SOLID',
        };
    });

    it('calls setTextValuesOnTarget if text node and atomic typography tokens are given', () => {
        setValuesOnNode(textNodeMock, atomicValues, dataOnNode);
        expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
    });

    it('doesnt call setTextValuesOnTarget if no text node', () => {
        setValuesOnNode(solidNodeMock, atomicValues, dataOnNode);
        expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    });

    it('calls setTextValuesOnTarget if text node and composite typography tokens are given', () => {
        setValuesOnNode(textNodeMock, typographyValues, dataOnNode);
        figma.getLocalTextStyles.mockReturnValue([]);
        expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
    });

    it('sets textstyle if matching Style is found', async () => {
        figma.getLocalTextStyles.mockReturnValue([{name: 'type/heading/h1', id: '123'}]);
        await setValuesOnNode(textNodeMock, typographyValues, dataOnNode);
        expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
        expect(textNodeMock).toEqual({...textNodeMock, textStyleId: '123'});
    });

    it('sets textstyle if matching Style is found and first part is ignored', async () => {
        figma.getLocalTextStyles.mockReturnValue([{name: 'heading/h1', id: '456'}]);
        await setValuesOnNode(textNodeMock, typographyValues, dataOnNode, true);
        expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
        expect(textNodeMock).toEqual({...textNodeMock, textStyleId: '456'});
    });
});
