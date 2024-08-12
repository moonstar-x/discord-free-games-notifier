export const randomItem = <T>(arr: Array<T> | ReadonlyArray<T>): T => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};
