import { mockGetNodeById } from '../../../tests/__mocks__/figmaMock';
import * as sendSelectionChangeModule from '../sendSelectionChange';
import { sendDocumentChange } from '../sendDocumentChange';

describe('sendDocumentChange', () => {
  const frame = { id: '1:1', parent: null };
  const child = { id: '1:2', parent: frame };
  const elsewhere = { id: '2:1', parent: null };
  const nodes: Record<string, unknown> = { [frame.id]: frame, [child.id]: child, [elsewhere.id]: elsewhere };

  let sendSelectionChangeSpy: jest.SpyInstance;

  beforeEach(() => {
    sendSelectionChangeSpy = jest.spyOn(sendSelectionChangeModule, 'sendSelectionChange').mockResolvedValue(null);
    mockGetNodeById.mockImplementation((id: string) => nodes[id] ?? null);
    figma.currentPage.selection = [frame] as unknown as SceneNode[];
  });

  afterEach(() => {
    sendSelectionChangeSpy.mockRestore();
    figma.currentPage.selection = [];
  });

  const remoteChange = (id: string) => ({
    documentChanges: [{
      id, origin: 'REMOTE', type: 'PROPERTY_CHANGE', properties: ['width'],
    }],
  } as unknown as DocumentChangeEvent);

  it('sends the selection when a remote change touches a selected node or its children', async () => {
    await sendDocumentChange(remoteChange(child.id));
    expect(sendSelectionChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not send the selection when a remote change happens elsewhere in the file', async () => {
    await sendDocumentChange(remoteChange(elsewhere.id));
    expect(sendSelectionChangeSpy).not.toHaveBeenCalled();
  });

  it('does not send the selection when nothing is selected', async () => {
    figma.currentPage.selection = [];
    await sendDocumentChange(remoteChange(child.id));
    expect(sendSelectionChangeSpy).not.toHaveBeenCalled();
  });
});
