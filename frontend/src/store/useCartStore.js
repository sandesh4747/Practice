import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,
  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");

      set({ coupon: res.data });
    } catch (error) {
      set({ coupon: null });
      toast.error(error.response?.data?.message || "An error occured");
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/coupons/validate", { code });
      set({ coupon: res.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occured");
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed successfully");
  },

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data });

      // After fetching the latest cart from backend,
      // we must recalculate totals (subtotal and total)
      // based on the fresh cart data
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response?.data?.message || "An error occured");
    }
  },
  clearCart: async () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Product added to cart");

      set((prevState) => {
        // Check if product already exists in cart
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );

        // If it exists, increase quantity; otherwise, add new item
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];

        return { cart: newCart }; // Update cart in state
      });

      // After updating the cart (adding a product),
      // we need to recalculate subtotal and total amounts
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occured");
    }
  },

  removeFromCart: async (productId) => {
    console.log(productId);
    await axios.delete(`/cart`, { data: { productId } });
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== productId),
    }));
    get().calculateTotals();
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }
    await axios.put(`/cart/${productId}`, { quantity });
    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      ),
    }));
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { cart, coupon } = get();

    // Calculate subtotal by summing price * quantity of each item
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let total = subtotal;

    // If a coupon is applied, calculate discount and apply to total
    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    // Update the calculated subtotal and total in the store
    set({ subtotal, total });
  },
}));
