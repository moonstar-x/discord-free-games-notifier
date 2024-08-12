import { randomItem } from './array';

describe('Utils > Array', () => {
  describe('randomItem()', () => {
    it('should be defined.', () => {
      expect(randomItem).toBeDefined();
    });

    it('should return an item from the array.', () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const result = randomItem(arr);

      expect(arr).toContain(result);
    });
  });
});
