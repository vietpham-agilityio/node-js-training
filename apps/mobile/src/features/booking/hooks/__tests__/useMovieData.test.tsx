import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useMovieData } from '../useMovieData';
import * as useMoviesModule from '../useMovies';
import { MOVIE_STATUS } from '@/constants/status';
import { MovieStatus } from '../../schemas/movie';

// Mock the hooks
jest.mock('../useMovies');

const mockUseMoviesInfinite =
  useMoviesModule.useMoviesInfinite as jest.MockedFunction<
    typeof useMoviesModule.useMoviesInfinite
  >;
const mockUseMoviesByGenreInfinite =
  useMoviesModule.useMoviesByGenreInfinite as jest.MockedFunction<
    typeof useMoviesModule.useMoviesByGenreInfinite
  >;

describe('useMovieData', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'QueryClientWrapper';

    return Wrapper;
  };

  const mockMovieData = [
    { id: '1', title: 'Movie 1', rating: 8.5 },
    { id: '2', title: 'Movie 2', rating: 7.2 },
    { id: '3', title: 'Movie 3', rating: 9.1 },
  ];

  const defaultQueryResult = {
    data: { pages: [mockMovieData] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
    isRefetching: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('All Category (no genre)', () => {
    it('should call useMoviesInfinite when no genre is provided', () => {
      mockUseMoviesInfinite.mockReturnValue(defaultQueryResult as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(mockUseMoviesInfinite).toHaveBeenCalledWith({
        status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
        enabled: true,
      });

      expect(mockUseMoviesByGenreInfinite).toHaveBeenCalledWith({
        genre: undefined,
        status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
        enabled: false,
      });

      expect(result.current.movies).toHaveLength(3);
    });

    it('should sort NOW_PLAYING movies by rating (descending)', () => {
      mockUseMoviesInfinite.mockReturnValue(defaultQueryResult as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current?.movies[0]?.rating).toBe(9.1);
      expect(result.current?.movies[1]?.rating).toBe(8.5);
      expect(result.current?.movies[2]?.rating).toBe(7.2);
    });

    it('should limit to 10 movies', () => {
      const manyMovies = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        title: `Movie ${i}`,
        rating: i,
      }));

      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: { pages: [manyMovies] },
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.movies).toHaveLength(10);
    });
  });

  describe('Genre Category', () => {
    it('should call useMoviesByGenreInfinite when genre is provided', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue(defaultQueryResult as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: 'action',
          }),
        { wrapper: createWrapper() },
      );

      expect(mockUseMoviesInfinite).toHaveBeenCalledWith({
        status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
        enabled: false,
      });

      expect(mockUseMoviesByGenreInfinite).toHaveBeenCalledWith({
        genre: 'action',
        status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
        enabled: true,
      });

      expect(result.current.movies).toHaveLength(3);
    });
  });

  describe('COMING_SOON status', () => {
    it('should NOT sort COMING_SOON movies by rating', () => {
      mockUseMoviesInfinite.mockReturnValue(defaultQueryResult as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.COMING_SOON as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      // Should maintain original order
      expect(result.current.movies[0]?.id).toBe('1');
      expect(result.current.movies[1]?.id).toBe('2');
      expect(result.current.movies[2]?.id).toBe('3');
    });
  });

  describe('Loading states', () => {
    it('should return loading state correctly', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        isLoading: true,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('should return fetching next page state correctly', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        isFetchingNextPage: true,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isFetchingNextPage).toBe(true);
    });

    it('should return refetching state correctly', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        isRefetching: true,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isRefetching).toBe(true);
    });
  });

  describe('Empty data', () => {
    it('should return empty array when no data', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.movies).toEqual([]);
    });

    it('should return empty array when pages is empty', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: { pages: [] },
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.movies).toEqual([]);
    });
  });

  describe('Pagination', () => {
    it('should return hasNextPage correctly', () => {
      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        hasNextPage: true,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.hasNextPage).toBe(true);
    });

    it('should expose fetchNextPage function', () => {
      const mockFetchNextPage = jest.fn();

      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        fetchNextPage: mockFetchNextPage,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      result.current.fetchNextPage();

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('should expose refetch function', () => {
      const mockRefetch = jest.fn();

      mockUseMoviesInfinite.mockReturnValue({
        ...defaultQueryResult,
        refetch: mockRefetch,
      } as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      const { result } = renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
          }),
        { wrapper: createWrapper() },
      );

      result.current.refetch();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Enabled parameter', () => {
    it('should pass enabled=false to hooks when disabled', () => {
      mockUseMoviesInfinite.mockReturnValue(defaultQueryResult as any);
      mockUseMoviesByGenreInfinite.mockReturnValue({
        ...defaultQueryResult,
        data: undefined,
      } as any);

      renderHook(
        () =>
          useMovieData({
            status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
            genre: undefined,
            enabled: false,
          }),
        { wrapper: createWrapper() },
      );

      expect(mockUseMoviesInfinite).toHaveBeenCalledWith({
        status: MOVIE_STATUS.NOW_PLAYING as MovieStatus,
        enabled: false,
      });
    });
  });
});
