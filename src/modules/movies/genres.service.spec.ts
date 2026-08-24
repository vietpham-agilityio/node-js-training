import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ErrorCode } from '../../common/exceptions/error-codes';
import { Genre } from './entities/genre.entity';
import { MovieGenre } from './entities/movie-genre.entity';
import { GenresService } from './genres.service';

type MockRepo<T extends object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

function mockRepo<T extends object>(): MockRepo<T> {
  return {
    create: jest.fn((entity) => entity),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn((entity, data) => ({ ...entity, ...data })),
    count: jest.fn(),
  };
}

describe('GenresService', () => {
  let service: GenresService;
  let repo: MockRepo<Genre>;
  let movieGenreRepo: MockRepo<MovieGenre>;

  const baseGenre: Genre = {
    id: 'g1',
    name: 'Science Fiction',
    movieGenres: [],
  };

  beforeEach(async () => {
    repo = mockRepo<Genre>();
    movieGenreRepo = mockRepo<MovieGenre>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: repo },
        { provide: getRepositoryToken(MovieGenre), useValue: movieGenreRepo },
      ],
    }).compile();

    service = module.get(GenresService);
  });

  describe('createGenre', () => {
    it('rejects a duplicate name without creating', async () => {
      repo.findOne!.mockResolvedValue(baseGenre);

      await expect(
        service.createGenre({ name: 'Science Fiction' }),
      ).rejects.toMatchObject({
        errorCode: ErrorCode.GENRE_NAME_ALREADY_EXISTS,
      });

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('creates when the name is available', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.save!.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.createGenre({ name: 'Drama' });

      expect(result).toMatchObject({ name: 'Drama' });
    });
  });

  describe('updateGenre', () => {
    it('rejects renaming into a name another genre already has', async () => {
      repo.findOne!.mockResolvedValue({ ...baseGenre, id: 'g2' });

      await expect(
        service.updateGenre('g1', { name: 'Science Fiction' }),
      ).rejects.toMatchObject({
        errorCode: ErrorCode.GENRE_NAME_ALREADY_EXISTS,
      });
    });
  });

  describe('remove', () => {
    it('404s via findOne when the genre does not exist', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        'Genre with id missing not found',
      );

      expect(movieGenreRepo.count).not.toHaveBeenCalled();
    });

    it('rejects deleting a genre still assigned to a movie', async () => {
      repo.findOne!.mockResolvedValue(baseGenre);
      movieGenreRepo.count!.mockResolvedValue(1);

      await expect(service.remove('g1')).rejects.toMatchObject({
        errorCode: ErrorCode.GENRE_IN_USE,
      });

      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('hard-deletes when no movie references it', async () => {
      repo.findOne!.mockResolvedValue(baseGenre);
      movieGenreRepo.count!.mockResolvedValue(0);

      await service.remove('g1');

      expect(repo.delete).toHaveBeenCalledWith('g1');
    });
  });
});
