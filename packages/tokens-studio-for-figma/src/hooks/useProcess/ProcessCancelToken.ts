type EventTypes = 'canceled';

export class ProcessCancelToken {
  public id = Date.now();

  private $eventHandlers: Record<EventTypes, (() => void)[]> = {
    canceled: [],
  };

  public cancel() {
    this.$eventHandlers.canceled.forEach((fn) => fn());
  }

  public on(event: EventTypes, fn: () => void) {
    this.$eventHandlers[event].push(fn);
    return () => {
      const indexOf = this.$eventHandlers[event].indexOf(fn);
      if (indexOf > -1) {
        this.$eventHandlers[event].splice(indexOf, 1);
      }
    };
  }
}
