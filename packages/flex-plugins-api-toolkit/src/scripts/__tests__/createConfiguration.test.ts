import {
  ConfigurationResource,
  ConfigurationsClient,
  ConfiguredPluginResource,
  ConfiguredPluginsClient,
  PluginResource,
  PluginsClient,
  PluginServiceHTTPClient,
  PluginVersionResource,
  PluginVersionsClient,
  ReleaseResource,
  ReleasesClient,
} from 'flex-plugins-api-client';
import { TwilioError } from 'flex-plugins-api-utils';

import createConfigurationScript from '../createConfiguration';

describe('CreateConfigurationScript', () => {
  const httpClient = new PluginServiceHTTPClient('username', 'password');
  const pluginsClient = new PluginsClient(httpClient);
  const versionsClient = new PluginVersionsClient(httpClient);
  const configurationsClient = new ConfigurationsClient(httpClient);
  const configuredPluginsClient = new ConfiguredPluginsClient(httpClient);
  const releasesClient = new ReleasesClient(httpClient);

  const listConfiguredPlugins = jest.spyOn(configuredPluginsClient, 'list');
  const getPlugin = jest.spyOn(pluginsClient, 'get');
  const getVersion = jest.spyOn(versionsClient, 'get');
  const getLatestVersion = jest.spyOn(versionsClient, 'latest');
  const create = jest.spyOn(configurationsClient, 'create');
  const activeRelease = jest.spyOn(releasesClient, 'active');

  const plugin1: PluginResource = {
    sid: 'FP00000000000000000000000000000001',
    account_sid: 'AC00000000000000000000000000000000',
    unique_name: 'plugin1',
    friendly_name: '',
    description: '',
    date_created: '',
    date_updated: '',
  };
  const pluginVersion1: PluginVersionResource = {
    sid: 'FV00000000000000000000000000000001',
    account_sid: 'AC00000000000000000000000000000000',
    plugin_sid: plugin1.sid,
    version: '1.0.0',
    plugin_url: 'https://twilio.com/plugin1',
    private: true,
    changelog: '',
    date_created: '',
  };
  const plugin2: PluginResource = {
    sid: 'FP00000000000000000000000000000002',
    account_sid: 'AC00000000000000000000000000000000',
    unique_name: 'plugin2',
    friendly_name: '',
    description: '',
    date_created: '',
    date_updated: '',
  };
  const pluginVersion2: PluginVersionResource = {
    sid: 'FV00000000000000000000000000000002',
    account_sid: 'AC00000000000000000000000000000000',
    plugin_sid: plugin2.sid,
    version: '2.0.0',
    plugin_url: 'https://twilio.com/plugin2',
    private: true,
    changelog: '',
    date_created: '',
  };
  const configuration: ConfigurationResource = {
    sid: 'FJ00000000000000000000000000000001',
    account_sid: 'AC00000000000000000000000000000000',
    name: 'some name',
    description: '',
    date_created: '',
  };
  const configuredPlugin1: ConfiguredPluginResource = {
    plugin_sid: plugin1.sid,
    plugin_version_sid: pluginVersion1.sid,
    configuration_sid: configuration.sid,
    unique_name: plugin1.unique_name,
    version: pluginVersion1.version,
    plugin_url: pluginVersion1.plugin_url,
    phase: 3,
    private: true,
    date_created: '',
  };
  const configuredPlugin2: ConfiguredPluginResource = {
    plugin_sid: plugin2.sid,
    plugin_version_sid: pluginVersion2.sid,
    configuration_sid: 'FJ00000000000000000000000000000002',
    unique_name: plugin2.unique_name,
    version: pluginVersion2.version,
    plugin_url: pluginVersion2.plugin_url,
    phase: 3,
    private: true,
    date_created: '',
  };
  const release: ReleaseResource = {
    sid: 'FK00000000000000000000000000000000',
    account_sid: 'AC00000000000000000000000000000000',
    configuration_sid: configuredPlugin2.configuration_sid,
    date_created: 'the-date',
  };
  const requestObject = { name: 'the configuraiton name' };

  const script = createConfigurationScript(
    pluginsClient,
    versionsClient,
    configurationsClient,
    configuredPluginsClient,
    releasesClient,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should throw error if plugins does not contain version', async (done) => {
    const option = {
      ...requestObject,
      addPlugins: [plugin1.unique_name],
    };

    try {
      await script(option);
    } catch (e) {
      expect(e).toBeInstanceOf(TwilioError);
      expect(e.message).toContain('must be of the format');

      expect(getPlugin).not.toHaveBeenCalled();
      expect(getVersion).not.toHaveBeenCalled();
      expect(getLatestVersion).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(listConfiguredPlugins).not.toHaveBeenCalled();

      done();
    }
  });

  it('should throw an exception if a plugin is not found', async (done) => {
    const option = {
      ...requestObject,
      addPlugins: [`${plugin1.unique_name}@version1`],
    };
    getPlugin.mockRejectedValue('plugin not found');

    try {
      await script(option);
    } catch (e) {
      expect(e).toEqual('plugin not found');

      expect(getPlugin).toHaveBeenCalledTimes(1);
      expect(getPlugin).toHaveBeenCalledWith(plugin1.unique_name);
      expect(getVersion).not.toHaveBeenCalled();
      expect(getLatestVersion).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(listConfiguredPlugins).not.toHaveBeenCalled();

      done();
    }
  });

  it('should throw an exception if plugin version is not found', async (done) => {
    const option = {
      ...requestObject,
      addPlugins: [`${plugin1.unique_name}@version1`],
    };
    getVersion.mockRejectedValue('plugin version not found');

    try {
      await script(option);
    } catch (e) {
      expect(e).toEqual('plugin version not found');

      expect(getPlugin).toHaveBeenCalledTimes(1);
      expect(getPlugin).toHaveBeenCalledWith(plugin1.unique_name);
      expect(getVersion).toHaveBeenCalledTimes(1);
      expect(getVersion).toHaveBeenCalledWith(plugin1.unique_name, 'version1');
      expect(getLatestVersion).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(listConfiguredPlugins).not.toHaveBeenCalled();

      done();
    }
  });

  it('should throw an exception create configuration fails', async (done) => {
    const option = {
      ...requestObject,
      addPlugins: [`${plugin1.unique_name}@version1`],
    };
    getVersion.mockResolvedValue(pluginVersion1);
    create.mockRejectedValue('failed to create configuration');

    try {
      await script(option);
    } catch (e) {
      expect(e).toEqual('failed to create configuration');

      expect(getPlugin).toHaveBeenCalledTimes(1);
      expect(getPlugin).toHaveBeenCalledWith(plugin1.unique_name);
      expect(getVersion).toHaveBeenCalledTimes(1);
      expect(getVersion).toHaveBeenCalledWith(plugin1.unique_name, 'version1');
      expect(getLatestVersion).not.toHaveBeenCalled();
      expect(create).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledWith({
        Name: requestObject.name,
        Plugins: [{ plugin_version: pluginVersion1.sid, phase: 3 }],
      });
      expect(listConfiguredPlugins).not.toHaveBeenCalled();

      done();
    }
  });

  it('should create new configuration', async () => {
    const option = {
      addPlugins: ['plugin1@version1'],
      ...requestObject,
    };
    getVersion.mockResolvedValue(pluginVersion1);
    create.mockResolvedValue(configuration);
    getPlugin.mockResolvedValue(plugin1);
    // @ts-ignore
    listConfiguredPlugins.mockResolvedValue({ plugins: [configuredPlugin1], meta: null });

    const result = await script(option);
    expect(activeRelease).not.toHaveBeenCalled();
    expect(getPlugin).toHaveBeenCalledTimes(2);
    expect(getPlugin).toHaveBeenCalledWith(plugin1.unique_name);
    expect(getPlugin).toHaveBeenCalledWith(plugin1.sid);
    expect(getVersion).toHaveBeenCalledTimes(2);
    expect(getVersion).toHaveBeenCalledWith(plugin1.unique_name, 'version1');
    expect(getVersion).toHaveBeenCalledWith(plugin1.sid, pluginVersion1.sid);
    expect(getLatestVersion).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      Name: requestObject.name,
      Plugins: [{ plugin_version: pluginVersion1.sid, phase: 3 }],
    });
    expect(listConfiguredPlugins).toHaveBeenCalledTimes(1);
    expect(listConfiguredPlugins).toHaveBeenCalledWith(configuration.sid);

    expect(result).toEqual({
      sid: configuration.sid,
      name: configuration.name,
      description: configuration.description,
      plugins: [
        {
          pluginSid: configuredPlugin1.plugin_sid,
          pluginVersionSid: configuredPlugin1.plugin_version_sid,
          name: configuredPlugin1.unique_name,
          version: configuredPlugin1.version,
          url: configuredPlugin1.plugin_url,
          phase: configuredPlugin1.phase,
          friendlyName: plugin1.friendly_name,
          description: plugin1.description,
          changelog: pluginVersion1.changelog,
          isPrivate: configuredPlugin1.private,
        },
      ],
      dateCreated: configuration.date_created,
    });
  });

  it('should create new configuration from active configuration', async () => {
    const option = {
      addPlugins: [`${plugin1.unique_name}@version1`],
      fromConfiguration: 'active',
      ...requestObject,
    };
    getVersion.mockImplementation(async (id) => {
      if (id === plugin1.sid || id === plugin1.unique_name) {
        return Promise.resolve(pluginVersion1);
      }

      return Promise.resolve(pluginVersion2);
    });
    create.mockResolvedValue(configuration);
    getPlugin.mockImplementation(async (id) => {
      if (id === plugin1.sid || id === plugin1.unique_name) {
        return Promise.resolve(plugin1);
      }

      return Promise.resolve(plugin2);
    });
    activeRelease.mockResolvedValue(release);
    // @ts-ignore
    listConfiguredPlugins.mockImplementation(async (configSid: string) => {
      if (configSid === release.configuration_sid) {
        return Promise.resolve({ plugins: [configuredPlugin2], meta: null });
      }

      return Promise.resolve({ plugins: [configuredPlugin1, configuredPlugin2], meta: null });
    });

    const result = await script(option);
    expect(activeRelease).toHaveBeenCalledTimes(1);
    expect(getPlugin).toHaveBeenCalledTimes(4);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin1.unique_name);
    expect(getPlugin).not.toHaveBeenCalledWith(configuredPlugin2.unique_name);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin1.plugin_sid);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin2.plugin_sid);
    expect(getVersion).toHaveBeenCalledTimes(4);
    expect(getVersion).toHaveBeenCalledWith(plugin1.unique_name, 'version1');
    expect(getVersion).toHaveBeenCalledWith(plugin1.sid, pluginVersion1.sid);
    expect(getVersion).not.toHaveBeenCalledWith(plugin2.unique_name, pluginVersion2.version);
    expect(getVersion).toHaveBeenCalledWith(plugin2.sid, pluginVersion2.sid);
    expect(getLatestVersion).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      Name: requestObject.name,
      Plugins: [
        { plugin_version: pluginVersion1.sid, phase: 3 },
        { plugin_version: pluginVersion2.sid, phase: 3 },
      ],
    });
    expect(listConfiguredPlugins).toHaveBeenCalledTimes(2);
    expect(listConfiguredPlugins).toHaveBeenCalledWith(configuration.sid);
    expect(listConfiguredPlugins).toHaveBeenCalledWith(release.configuration_sid);

    expect(result).toEqual({
      sid: configuration.sid,
      name: configuration.name,
      description: configuration.description,
      plugins: [
        {
          pluginSid: configuredPlugin1.plugin_sid,
          pluginVersionSid: configuredPlugin1.plugin_version_sid,
          name: configuredPlugin1.unique_name,
          version: configuredPlugin1.version,
          url: configuredPlugin1.plugin_url,
          phase: configuredPlugin1.phase,
          friendlyName: plugin1.friendly_name,
          description: plugin1.description,
          changelog: pluginVersion1.changelog,
          isPrivate: configuredPlugin1.private,
        },
        {
          pluginSid: configuredPlugin2.plugin_sid,
          pluginVersionSid: configuredPlugin2.plugin_version_sid,
          name: configuredPlugin2.unique_name,
          version: configuredPlugin2.version,
          url: configuredPlugin2.plugin_url,
          phase: configuredPlugin2.phase,
          friendlyName: plugin2.friendly_name,
          description: plugin2.description,
          changelog: pluginVersion2.changelog,
          isPrivate: configuredPlugin2.private,
        },
      ],
      dateCreated: configuration.date_created,
    });
  });

  it('should create new configuration from given configuration', async () => {
    const option = {
      addPlugins: [`${plugin1.unique_name}@version1`],
      fromConfiguration: release.configuration_sid,
      ...requestObject,
    };
    getVersion.mockImplementation(async (id) => {
      if (id === plugin1.sid || id === plugin1.unique_name) {
        return Promise.resolve(pluginVersion1);
      }

      return Promise.resolve(pluginVersion2);
    });
    create.mockResolvedValue(configuration);
    getPlugin.mockImplementation(async (id) => {
      if (id === plugin1.sid || id === plugin1.unique_name) {
        return Promise.resolve(plugin1);
      }

      return Promise.resolve(plugin2);
    });
    activeRelease.mockResolvedValue(release);
    // @ts-ignore
    listConfiguredPlugins.mockImplementation(async (configSid: string) => {
      if (configSid === release.configuration_sid) {
        return Promise.resolve({ plugins: [configuredPlugin2], meta: null });
      }

      return Promise.resolve({ plugins: [configuredPlugin1, configuredPlugin2], meta: null });
    });

    const result = await script(option);
    expect(activeRelease).not.toHaveBeenCalled();
    expect(getPlugin).toHaveBeenCalledTimes(4);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin1.unique_name);
    expect(getPlugin).not.toHaveBeenCalledWith(configuredPlugin2.unique_name);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin1.plugin_sid);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin2.plugin_sid);
    expect(getVersion).toHaveBeenCalledTimes(4);
    expect(getVersion).toHaveBeenCalledWith(plugin1.unique_name, 'version1');
    expect(getVersion).toHaveBeenCalledWith(plugin1.sid, pluginVersion1.sid);
    expect(getVersion).not.toHaveBeenCalledWith(plugin2.unique_name, pluginVersion2.version);
    expect(getVersion).toHaveBeenCalledWith(plugin2.sid, pluginVersion2.sid);
    expect(getLatestVersion).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      Name: requestObject.name,
      Plugins: [
        { plugin_version: pluginVersion1.sid, phase: 3 },
        { plugin_version: pluginVersion2.sid, phase: 3 },
      ],
    });
    expect(listConfiguredPlugins).toHaveBeenCalledTimes(2);
    expect(listConfiguredPlugins).toHaveBeenCalledWith(configuration.sid);
    expect(listConfiguredPlugins).toHaveBeenCalledWith(release.configuration_sid);

    expect(result).toEqual({
      sid: configuration.sid,
      name: configuration.name,
      description: configuration.description,
      plugins: [
        {
          pluginSid: configuredPlugin1.plugin_sid,
          pluginVersionSid: configuredPlugin1.plugin_version_sid,
          name: configuredPlugin1.unique_name,
          version: configuredPlugin1.version,
          url: configuredPlugin1.plugin_url,
          phase: configuredPlugin1.phase,
          friendlyName: plugin1.friendly_name,
          description: plugin1.description,
          changelog: pluginVersion1.changelog,
          isPrivate: configuredPlugin1.private,
        },
        {
          pluginSid: configuredPlugin2.plugin_sid,
          pluginVersionSid: configuredPlugin2.plugin_version_sid,
          name: configuredPlugin2.unique_name,
          version: configuredPlugin2.version,
          url: configuredPlugin2.plugin_url,
          phase: configuredPlugin2.phase,
          friendlyName: plugin2.friendly_name,
          description: plugin2.description,
          changelog: pluginVersion2.changelog,
          isPrivate: configuredPlugin2.private,
        },
      ],
      dateCreated: configuration.date_created,
    });
  });

  it('should create new configuration from an release that is null', async () => {
    const option = {
      ...requestObject,
      addPlugins: [`${plugin1.unique_name}@version1`],
      fromConfiguration: 'active',
    };
    getVersion.mockImplementation(async (id) => {
      if (id === plugin1.sid || id === plugin1.unique_name) {
        return Promise.resolve(pluginVersion1);
      }

      return Promise.resolve(pluginVersion2);
    });
    create.mockResolvedValue(configuration);
    getPlugin.mockImplementation(async (id) => {
      if (id === plugin1.sid || id === plugin1.unique_name) {
        return Promise.resolve(plugin1);
      }

      return Promise.resolve(plugin2);
    });
    activeRelease.mockResolvedValue(null);
    // @ts-ignore
    listConfiguredPlugins.mockImplementation(async (configSid: string) => {
      if (configSid === configuration.sid) {
        return Promise.resolve({ plugins: [configuredPlugin1], meta: null });
      }

      return Promise.resolve({ plugins: [configuredPlugin1, configuredPlugin2], meta: null });
    });

    const result = await script(option);
    expect(activeRelease).toHaveBeenCalledTimes(1);
    expect(getPlugin).toHaveBeenCalledTimes(2);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin1.unique_name);
    expect(getPlugin).toHaveBeenCalledWith(configuredPlugin1.plugin_sid);
    expect(getVersion).toHaveBeenCalledTimes(2);
    expect(getVersion).toHaveBeenCalledWith(plugin1.unique_name, 'version1');
    expect(getVersion).toHaveBeenCalledWith(plugin1.sid, pluginVersion1.sid);
    expect(getLatestVersion).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      Name: requestObject.name,
      Plugins: [{ plugin_version: pluginVersion1.sid, phase: 3 }],
    });
    expect(listConfiguredPlugins).toHaveBeenCalledTimes(1);
    expect(listConfiguredPlugins).toHaveBeenCalledWith(configuration.sid);

    expect(result).toEqual({
      sid: configuration.sid,
      name: configuration.name,
      description: configuration.description,
      plugins: [
        {
          pluginSid: configuredPlugin1.plugin_sid,
          pluginVersionSid: configuredPlugin1.plugin_version_sid,
          name: configuredPlugin1.unique_name,
          version: configuredPlugin1.version,
          url: configuredPlugin1.plugin_url,
          phase: configuredPlugin1.phase,
          friendlyName: plugin1.friendly_name,
          description: plugin1.description,
          changelog: pluginVersion1.changelog,
          isPrivate: configuredPlugin1.private,
        },
      ],
      dateCreated: configuration.date_created,
    });
  });

  it('should create fetch plugin version by latest', async (done) => {
    const option = {
      ...requestObject,
      addPlugins: ['plugin1@latest'],
    };
    getVersion.mockResolvedValue(pluginVersion1);
    create.mockResolvedValue(configuration);

    try {
      await script(option);
    } catch (e) {
      // not really testing the rejection; just testing @latest is respected

      expect(getPlugin).toHaveBeenCalledTimes(1);
      expect(getPlugin).toHaveBeenCalledWith(plugin1.unique_name);
      expect(getVersion).not.toHaveBeenCalled();
      expect(getLatestVersion).toHaveBeenCalledTimes(1);
      expect(getLatestVersion).toHaveBeenCalledWith(plugin1.unique_name);

      done();
    }
  });
});
