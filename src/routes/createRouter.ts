import * as express from 'express';

export function newRouter(options?: express.RouterOptions) {
  return express.Router(options);
}
