import { act } from '@testing-library/react-native';

// Store
import { useMovieStore } from '../movie';

// Types
import { GenreMovie, Movie, MovieStatus } from '@/features/booking/types/movie';

const MOCK_MOVIE: Movie = {
  id: '1',
  title: 'Test Title',
  posterUrl: 'https://example.com/poster.jpg',
  genre: [GenreMovie.ACTION],
  durationMinutes: 120,
  rating: 8.5,
  status: MovieStatus.NOW_PLAYING,
  releaseDate: '2024-01-01',
  synopsis: 'Test synopsis',
  trailerUrl: ['https://example.com/trailer.mp4'],
  castCrew: { actors: [], directors: [], producers: [], writers: [] },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('useHeaderStore', () => {
  // Reset the store to its initial state before each test
  beforeEach(() => {
    act(() => {
      useMovieStore.setState({ selectedMovie: null });
    });
  });

  it('should return the initial state', () => {
    const { selectedMovie } = useMovieStore.getState();
    expect(selectedMovie).toBeNull();
  });

  it('should set the title correctly', () => {
    const newTitle = 'Test Title';
    act(() => {
      useMovieStore.getState().setSelectedMovie({
        ...MOCK_MOVIE,
        title: newTitle,
      });
    });
    const { selectedMovie } = useMovieStore.getState();
    expect(selectedMovie).toStrictEqual({
      ...MOCK_MOVIE,
      title: newTitle,
    });
  });

  it('should clear the title correctly', () => {
    // First, set a title
    act(() => {
      useMovieStore.getState().setSelectedMovie({
        ...MOCK_MOVIE,
        title: 'Some Title',
      });
    });

    expect(useMovieStore.getState().selectedMovie).toStrictEqual({
      ...MOCK_MOVIE,
      title: 'Some Title',
    });
  });

  it('should clear the selected movie correctly', () => {
    act(() => {
      useMovieStore.getState().clearSelectedMovie();
    });
    expect(useMovieStore.getState().selectedMovie).toBeNull();
  });
});
