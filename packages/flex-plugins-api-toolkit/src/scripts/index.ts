import { Pagination, PaginationMeta } from 'flex-plugins-api-client/dist/clients/client';

// Plugins API resources
export enum ResourceNames {
  Plugins = 'plugins',
  PluginVersions = 'plugin_versions',
  Configurations = 'configurations',
  Releases = 'releases',
}

export type Script<O, R> = (options: O) => Promise<R>;

export interface Page {
  page?: Pagination;
}

// The List Resources interface
export type ListResource<K extends ResourceNames, T> = {
  [key in K]: T[];
} &
  PaginationMeta;

export { default as deployScript, DeployScript, DeployOption, DeployPlugin } from './deploy';
export {
  default as createConfigurationScript,
  CreateConfigurationScript,
  CreateConfigurationOption,
  CreateConfiguration,
  InstalledPlugin,
} from './createConfiguration';
export { default as releaseScript, ReleaseScript, ReleaseOption, Release } from './release';
export {
  default as listPluginsScript,
  ListPluginsScripts,
  ListPluginsOption,
  ListPlugins,
  ListPluginsResource,
} from './listPlugins';
export {
  default as describePluginScript,
  DescribePluginScript,
  DescribePluginOption,
  DescribePlugin,
} from './describePlugin';
export {
  default as listPluginVersionsScript,
  ListPluginVersionsScripts,
  ListPluginVersionsOption,
  ListPluginVersions,
  ListPluginVersionsResource,
} from './listPluginVerions';
export {
  default as describePluginVersionScript,
  DescribePluginVersionScript,
  DescribePluginVersionOption,
  DescribePluginVersion,
} from './describePluginVersion';
export {
  default as listConfigurationsScript,
  ListConfigurationsScript,
  ListConfigurationsOption,
  ListConfigurations,
  ListConfigurationsResource,
} from './listConfigurations';
export {
  default as describeConfigurationScript,
  DescribeConfigurationScript,
  DescribeConfigurationOption,
  DescribeConfiguration,
} from './describeConfiguration';
export {
  default as listReleasesScript,
  ListReleasesScript,
  ListReleasesOption,
  ListReleases,
  ListReleasesResource,
} from './listReleases';
export {
  default as describeReleaseScript,
  DescribeReleaseScript,
  DescribeReleaseOption,
  DescribeRelease,
} from './describeRelease';
