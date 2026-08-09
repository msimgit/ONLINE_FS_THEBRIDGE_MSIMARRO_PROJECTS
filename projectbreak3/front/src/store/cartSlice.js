import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCartRequest,
  addCartItemRequest,
  updateCartItemRequest,
  removeCartItemRequest,
  getOrderBySessionRequest,
} from "../api/cart";

// guestItems: carrito de un usuario SIN sesión. Vive solo en Redux (nunca
// llega al backend, que exige auth en /cart) hasta que hace login — en ese
// momento mergeGuestCart() lo traslada al carrito real del servidor.
const initialState = {
  cart: null,
  guestItems: [],
  order: null, // último pedido confirmado, útil para CheckoutSuccessPage
  loading: false,
  error: null,
};

const extractError = (error, fallback) =>
  error.response?.data?.error || fallback;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { cart } = await fetchCartRequest();
      return cart;
    } catch (error) {
      return rejectWithValue(extractError(error, "Error al cargar el carrito"));
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { cart } = await addCartItemRequest({ productId, quantity });
      return cart;
    } catch (error) {
      return rejectWithValue(
        extractError(error, "Error al añadir el producto"),
      );
    }
  },
);

// itemId = id del CartItem (no del producto). Usado por los botones -/+
// tanto en el drawer como en /cart, ya que ambos reutilizan CartItem.jsx.
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { cart } = await updateCartItemRequest(itemId, quantity);
      return cart;
    } catch (error) {
      return rejectWithValue(
        extractError(error, "Error al actualizar la cantidad"),
      );
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const { cart } = await removeCartItemRequest(itemId);
      return cart;
    } catch (error) {
      return rejectWithValue(
        extractError(error, "Error al eliminar el producto"),
      );
    }
  },
);

// No hay endpoint de "vaciar todo" en el backend: quitamos cada item con
// el DELETE que ya existe, uno a uno, y nos quedamos con el último cart
// que nos devuelva (que ya estará vacío).
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart } = getState().cart;
      const items = cart?.items ?? [];

      let updatedCart = cart;
      for (const item of items) {
        const { cart: nextCart } = await removeCartItemRequest(item.id);
        updatedCart = nextCart;
      }

      return updatedCart;
    } catch (error) {
      return rejectWithValue(extractError(error, "Error al vaciar el carrito"));
    }
  },
);

// Se dispara justo después de un login/registro con éxito (ver LoginPage).
// Traslada cada línea del carrito local al carrito real del servidor,
// vacía el carrito de invitado, y refresca el carrito ya fusionado.
export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { guestItems } = getState().cart;

      for (const item of guestItems) {
        await addCartItemRequest({
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      dispatch(clearGuestCart());
      const { cart } = await fetchCartRequest();
      return cart;
    } catch (error) {
      return rejectWithValue(
        extractError(error, "Error al fusionar el carrito"),
      );
    }
  },
);

// El pedido lo crea el webhook de Stripe, no este thunk. Aquí solo se
// CONSULTA por sessionId, con un par de reintentos cortos por si el
// webhook aún no ha llegado cuando el navegador ya redirigió a
// /checkout/success (son dos caminos independientes desde Stripe:
// el webhook al backend, y el 303 al navegador; no hay garantía de
// cuál llega antes).
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 1500;

export const confirmOrderBySession = createAsyncThunk(
  "cart/confirmOrderBySession",
  async (sessionId, { rejectWithValue }) => {
    try {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const { order } = await getOrderBySessionRequest(sessionId);
        if (order) return order;
        if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
      }
      return rejectWithValue(
        "Tu pago se está confirmando. Si tarda más de un minuto, revisa tu email o contacta con soporte.",
      );
    } catch (error) {
      return rejectWithValue(
        extractError(error, "Error al confirmar el pedido"),
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Carrito de invitado: todo síncrono, sin tocar el backend.
    addGuestItem: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.guestItems.find(
        (item) => item.productId === product.id,
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.guestItems.push({
          id: `guest-${product.id}`,
          productId: product.id,
          quantity,
          product,
        });
      }
    },
    updateGuestItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.guestItems.find((i) => i.id === itemId);
      if (item) item.quantity = quantity;
    },
    removeGuestItem: (state, action) => {
      state.guestItems = state.guestItems.filter(
        (item) => item.id !== action.payload,
      );
    },
    clearGuestCart: (state) => {
      state.guestItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addCartItem
      .addCase(addCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateCartItem
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // removeCartItem
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // mergeGuestCart
      .addCase(mergeGuestCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // confirmOrderBySession
      .addCase(confirmOrderBySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmOrderBySession.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.cart = null; // tras el pedido, el carrito queda vacío
      })
      .addCase(confirmOrderBySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addGuestItem,
  updateGuestItemQuantity,
  removeGuestItem,
  clearGuestCart,
} = cartSlice.actions;

export default cartSlice.reducer;
