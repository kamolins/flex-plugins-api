import * as logger from '../logger';

jest.mock('chalk');

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const chalk = require('chalk');

chalk.bold = chalk.bold || {};

describe('Logger', () => {
  const OLD_ENV = process.env;

  const info = jest.fn();
  const warn = jest.fn();
  const error = jest.fn();

  const red = jest.fn();
  const yellow = jest.fn();
  const blue = jest.fn();
  const green = jest.fn();
  const boldGreen = jest.fn();
  const magenta = jest.fn();
  const cyan = jest.fn();

  chalk.cyan = cyan;
  chalk.bold.magenta = magenta;
  chalk.bold.green = boldGreen;
  chalk.red = red;
  chalk.yellow = yellow;
  chalk.blue = blue;
  chalk.green = green;

  global.console.info = info;
  global.console.warn = warn;
  global.console.error = error;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();

    process.env = { ...OLD_ENV };
  });

  it('should newline once', () => {
    const logInfo = jest.spyOn(logger, 'info');

    logger.newline();

    expect(logInfo).toHaveBeenCalledTimes(1);

    logInfo.mockRestore();
  });

  it('should newline three times', () => {
    const logInfo = jest.spyOn(logger, 'info');

    logger.newline(3);

    expect(logInfo).toHaveBeenCalledTimes(3);

    logInfo.mockRestore();
  });

  it('should log warning', () => {
    logger.warning('var1', 'var2');

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('var1 var2');
    expect(yellow).toHaveBeenCalledTimes(1);
    expect(yellow).toHaveBeenCalledWith('var1 var2');
  });

  it('should log error', () => {
    logger.error('var1', 'var2');

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('var1 var2');
    expect(red).toHaveBeenCalledTimes(1);
    expect(red).toHaveBeenCalledWith('var1 var2');
  });

  it('should log success', () => {
    logger.success('var1', 'var2');

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('var1 var2');
    expect(green).toHaveBeenCalledTimes(1);
    expect(green).toHaveBeenCalledWith('var1 var2');
  });

  it('should log info', () => {
    logger.info('var1', 'var2');

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('var1 var2');
  });

  it('should call debug if debug is set', () => {
    process.env.DEBUG = 'true';
    logger.debug('var1', 'var2');

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('var1 var2');
  });
});
