import { useEvent } from 'expo';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import { withUniwind } from 'uniwind';

// SDKs
import { useVideoPlayer, VideoView } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as WebBrowser from 'expo-web-browser';

// Constants
import { VIDEO_SOURCE } from '@/constants';

// Icons
import { PlayIcon } from '@/icons/PlayIcon';

// Utils
import {
  getYouTubeThumbnail,
  isYouTubeUrl,
} from '@/features/booking/utils/youtube';
import { cn } from '@/utils/cn';
import { isAndroid, isIOS } from '@/utils/platform';

interface MovieTrailerProps extends Omit<ViewProps, 'children'> {
  videoUrl?: string;
  testID?: string;
}

const StyledVideoView = withUniwind(VideoView);

export const MovieTrailer = memo(
  ({
    videoUrl = VIDEO_SOURCE,
    testID = 'movie-trailer',
    ...props
  }: MovieTrailerProps) => {
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);

    // Create video player
    const player = useVideoPlayer(videoUrl, player => {
      player.loop = false;
    });

    // Track play/pause state
    const { isPlaying } = useEvent(player, 'playingChange', {
      isPlaying: player.playing,
    });

    // Generate thumbnail on mount
    useEffect(() => {
      const loadThumbnail = async () => {
        try {
          let thumbnail = null;

          if (isYouTubeUrl(videoUrl)) {
            thumbnail = getYouTubeThumbnail(videoUrl);
          } else {
            const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
              time: 1000,
            });
            thumbnail = uri;
          }

          setThumbnail(thumbnail);
        } catch (err) {
          console.log('Thumbnail error:', err);
        }
      };
      loadThumbnail();
    }, [videoUrl]);

    const handlePlayer = useCallback(() => {
      setShowPlayer(true);
      player.play();
    }, [player]);

    const handleTogglePlayer = useCallback(() => {
      if (isPlaying) player.pause();
      else player.play();
    }, [isPlaying, player]);

    const handleOpenWebBrowser = useCallback(async () => {
      if (isYouTubeUrl(videoUrl)) {
        await WebBrowser.openBrowserAsync(videoUrl);
      } else {
        handlePlayer();
      }
    }, [handlePlayer, videoUrl]);

    return (
      <View
        testID={testID}
        className={cn(
          'relative w-[247] h-[144] overflow-hidden',
          props.className,
        )}
        accessibilityRole="none"
        accessibilityLabel="Movie trailer"
        accessible
      >
        {/* Show Thumbnail until video starts */}
        {!showPlayer && (
          <TouchableOpacity
            testID={`${testID}-thumbnail-button`}
            className="w-full h-full bg-gradient-to-t from-bg-quaternary/70 to-bg-quaternary/0"
            onPress={handleOpenWebBrowser}
            accessibilityRole="button"
            accessibilityLabel="Play movie trailer"
            accessibilityHint="Tap to play the trailer video"
            accessible
            {...(isAndroid() && {
              accessibilityLiveRegion: 'polite',
            })}
            {...(isIOS() && {
              accessibilityTraits: ['button', 'startsMedia'],
            })}
          >
            {thumbnail ? (
              <Image
                source={{ uri: thumbnail }}
                className="w-full h-full"
                resizeMode="cover"
                accessible={false}
                importantForAccessibility="no"
              />
            ) : (
              <View
                className="flex-1 items-center justify-center bg-gradient-to-t from-bg-quaternary/70 to-bg-quaternary/0"
                accessible={false}
                importantForAccessibility="no"
              >
                <ActivityIndicator
                  size="large"
                  accessibilityLabel="Loading video thumbnail"
                />
              </View>
            )}

            {/* Play button */}
            <View
              className="absolute inset-0 items-center justify-center"
              accessible={false}
              importantForAccessibility="no"
            >
              <View className="w-8 h-8 rounded-full bg-primary backdrop-blur-md items-center justify-center">
                <PlayIcon width={16} height={16} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Video Player */}
        {showPlayer && (
          <View
            testID={`${testID}-video-player`}
            accessibilityRole="none"
            accessibilityLabel={
              isPlaying ? 'Trailer video playing' : 'Trailer video paused'
            }
            accessibilityHint="Use the controls to play, pause, or adjust the video"
            accessible
            {...(isAndroid() && {
              accessibilityLiveRegion: 'polite',
            })}
          >
            <StyledVideoView
              className="w-full h-full"
              player={player}
              fullscreenOptions={{
                enable: true,
              }}
              allowsPictureInPicture
              contentFit="contain"
            />
          </View>
        )}

        {/* Custom Play/Pause button */}
        {showPlayer && (
          <TouchableOpacity
            testID={`${testID}-toggle-button`}
            onPress={handleTogglePlayer}
            className="absolute bottom-3 right-3 bg-primary rounded-full p-2"
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
            accessibilityHint={
              isPlaying ? 'Tap to pause the video' : 'Tap to play the video'
            }
            accessibilityState={{ selected: isPlaying }}
            accessible
            {...(isAndroid() && {
              accessibilityLiveRegion: 'assertive',
            })}
            {...(isIOS() && {
              accessibilityTraits: isPlaying
                ? ['button', 'pausesMedia']
                : ['button', 'startsMedia'],
            })}
          >
            <PlayIcon
              width={16}
              height={16}
              style={{ transform: [{ rotate: isPlaying ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

MovieTrailer.displayName = 'MovieTrailer';
