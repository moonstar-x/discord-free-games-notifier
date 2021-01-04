let context;

describe('Common - Context', () => {
  describe('isDebugEnabled', () => {
    it('should return false if no --debug flag was used.', () => {
      const oldArgs = [...process.argv];
      process.argv = ['npm', 'start'];
      jest.resetModules();
      context = require('../../src/common/context');
  
      expect(context.isDebugEnabled).toBe(false);
  
      process.argv = oldArgs;
    });
  
    it('should return true if --debug flag was used.', () => {
      const oldArgs = [...process.argv];
      process.argv = ['npm', 'start', '--debug'];
      jest.resetModules();
      context = require('../../src/common/context');
  
      expect(context.isDebugEnabled).toBe(true);
  
      process.argv = oldArgs;
    });
  });

  describe('devMode', () => {
    it('should return true if NODE_ENV is set to development.', () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      context = require('../../src/common/context');

      expect(context.devMode).toBe(true);
    });

    it('should return false if NODE_ENV is not set to development.', () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      context = require('../../src/common/context');

      expect(context.devMode).toBe(false);
    });
  });
});
