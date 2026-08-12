// Sprint 15 - Redux Toolkit: createSlice con 'condition' en createAsyncThunk para cachear peticiones ya resueltas.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts } from "../api/products";

const initialState = {
  items: null, // null = "todavía no se ha pedido nunca"; [] = "pedido, vacío"
  loading: false,
  error: null,
};

// El segundo argumento (condition) es la clave de la caché: si ya hay
// productos cargados (o ya hay una petición en curso), el thunk se
// cancela ANTES de llegar al payloadCreator — ni siquiera dispara la
// petición HTTP. Así HomePage, ProductsPage y WishlistPage pueden
// despachar fetchProducts() cada una sin preocuparse de duplicar la
// llamada a la API: solo la primera hace la petición de verdad.
//
// Para forzar una recarga real (por ejemplo, tras editar productos en el
// admin) despacha fetchProducts(true) en vez de fetchProducts().
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_forceRefetch, { rejectWithValue }) => {
    try {
      return await getProducts();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (forceRefetch = false, { getState }) => {
      const { items, loading } = getState().products;
      if (loading) return false; // ya hay una petición en vuelo
      if (items && !forceRefetch) return false; // ya cargados, no forzado
    },
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;