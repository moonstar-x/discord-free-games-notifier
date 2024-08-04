import { db } from '../../../services/database/client';

export const getStorefronts = async (): Promise<string[]> => {
  const query = 'SELECT get_storefronts() AS result';
  const result = await db.one<{ result: string[] }>(query);

  return result.result ?? [];
};
