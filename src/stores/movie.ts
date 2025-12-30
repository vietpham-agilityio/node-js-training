import { create } from 'zustand';

// Types
import { Movie } from '@/features/booking/types/movie';

interface MovieState {
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  clearSelectedMovie: () => void;
}

export const useMovieStore = create<MovieState>(set => ({
  selectedMovie: null,
  setSelectedMovie: movie => set({ selectedMovie: movie }),
  clearSelectedMovie: () => set({ selectedMovie: null }),
}));
