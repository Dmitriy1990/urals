import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchBrandsByNumber,
  fetchAnalogues,
  groupBrands,
  flattenAnalogueOffers,
} from '../api/priceApi';

function isAbortError(err) {
  return err?.name === 'AbortError';
}

export const searchBrands = createAsyncThunk(
  'parts/searchBrands',
  async (number, { rejectWithValue, signal, getState }) => {
    const requestId = getState().parts.brandsRequestId;
    try {
      const goods = await fetchBrandsByNumber(number, signal);
      const brands = groupBrands(goods);
      if (brands.length === 0) {
        return rejectWithValue('По указанному артикулу производители не найдены.');
      }
      return { number, brands, requestId };
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      return rejectWithValue(err.message || 'Ошибка при поиске производителей.');
    }
  },
);

export const loadAnalogues = createAsyncThunk(
  'parts/loadAnalogues',
  async ({ number, brand }, { rejectWithValue, signal, getState }) => {
    const requestId = getState().parts.analoguesRequestId;
    try {
      const goods = await fetchAnalogues(number, brand, signal);
      const offers = flattenAnalogueOffers(goods);
      if (offers.length === 0) {
        return rejectWithValue('Аналоги и предложения не найдены.');
      }
      return { brand, offers, requestId };
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      return rejectWithValue(err.message || 'Ошибка при загрузке аналогов.');
    }
  },
);

const initialState = {
  partNumber: '',
  brands: [],
  selectedBrand: null,
  offers: [],
  brandFilter: '',
  offersFilter: {
    query: '',
    inStockOnly: false,
    sort: 'price-asc',
  },
  brandsRequestId: 0,
  analoguesRequestId: 0,
  brandsStatus: 'idle',
  brandsError: null,
  analoguesStatus: 'idle',
  analoguesError: null,
};

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setPartNumber(state, action) {
      state.partNumber = action.payload;
    },
    setBrandFilter(state, action) {
      state.brandFilter = action.payload;
    },
    setOffersFilter(state, action) {
      state.offersFilter = { ...state.offersFilter, ...action.payload };
    },
    resetOffersFilter(state) {
      state.offersFilter = initialState.offersFilter;
    },
    resetSearch(state) {
      state.brands = [];
      state.selectedBrand = null;
      state.offers = [];
      state.brandFilter = '';
      state.offersFilter = initialState.offersFilter;
      state.brandsStatus = 'idle';
      state.brandsError = null;
      state.analoguesStatus = 'idle';
      state.analoguesError = null;
    },
    selectBrand(state, action) {
      state.selectedBrand = action.payload;
      state.offers = [];
      state.offersFilter = initialState.offersFilter;
      state.analoguesStatus = 'idle';
      state.analoguesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state) => {
        state.brandsRequestId += 1;
        state.brandsStatus = 'loading';
        state.brandsError = null;
        state.brands = [];
        state.brandFilter = '';
        state.selectedBrand = null;
        state.offers = [];
        state.offersFilter = initialState.offersFilter;
        state.analoguesStatus = 'idle';
        state.analoguesError = null;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        if (action.payload.requestId !== state.brandsRequestId) return;
        state.brandsStatus = 'succeeded';
        state.partNumber = action.payload.number;
        state.brands = action.payload.brands;
      })
      .addCase(searchBrands.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.brandsStatus = 'failed';
        state.brandsError = action.payload || action.error.message;
        state.brands = [];
      })
      .addCase(loadAnalogues.pending, (state) => {
        state.analoguesRequestId += 1;
        state.analoguesStatus = 'loading';
        state.analoguesError = null;
        state.offers = [];
      })
      .addCase(loadAnalogues.fulfilled, (state, action) => {
        if (action.payload.requestId !== state.analoguesRequestId) return;
        state.analoguesStatus = 'succeeded';
        state.selectedBrand = action.payload.brand;
        state.offers = action.payload.offers;
      })
      .addCase(loadAnalogues.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.analoguesStatus = 'failed';
        state.analoguesError = action.payload || action.error.message;
        state.offers = [];
      });
  },
});

export const {
  setPartNumber,
  resetSearch,
  selectBrand,
  setBrandFilter,
  setOffersFilter,
  resetOffersFilter,
} = partsSlice.actions;
export default partsSlice.reducer;
