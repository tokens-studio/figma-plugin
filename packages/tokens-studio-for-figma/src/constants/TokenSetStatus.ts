export enum TokenSetStatus {
  DISABLED = 'disabled', // @README this means the token set is completely disabled
  SOURCE = 'source', // @README this means the token set will be used to resolve references, but will be excluded from styles creation
  ENABLED = 'enabled', // @README this means the token set is fully enabled and will affect style creation
}
