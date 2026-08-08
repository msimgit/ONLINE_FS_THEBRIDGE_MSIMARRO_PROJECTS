import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  meRequest,
} from "../api/auth";

// No guardamos token: viaja en una cookie httpOnly que JS no puede leer.
// isAuthenticated se deriva de si el backend nos reconoce (via /me) o no.
const initialState = {
  user: null,
  isAuthenticated: false,
  authChecked: false, // true en cuanto checkAuth() responde (éxito o fallo)
  loading: false,
  error: null,
};

const extractError = (error, fallback) =>
  error.response?.data?.error || fallback;

// Thunks: cada uno hace la llamada async y Redux gestiona pending/fulfilled/rejected
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginRequest(credentials); // { user }
    } catch (error) {
      return rejectWithValue(extractError(error, "Error al iniciar sesión"));
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      return await registerRequest(userData); // { user }
    } catch (error) {
      return rejectWithValue(extractError(error, "Error al registrarse"));
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutRequest(); // el backend limpia la cookie
      return true;
    } catch (error) {
      return rejectWithValue(extractError(error, "Error al cerrar sesión"));
    }
  },
);

// Se dispara al arrancar la app: si /me responde, la cookie sigue siendo válida
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      return await meRequest(); // { user }
    } catch (error) {
      return rejectWithValue(null); // sin sesión, no es un "error" que mostrar
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Disparado por el interceptor de axios cuando un endpoint protegido
    // devuelve 401 (sesión caducada/inválida a mitad de uso).
    sessionExpired: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // checkAuth (al recargar la página)
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.authChecked = true;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.authChecked = true;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// Selector: deriva si el usuario actual es admin a partir de su rol
export const selectIsAdmin = (state) => {
  return state.auth.user?.role === "ADMIN";
};

export default authSlice.reducer;
