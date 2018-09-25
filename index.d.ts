import { Client } from '@types/catbox';
declare module 'egg' {
  export interface Application {
    cache: Client;
  }
}
