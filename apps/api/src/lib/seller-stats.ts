import { db, COLLECTIONS } from './firestore.js';

/** Cantidad de órdenes COMPLETADA del vendedor (ventas concretadas). */
export async function getSellerCompletedSalesCount(sellerId: string): Promise<number> {
  const snap = await db().collection(COLLECTIONS.ORDERS).where('sellerId', '==', sellerId).get();
  return snap.docs.filter((doc) => doc.data().status === 'COMPLETADA').length;
}
