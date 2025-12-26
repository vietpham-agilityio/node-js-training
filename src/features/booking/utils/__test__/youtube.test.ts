import { getYouTubeId, getYouTubeThumbnail, isYouTubeUrl } from '../youtube';

describe('YouTube utils', () => {
  describe('isYouTubeUrl', () => {
    it('returns true for youtube.com url', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=Ma1x7ikpid8')).toBe(
        true,
      );
    });

    it('returns true for youtu.be url', () => {
      expect(isYouTubeUrl('https://youtu.be/Ma1x7ikpid8')).toBe(true);
    });

    it('returns false for non-youtube url', () => {
      expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isYouTubeUrl(undefined)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isYouTubeUrl('')).toBe(false);
    });
  });

  describe('getYouTubeId', () => {
    it('extracts id from youtube.com url', () => {
      expect(getYouTubeId('https://www.youtube.com/watch?v=Ma1x7ikpid8')).toBe(
        'Ma1x7ikpid8',
      );
    });

    it('extracts id from youtu.be url', () => {
      expect(getYouTubeId('https://youtu.be/Ma1x7ikpid8')).toBe('Ma1x7ikpid8');
    });

    it('extracts id when extra params exist', () => {
      expect(
        getYouTubeId(
          'https://www.youtube.com/watch?v=Ma1x7ikpid8&t=30s&ab_channel=Test',
        ),
      ).toBe('Ma1x7ikpid8');
    });

    it('returns undefined for invalid url', () => {
      expect(getYouTubeId('https://example.com/video')).toBeUndefined();
    });
  });

  describe('getYouTubeThumbnail', () => {
    it('returns correct thumbnail url', () => {
      expect(
        getYouTubeThumbnail('https://www.youtube.com/watch?v=Ma1x7ikpid8'),
      ).toBe('https://img.youtube.com/vi/Ma1x7ikpid8/hqdefault.jpg');
    });

    it('returns correct thumbnail for youtu.be url', () => {
      expect(getYouTubeThumbnail('https://youtu.be/Ma1x7ikpid8')).toBe(
        'https://img.youtube.com/vi/Ma1x7ikpid8/hqdefault.jpg',
      );
    });

    it('returns null for invalid url', () => {
      expect(getYouTubeThumbnail('https://example.com')).toBeNull();
    });
  });
});
