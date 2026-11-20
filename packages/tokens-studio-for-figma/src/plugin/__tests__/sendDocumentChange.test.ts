import { mockGetNodeById } from '../../../tests/__mocks__/figmaMock';
import * as sendSelectionChangeModule from '../sendSelectionChange';
import * as notifiers from '../notifiers';
import { sendDocumentChange } from '../sendDocumentChange';

type TestNode = { id: string; parent: TestNode | null };

describe('sendDocumentChange', () => {
  const frame: TestNode = { id: '1:1', parent: null };
  const child: TestNode = { id: '1:2', parent: frame };
  const elsewhere: TestNode = { id: '2:1', parent: null };
  const nodes: Record<string, TestNode> = { [frame.id]: frame, [child.id]: child, [elsewhere.id]: elsewhere };

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

  it('ignores events without changes and the page-level property change', async () => {
    await sendDocumentChange({} as DocumentChangeEvent);
    await sendDocumentChange({
      documentChanges: [{
        id: '0:0', origin: 'REMOTE', type: 'PROPERTY_CHANGE', properties: ['name'],
      }],
    } as unknown as DocumentChangeEvent);
    expect(sendSelectionChangeSpy).not.toHaveBeenCalled();
  });

  it('notifies the UI when instances are created or change variant locally', async () => {
    const notifySpy = jest.spyOn(notifiers, 'notifyInstancesCreated').mockImplementation(() => {});
    const instance = { id: '3:1', type: 'INSTANCE', parent: null };
    mockGetNodeById.mockImplementation((id: string) => (id === instance.id ? instance : nodes[id] ?? null));

    await sendDocumentChange({
      documentChanges: [{ id: instance.id, origin: 'LOCAL', type: 'CREATE' }],
    } as unknown as DocumentChangeEvent);
    await sendDocumentChange({
      documentChanges: [{
        id: instance.id, origin: 'LOCAL', type: 'PROPERTY_CHANGE', properties: ['variant'],
      }],
    } as unknown as DocumentChangeEvent);

    expect(notifySpy).toHaveBeenCalledTimes(2);
    expect(notifySpy).toHaveBeenCalledWith(1);
    expect(sendSelectionChangeSpy).not.toHaveBeenCalled();
    notifySpy.mockRestore();
  });
});
