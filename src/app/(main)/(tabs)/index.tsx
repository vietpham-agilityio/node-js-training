import { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { useResolveClassNames } from 'uniwind';

// Constants
import { ERROR_MESSAGES, FILTER_CATEGORY_TABS, MESSAGES } from '@/constants';

// Components
import { Button, MovieBanner, SearchInput, Tabs } from '@/components/common';
import { PromotionCard } from '@/components/feature';

// Hooks
import { useAuth } from '@/hooks';

// Types
import { Movie, MovieStatus } from '@/types';

const HomeScreen = () => {
  const { signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>(
    FILTER_CATEGORY_TABS[0].id,
  );

  const promotions = [
    {
      id: '1',
      title: 'Student Holiday',
      subtitle: 'Maximal only for two people',
      discount: '50%',
    },
    {
      id: '2',
      title: 'Student Holiday',
      subtitle: 'Maximal only for two people',
      discount: '50%',
    },
    {
      id: '3',
      title: 'Student Holiday',
      subtitle: 'Maximal only for two people',
      discount: '50%',
    },
  ];

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

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
    posterUrl:
      'https://www.dailysabah.com/arts/reviews/spider-man-across-the-spiderverse-discovers-tangled-web-of-multiverse',
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
      <ScrollView
        className=" h-full bg-dark-blue"
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-22">
          <SearchInput value={searchValue} onChangeText={handleSearch} />
        </View>

        <View className="h-10 mt-7">
          <Tabs
            tabs={FILTER_CATEGORY_TABS}
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
          />
        </View>

        <View className="mt-7">
          <MovieBanner movie={movie} />
        </View>

        <View className="w-full flex-1 gap-4 mt-7">
          {promotions.map(promotion => (
            <PromotionCard key={promotion.id} {...promotion} />
          ))}
        </View>
        <Button
          title=" Sign Out"
          onPress={handleSignOut}
          className="bg-error rounded-xl p-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
