import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  isAnyOf
} from '@reduxjs/toolkit';
import {OfferDTO, ReviewDTO, SortType} from '../Types/Offer/Offer.ts';
import {AxiosInstance} from 'axios';
import {Guid} from '../Types/Common.ts';
import {RootState} from '../index.tsx';
import {CommentData} from '../Pages/Offer/CommentForm.tsx';

export interface OffersState {
  offers: EntityState<OfferDTO>;
  offer?: OfferDTO;
  nearPlaces?: OfferDTO[];
  reviews: ReviewDTO[] | null;
  isLoading: boolean;
  error: string | null;
  city: string;
  sortType: SortType;
}

const offersAdapter = createEntityAdapter<OfferDTO>({
  selectId: (offer) => offer.id,
});

const initialState: OffersState = {
  offers: offersAdapter.getInitialState(),
  offer: undefined,
  reviews: null,
  isLoading: false,
  error: null,
  city: 'Paris',
  sortType: 'Popular',
};

export const offersSelectors = offersAdapter.getSelectors<RootState>(
  (state) => state.offers.offers
);

export const selectFavorites = createSelector(
  (state: RootState) => state.offers.offers,
  (offersState) => {
    const offers = offersAdapter.getSelectors().selectAll(offersState);
    return offers.filter((offer) => offer.isFavorite);
  }
);

export const selectFilteredOffers = createSelector(
  (state: RootState) => state.offers.offers,
  (state: RootState) => state.offers.city,
  (state: RootState) => state.offers.sortType,
  (offersState, city, sortType) => {
    const offers = offersAdapter.getSelectors().selectAll(offersState);

    const filtered = offers.filter((offer) => offer.city.name === city);

    switch (sortType) {
      case 'Price: low to high':
        return filtered.sort((a, b) => a.price - b.price);
      case 'Price: high to low':
        return filtered.sort((a, b) => b.price - a.price);
      case 'Top rated first':
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }
);

export const fetchOffersThunk = createAsyncThunk<OfferDTO[], void, { extra: AxiosInstance }>(
  'offers/fetchOffers',
  async (_, {extra: api}) => {
    const response = await api.get<OfferDTO[]>('/offers');
    return response.data;
  }
);

export const fetchOfferThunk = createAsyncThunk<OfferDTO, {id: Guid}, { extra: AxiosInstance }>(
  'offers/fetchOffer',
  async ({id}, {extra: api}) => {
    const response = await api.get<OfferDTO>(`/offers/${id}`);
    return response.data;
  }
);

export const fetchNearbyOffersThunk = createAsyncThunk<OfferDTO[], {id: Guid}, { extra: AxiosInstance }>(
  'offers/fetchNearbyOffers',
  async ({id}, {extra: api}) => {
    const response = await api.get<OfferDTO[]>(`/offers/${id}/nearby`);
    return response.data;
  }
);

export const fetchReviewsThunk = createAsyncThunk<ReviewDTO[], {id: Guid}, { extra: AxiosInstance }>(
  'offers/fetchReviewsThunk',
  async ({id}, {extra: api}) => {
    const response = await api.get<ReviewDTO[]>(`/comments/${id}`);
    return response.data;
  }
);

export const addReviewThunk = createAsyncThunk<ReviewDTO, {id: Guid; data: CommentData}, { extra: AxiosInstance }>(
  'offers/addReviewThunk',
  async ({id, data}, {extra: api}) => {
    const response = await api.post<ReviewDTO>(`/comments/${id}`, data);
    return response.data;
  }
);

export const fetchFavoritesThunk = createAsyncThunk<OfferDTO[], void, { extra: AxiosInstance }>(
  'offers/fetchFavorites',
  async (_, {extra: api}) => {
    const response = await api.get<OfferDTO[]>('/favorite');
    const favorites = response.data;

    return favorites.map((offer) => ({
      ...offer,
      isFavorite: true,
    }));
  }
);

export const toggleFavoritesThunk = createAsyncThunk<OfferDTO, { id: Guid; status: number }, { extra: AxiosInstance }>(
  'offers/toggleFavorite',
  async ({id, status}, {extra: api}) => {
    const response = await api.post<OfferDTO>(`favorite/${id}/${status}`);
    return response.data;
  }
);

const offersSlice = createSlice({
  name: 'offers',
  initialState: initialState,
  reducers: {
    setCity(state, action) {
      state.city = action.payload as string;
    },
    setSortType(state, action) {
      state.sortType = action.payload as SortType;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        offersAdapter.upsertMany(state.offers, action.payload);
      })
      .addCase(fetchOffersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch offers';
      })
      .addCase(fetchOfferThunk.fulfilled, (state, action) => {
        state.offer = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchOfferThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch offers';
        state.offer = undefined;
      })
      .addCase(fetchNearbyOffersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearPlaces = action.payload;
      })
      .addCase(fetchNearbyOffersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch offers';
        state.nearPlaces = undefined;
      })
      .addCase(fetchReviewsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch offers';
        state.reviews = null;
      })
      .addCase(addReviewThunk.fulfilled, (state, action) => {
        state.reviews?.push(action.payload);
        state.isLoading = false;
      })
      .addCase(fetchFavoritesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        offersAdapter.upsertMany(state.offers, action.payload);
      })
      .addCase(fetchFavoritesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to fetch favorites';
      })
      .addCase(toggleFavoritesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        offersAdapter.upsertOne(state.offers, action.payload);
        if (state.offer?.id === action.payload.id) {
          state.offer = action.payload;
        }
      })
      .addCase(toggleFavoritesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to update favorite';
      })
      .addMatcher(isAnyOf(fetchOffersThunk.pending, fetchOfferThunk.pending), (state) => {
        state.isLoading = true;
      });
  },
});

export const {setCity, setSortType} = offersSlice.actions;
export const offersReducer = offersSlice.reducer;

export const { selectAll: selectAllOffers, selectById: selectOfferById } = offersAdapter.getSelectors<RootState>((state) => state.offers.offers);
