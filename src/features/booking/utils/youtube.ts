export const isYouTubeUrl = (url?: string) =>
  !!url && /youtube\.com|youtu\.be/.test(url);

export const getYouTubeId = (url: string) => {
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  }
  return url.split('v=')[1]?.split('&')[0];
};

export const getYouTubeThumbnail = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};
