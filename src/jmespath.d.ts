export var types: Record<string, number>;

export function search(jsonDoc: any, query: string): any;

export function decorate(fns: Record<string, {_func: Function, _signature: Array<{types: number[]}>}>):
  (query: string) =>
  (jsonDoc: any) =>
  any;
