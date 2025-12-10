import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Constants
import {
  ERROR_MESSAGES,
  FILTER_CATEGORY_TABS,
  FILTER_MOVIE_TABS,
  MESSAGES,
} from '@/constants';

// Components
import { Button, MovieBanner, Tabs } from '@/components/common';

// Hooks
import { useAuth } from '@/hooks';
import { Movie, MovieStatus } from '@/types';
import { useState } from 'react';

const HomeScreen = () => {
  const { signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>(
    FILTER_CATEGORY_TABS[0].id,
  );
  const [activeTab, setActiveTab] = useState<string>(FILTER_MOVIE_TABS[0].id);

  const containerStyles = useResolveClassNames('flex-1');

  const handleSignOut = () => {
    Alert.alert(MESSAGES.SIGN_OUT, MESSAGES.SIGN_OUT_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert(ERROR_MESSAGES.SIGN_OUT_FAILED);
          }
        },
      },
    ]);
  };

  const movie: Movie = {
    id: '1',
    title: 'Wreck It Ralph 2',
    synopsis: 'Ralph and Vanellope venture into the internet...',
    posterUrl: 'https://example.com/poster.jpg',
    rating: 4.7,
    durationMinutes: 112,
    genre: ['Animation', 'Comedy', 'Adventure'],
    language: 'EN',
    trailerUrl: 'https://example.com/trailer.mp4',
    releaseDate: '2023-06-15',
    createdAt: '2023-06-15T12:34:56Z',
    updatedAt: '2023-06-15T12:34:56Z',
    status: MovieStatus.NOW_PLAYING,
  };

  return (
    <SafeAreaView
      edges={['top']}
      accessibilityLabel="Home screen"
      accessibilityHint="Home screen"
      style={containerStyles}
    >
      <View className="w-full h-full bg-bg-primary">
        <Button
          title=" Sign Out"
          onPress={handleSignOut}
          className="bg-error rounded-xl p-4"
        />
        <Tabs
          tabs={FILTER_CATEGORY_TABS}
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
        />

        <Tabs
          variant="secondary"
          tabs={FILTER_MOVIE_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <MovieBanner movie={movie} />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
