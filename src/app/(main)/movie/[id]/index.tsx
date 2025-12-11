import { RouteProp } from '@react-navigation/native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Components
import { MovieCard } from '@/components/feature';

// Types
import { Movie, MovieStatus } from '@/types';

// Constants
import { Size } from '@/constants';

const MovieScreen = ({
  route,
}: {
  route: RouteProp<{ params: { id: string } }>;
}) => {
  const { id } = route.params;

  const StyledSafeAreaView = withUniwind(SafeAreaView);
  const StyledScrollView = withUniwind(ScrollView);

  const movie: Movie = {
    id: '1',
    title: 'Spider Man: No Way Home',
    synopsis:
      'Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.',
    posterUrl:
      'https://media.themoviedb.org/t/p/w600_and_h900_face/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    rating: 4.7,
    durationMinutes: 112,
    genre: ['Action', 'Comedy', 'Adventure'],
    language: 'EN',
    trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    releaseDate: '2023-06-15',
    createdAt: '2023-06-15T12:34:56Z',
    updatedAt: '2023-06-15T12:34:56Z',
    status: MovieStatus.NOW_PLAYING,
  };

  return (
    <StyledSafeAreaView
      edges={['top']}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
      className="flex-1 bg-dark-blue"
    >
      <StyledScrollView
        className=" h-full bg-dark-blue"
        contentContainerClassName="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-22 gap-4" testID="movie-card">
          {/* Default card with rating, genres, and duration */}
          <MovieCard {...movie} imageSize={Size.MEDIUM} />

          {/* Booking card with showtime, date, and cinema location */}
          <MovieCard
            {...movie}
            rating={undefined}
            showtime="16:40"
            showDate="Sun May 22"
            cinemaLocation="FX Sudirman XXI"
          />

          {/* Booking card with price */}
          <MovieCard
            {...movie}
            rating={undefined}
            showtime="16:40"
            showDate="Sun May 22"
            price="150.000"
          />
        </View>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default MovieScreen;
