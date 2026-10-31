import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as wishlistService from "../services/wishlistService.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROLES } from "../utils/constants.js";

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { role } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (role !== ROLES.BUYER) {
      setItems([]);
      return;
    }
    setItems(await wishlistService.getWishlist());
  }, [role]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const assertBuyer = useCallback(() => {
    if (role !== ROLES.BUYER) {
      throw new Error("Only buyer accounts can use the wishlist. Switch to a buyer account to continue.");
    }
  }, [role]);

  const has = useCallback((productId) => items.some((item) => item.productId === productId), [items]);

  const add = useCallback(
    async (product) => {
      assertBuyer();
      setItems(await wishlistService.addToWishlist(product.id));
    },
    [assertBuyer]
  );
  const remove = useCallback(async (productId) => {
    setItems(await wishlistService.removeFromWishlist(productId));
  }, []);
  const toggle = useCallback(
    async (product) => {
      if (!has(product.id)) assertBuyer();
      setItems(has(product.id) ? await wishlistService.removeFromWishlist(product.id) : await wishlistService.addToWishlist(product.id));
    },
    [assertBuyer, has]
  );

  const value = useMemo(() => ({ items, add, remove, has, toggle, refresh }), [items, add, remove, has, toggle, refresh]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
