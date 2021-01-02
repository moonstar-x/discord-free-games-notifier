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
})