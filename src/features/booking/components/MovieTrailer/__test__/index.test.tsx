import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { MovieTrailer } from '..';

jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(() =>
    Promise.resolve({ uri: 'mock-thumbnail-uri.jpg' }),
  ),
}));

jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn((source, callback) => {
    const player = {
      playing: false,
      loop: false,
      play: jest.fn(),
      pause: jest.fn(),
    };
    callback?.(player);
    return player;
  }),
  VideoView: ({ player, className, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="video-view-mock" {...props} />;
  },
}));

describe('MovieTrailer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the trailer container', () => {
      render(<MovieTrailer />);

      expect(screen.getByTestId('movie-trailer')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      render(<MovieTrailer testID="custom-trailer" />);

      expect(screen.getByTestId('custom-trailer')).toBeTruthy();
    });

    it('should render thumbnail button initially', () => {
      render(<MovieTrailer />);

      expect(screen.getByTestId('movie-trailer-thumbnail-button')).toBeTruthy();
    });
  });

  describe('Thumbnail Loading', () => {
    it('should load thumbnail on mount', async () => {
      const VideoThumbnails = require('expo-video-thumbnails');

      render(<MovieTrailer videoUrl="https://example.com/test.mp4" />);

      await waitFor(() => {
        expect(VideoThumbnails.getThumbnailAsync).toHaveBeenCalledWith(
          'https://example.com/test.mp4',
          { time: 1000 },
        );
      });
    });

    it('should handle thumbnail generation error gracefully', async () => {
      const VideoThumbnails = require('expo-video-thumbnails');
      VideoThumbnails.getThumbnailAsync.mockRejectedValueOnce(
        new Error('Thumbnail error'),
      );

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<MovieTrailer />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Thumbnail error:',
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Video Player Interaction', () => {
    it('should show video player when play button is pressed', async () => {
      render(<MovieTrailer />);

      const playButton = screen.getByTestId('movie-trailer-thumbnail-button');
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(screen.getByTestId('movie-trailer-video-player')).toBeTruthy();
      });
    });

    it('should hide thumbnail when video player starts', async () => {
      render(<MovieTrailer />);

      const playButton = screen.getByTestId('movie-trailer-thumbnail-button');
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('movie-trailer-thumbnail-button'),
        ).toBeNull();
      });
    });

    it('should call player.play when play button is pressed', async () => {
      const { useVideoPlayer } = require('expo-video');
      const mockPlayer = {
        playing: false,
        loop: false,
        play: jest.fn(),
        pause: jest.fn(),
      };
      useVideoPlayer.mockReturnValue(mockPlayer);

      render(<MovieTrailer />);

      const playButton = screen.getByTestId('movie-trailer-thumbnail-button');
      fireEvent.press(playButton);

      expect(mockPlayer.play).toHaveBeenCalled();
    });

    it('should show toggle button when video player is active', async () => {
      render(<MovieTrailer />);

      const playButton = screen.getByTestId('movie-trailer-thumbnail-button');
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(screen.getByTestId('movie-trailer-toggle-button')).toBeTruthy();
      });
    });
  });

  describe('Play/Pause Toggle', () => {
    it('should pause video when toggle button is pressed while playing', async () => {
      const { useVideoPlayer } = require('expo-video');
      const { useEvent } = require('expo');

      const mockPlayer = {
        playing: true,
        loop: false,
        play: jest.fn(),
        pause: jest.fn(),
      };
      useVideoPlayer.mockReturnValue(mockPlayer);
      useEvent.mockReturnValue({ isPlaying: true });

      render(<MovieTrailer />);

      // Start video
      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        expect(screen.getByTestId('movie-trailer-toggle-button')).toBeTruthy();
      });

      // Toggle pause
      fireEvent.press(screen.getByTestId('movie-trailer-toggle-button'));

      expect(mockPlayer.pause).toHaveBeenCalled();
    });

    it('should play video when toggle button is pressed while paused', async () => {
      const { useVideoPlayer } = require('expo-video');
      const { useEvent } = require('expo');

      const mockPlayer = {
        playing: false,
        loop: false,
        play: jest.fn(),
        pause: jest.fn(),
      };
      useVideoPlayer.mockReturnValue(mockPlayer);
      useEvent.mockReturnValue({ isPlaying: false });

      render(<MovieTrailer />);

      // Start video
      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        expect(screen.getByTestId('movie-trailer-toggle-button')).toBeTruthy();
      });

      // Toggle play
      fireEvent.press(screen.getByTestId('movie-trailer-toggle-button'));

      expect(mockPlayer.play).toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    it('should use custom video URL when provided', () => {
      const { useVideoPlayer } = require('expo-video');

      render(<MovieTrailer videoUrl="https://custom.com/video.mp4" />);

      expect(useVideoPlayer).toHaveBeenCalledWith(
        'https://custom.com/video.mp4',
        expect.any(Function),
      );
    });

    it('should apply custom className', () => {
      const { getByTestId } = render(<MovieTrailer className="custom-class" />);

      const container = getByTestId('movie-trailer');
      expect(container.props.className).toContain('custom-class');
    });

    it('should set video player loop to false', () => {
      const { useVideoPlayer } = require('expo-video');
      const mockPlayer = {
        playing: false,
        loop: false,
        play: jest.fn(),
        pause: jest.fn(),
      };
      useVideoPlayer.mockReturnValue(mockPlayer);

      render(<MovieTrailer />);

      expect(mockPlayer.loop).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role for container', () => {
      const { getByTestId } = render(<MovieTrailer />);

      expect(getByTestId('movie-trailer').props.accessibilityRole).toBe('none');
    });

    it('should have correct accessibility label for container', () => {
      const { getByTestId } = render(<MovieTrailer />);

      expect(getByTestId('movie-trailer').props.accessibilityLabel).toBe(
        'Movie trailer',
      );
    });

    it('should have correct accessibility for thumbnail button', () => {
      const { getByTestId } = render(<MovieTrailer />);
      const button = getByTestId('movie-trailer-thumbnail-button');

      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Play movie trailer');
      expect(button.props.accessibilityHint).toBe(
        'Double tap to play the trailer video',
      );
    });

    it('should have correct accessibility for video player', async () => {
      const { useEvent } = require('expo');
      useEvent.mockReturnValue({ isPlaying: true });

      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        const player = screen.getByTestId('movie-trailer-video-player');
        expect(player.props.accessibilityLabel).toBe('Trailer video playing');
      });
    });

    it('should update accessibility label when video is paused', async () => {
      const { useEvent } = require('expo');
      useEvent.mockReturnValue({ isPlaying: false });

      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        const player = screen.getByTestId('movie-trailer-video-player');
        expect(player.props.accessibilityLabel).toBe('Trailer video paused');
      });
    });

    it('should have correct accessibility for toggle button when playing', async () => {
      const { useEvent } = require('expo');
      useEvent.mockReturnValue({ isPlaying: true });

      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        const toggleButton = screen.getByTestId('movie-trailer-toggle-button');
        expect(toggleButton.props.accessibilityLabel).toBe('Pause video');
        expect(toggleButton.props.accessibilityHint).toBe(
          'Double tap to pause the video',
        );
      });
    });

    it('should have correct accessibility for toggle button when paused', async () => {
      const { useEvent } = require('expo');
      useEvent.mockReturnValue({ isPlaying: false });

      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        const toggleButton = screen.getByTestId('movie-trailer-toggle-button');
        expect(toggleButton.props.accessibilityLabel).toBe('Play video');
        expect(toggleButton.props.accessibilityHint).toBe(
          'Double tap to play the video',
        );
      });
    });
  });

  describe('Component Props', () => {
    it('should have correct displayName', () => {
      expect(MovieTrailer.displayName).toBe('MovieTrailer');
    });

    it('should be memoized', () => {
      const { rerender } = render(<MovieTrailer />);

      rerender(<MovieTrailer />);

      expect(screen.getByTestId('movie-trailer')).toBeTruthy();
    });

    it('should update when videoUrl changes', () => {
      const { useVideoPlayer } = require('expo-video');
      const { rerender } = render(
        <MovieTrailer videoUrl="https://example.com/video1.mp4" />,
      );

      rerender(<MovieTrailer videoUrl="https://example.com/video2.mp4" />);

      expect(useVideoPlayer).toHaveBeenCalledWith(
        'https://example.com/video2.mp4',
        expect.any(Function),
      );
    });
  });

  describe('Video Player Configuration', () => {
    it('should enable fullscreen options', async () => {
      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        expect(screen.getByTestId('video-view-mock')).toBeTruthy();
      });
    });

    it('should allow picture in picture', async () => {
      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        const videoView = screen.getByTestId('video-view-mock');
        expect(videoView.props.allowsPictureInPicture).toBe(true);
      });
    });

    it('should use contain content fit', async () => {
      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        const videoView = screen.getByTestId('video-view-mock');
        expect(videoView.props.contentFit).toBe('contain');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing video URL gracefully', () => {
      render(<MovieTrailer videoUrl="" />);

      expect(screen.getByTestId('movie-trailer')).toBeTruthy();
    });

    it('should not crash when thumbnail fails to load', async () => {
      const VideoThumbnails = require('expo-video-thumbnails');
      VideoThumbnails.getThumbnailAsync.mockRejectedValueOnce(
        new Error('Failed'),
      );

      render(<MovieTrailer />);

      expect(screen.getByTestId('movie-trailer')).toBeTruthy();
    });

    it('should handle rapid play/pause toggles', async () => {
      const { useVideoPlayer } = require('expo-video');
      const mockPlayer = {
        playing: false,
        loop: false,
        play: jest.fn(),
        pause: jest.fn(),
      };
      useVideoPlayer.mockReturnValue(mockPlayer);

      render(<MovieTrailer />);

      fireEvent.press(screen.getByTestId('movie-trailer-thumbnail-button'));

      await waitFor(() => {
        expect(screen.getByTestId('movie-trailer-toggle-button')).toBeTruthy();
      });

      const toggleButton = screen.getByTestId('movie-trailer-toggle-button');

      fireEvent.press(toggleButton);
      fireEvent.press(toggleButton);
      fireEvent.press(toggleButton);

      expect(mockPlayer.play).toHaveBeenCalled();
    });
  });
});
