import { env } from 'flex-plugins-api-utils';

import PluginServiceHttp from '../client';

jest.mock('flex-plugins-api-utils/dist/logger');

describe('PluginServiceHttp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getRealm', () => {
    it('should return the realm passed to it', () => {
      jest.spyOn(env, 'getRealm');

      // @ts-ignore
      expect(PluginServiceHttp.getRealm('stage')).toEqual('.stage');
      expect(env.getRealm).not.toHaveBeenCalled();
    });

    it('should return prod realm if no realm provided', () => {
      // @ts-ignore
      jest.spyOn(env, 'getRealm').mockReturnValue('');

      // @ts-ignore
      expect(PluginServiceHttp.getRealm()).toEqual('');
    });

    it('should return prod realm if invalid realm provided', () => {
      // @ts-ignore
      jest.spyOn(env, 'getRealm').mockReturnValue('foo');

      // @ts-ignore
      expect(PluginServiceHttp.getRealm()).toEqual('');
    });

    it('should return dev realm', () => {
      jest.spyOn(env, 'getRealm').mockReturnValue('dev');

      // @ts-ignore
      expect(PluginServiceHttp.getRealm()).toEqual('.dev');
    });

    it('should return stage realm', () => {
      jest.spyOn(env, 'getRealm').mockReturnValue('stage');

      // @ts-ignore
      expect(PluginServiceHttp.getRealm()).toEqual('.stage');
    });
  });

  describe('list', () => {
    const client = new PluginServiceHttp('username', 'password');
    const get = jest.spyOn(client, 'get');

    it('should create no query parameter if no pagination is provided', async () => {
      get.mockResolvedValue({ meta: {}, data: [] });
      const result = await client.list('/the-url');

      expect(result).toEqual({ meta: {}, data: [] });
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('/the-url?');
    });

    it('should add one pagination parameter', async () => {
      get.mockResolvedValue({ meta: {}, data: [] });
      const result = await client.list('/the-url', { pageSize: 5 });

      expect(result).toEqual({ meta: {}, data: [] });
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('/the-url?PageSize=5');
    });

    it('should add multiple pagination parameters', async () => {
      get.mockResolvedValue({ meta: {}, data: [] });
      const result = await client.list('/the-url', { page: 1, pageSize: 5 });

      expect(result).toEqual({ meta: {}, data: [] });
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('/the-url?Page=1&PageSize=5');
    });

    it('should return meta with next token', async () => {
      get.mockResolvedValue({
        meta: {
          next_page_url: 'https://api.twilio.com/Data?PageToken=123',
        },
        data: [],
      });
      const result = await client.list('/the-url');

      expect(result.meta.next_token).toEqual('123');
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('/the-url?');
    });

    it('should return meta with previous token', async () => {
      get.mockResolvedValue({
        meta: {
          previous_page_url: 'https://api.twilio.com/Data?PageToken=321',
        },
        data: [],
      });
      const result = await client.list('/the-url');

      expect(result.meta.previous_token).toEqual('321');
      expect(get).toHaveBeenCalledTimes(1);
      expect(get).toHaveBeenCalledWith('/the-url?');
    });
  });
});
