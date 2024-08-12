import { db } from './client';

jest.unmock('./client');

describe('Services > Database > Client', () => {
  describe('db', () => {
    it('should be defined.', () => {
      expect(db).toBeDefined();
    });
  });
});
