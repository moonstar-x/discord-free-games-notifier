let context;

describe('Common - Context', () => {
  describe('DEBUG_ENABLED', () => {
    it('should return false if no --debug flag was used.', () => {
      const oldArgs = [...process.argv];
      process.argv = ['npm', 'start'];
      jest.resetModules();
      context = require('../../src/common/context');
  
      expect(context.DEBUG_ENABLED).toBe(false);
  
      process.argv = oldArgs;
    });
  
    it('should return true if --debug flag was used.', () => {
      const oldArgs = [...process.argv];
      process.argv = ['npm', 'start', '--debug'];
      jest.resetModules();
      context = require('../../src/common/context');
  
      expect(context.DEBUG_ENABLED).toBe(true);
  
      process.argv = oldArgs;
    });
  });

  describe('DEV_MODE', () => {
    it('should return true if NODE_ENV is set to development.', () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      context = require('../../src/common/context');

      expect(context.DEV_MODE).toBe(true);
    });

    it('should return false if NODE_ENV is not set to development.', () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      context = require('../../src/common/context');

      expect(context.DEV_MODE).toBe(false);
    });
  });
});
