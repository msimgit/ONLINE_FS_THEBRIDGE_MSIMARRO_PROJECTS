import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchWishlistRequest,
  addToWishlistRequest,
  removeFromWishlistRequest,
} from '../api/wishlist';

const initialState = {
  productIds: [],
  loading: false,
  error: null,
};

const extractError = (error, fallback) =>
  error.response?.data?.error || fallback;

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const { wishlist } = await fetchWishlistRequest();
      return wishlist.productIds;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Error al cargar la wishlist'));
    }
  },
);

// No hay endpoint único de "toggle" en el backend: decidimos aquí
// si el producto ya está en la lista para llamar a add o remove.
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { productIds } = getState().wishlist;
      const alreadyInWishlist = productIds.includes(productId);

      const { wishlist } = alreadyInWishlist
        ? await removeFromWishlistRequest(productId)
        : await addToWishlistRequest(productId);

      return wishlist.productIds;
    } catch (error) {
      return rejectWithValue(extractError(error, 'Error al actualizar la wishlist'));
    }
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.productIds = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // toggleWishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.productIds = action.payload;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default wishlistSlice.reducer;