export type Eventlike = { target: { name: string, value: unknown } };
export type ChangeEventHandler = (e:Eventlike) => void;
