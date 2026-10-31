import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as cartService from "../services/cartService.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROLES } from "../utils/constants.js";

export const CartContext = createContext(null);

const EMPTY_VIEW = { items: [], vendorGroups: [], totals: { subtotal: 0, shipping: 0, gst: 0, total: 0 }, checkoutIssues: [], itemCount: 0 };

export function CartProvider({ children }) {
  const { role } = useAuth();
  const [view, setView] = useState(EMPTY_VIEW);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (role !== ROLES.BUYER) {
      setView(EMPTY_VIEW);
      return;
    }
    setLoading(true);
    try {
      const result = await cartService.getCart();
      setView(result);
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Re-fetches on every role change (login, logout, role switch) so the
  // cart never shows a previous session's items, and picks up server-side
  // changes (a vendor suspension, a price edit) made elsewhere.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const assertBuyer = useCallback(() => {
    if (role !== ROLES.BUYER) {
      throw new Error("Only buyer accounts can do this. Switch to a buyer account to continue.");
    }
  }, [role]);

  const add = useCallback(
    async (product, qty) => {
      assertBuyer();
      const result = await cartService.addItem(product.id, qty);
      setView(result);
    },
    [assertBuyer]
  );
  const updateQty = useCallback(async (productId, qty) => {
    const result = await cartService.updateItemQty(productId, qty);
    setView(result);
  }, []);
  const remove = useCallback(async (productId) => {
    const result = await cartService.removeItem(productId);
    setView(result);
  }, []);
  const clear = useCallback(async () => {
    const result = await cartService.clearCart();
    setView(result);
  }, []);

  const moqWarnings = useMemo(
    () => view.items.filter((i) => i.qty < i.moq).map((i) => ({ productId: i.productId, name: i.name, moq: i.moq, moqUnit: i.moqUnit, qty: i.qty })),
    [view.items]
  );
  const hasUnavailableItems = useMemo(() => view.items.some((i) => i.unavailable), [view.items]);

  const value = useMemo(
    () => ({ ...view, loading, add, remove, updateQty, clear, refresh, moqWarnings, hasUnavailableItems }),
    [view, loading, add, remove, updateQty, clear, refresh, moqWarnings, hasUnavailableItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
