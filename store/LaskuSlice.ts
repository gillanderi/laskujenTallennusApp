import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface SkannattuData {
  tilinumero: string;
  summa: string;
  viitenumero: string;
  erapaiva: string;
}

export interface Lasku {
  id: number;
  maksunSaaja: string;
  tilinumero: string;
  erapaiva: string;
  summa: number;
  viitenumero: string;
  onMaksettu: boolean;
}

export interface LaskuState {
  skannattuData: SkannattuData | null;
  laskut: Lasku[];
}

const initialState: LaskuState = {
  skannattuData: null,
  laskut: [],
};

export const laskuSlice = createSlice({
  name: 'lasku',
  initialState,
  reducers: {
    setSkannattuData: (state, action: PayloadAction<SkannattuData>) => {
      state.skannattuData = action.payload;
    },
    lisaaLasku: (state, action: PayloadAction<Lasku>) => {
      state.laskut.push(action.payload);
    },
    paivitaLasku: (state, action: PayloadAction<Lasku>) => {
      const index = state.laskut.findIndex(lasku => lasku.id === action.payload.id);
      if (index !== -1) {
        state.laskut[index] = action.payload;
      }
    },
    merkkaaMaksetuksi: (state, action: PayloadAction<number>) => {
      const index = state.laskut.findIndex(lasku => lasku.id === action.payload);
      if (index !== -1) {
        state.laskut[index].onMaksettu = true;
      }
    },
  },
});

export const { lisaaLasku, merkkaaMaksetuksi, setSkannattuData, paivitaLasku } = laskuSlice.actions;

export const selectLaskut = (state: RootState) => state.lasku.laskut;

export default laskuSlice.reducer;
