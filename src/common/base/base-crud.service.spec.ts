import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';

import { BaseAbstractService } from './base-crud.service';

interface TestEntity {
  id: string;
  name: string;
}

class TestEntityService extends BaseAbstractService<TestEntity> {
  constructor(repository: Repository<TestEntity>) {
    super(repository, 'TestEntity');
  }

  remove(id: string): Promise<void> {
    return Promise.resolve(void id);
  }
}

type MockRepo = Partial<Record<keyof Repository<TestEntity>, jest.Mock>>;

function mockRepo(): MockRepo {
  return {
    create: jest.fn((entity) => entity),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn((entity, data) => ({ ...entity, ...data })),
  };
}

describe('BaseAbstractService', () => {
  let repo: MockRepo;
  let service: TestEntityService;

  beforeEach(() => {
    repo = mockRepo();
    service = new TestEntityService(repo as unknown as Repository<TestEntity>);
  });

  describe('create', () => {
    it('saves an entity built from the given data', async () => {
      repo.save!.mockResolvedValue({ id: '1', name: 'a' });

      const result = await service.create({ name: 'a' });

      expect(repo.create).toHaveBeenCalledWith({ name: 'a' });
      expect(repo.save).toHaveBeenCalledWith({ name: 'a' });
      expect(result).toEqual({ id: '1', name: 'a' });
    });
  });

  describe('findAll', () => {
    it('shapes the paginated envelope, with hasMore true short of the total', async () => {
      const rows = [{ id: '1', name: 'a' }];
      repo.findAndCount!.mockResolvedValue([rows, 5]);

      const result = await service.findAll({ page: 1, limit: 1, skip: 0 });

      expect(repo.findAndCount).toHaveBeenCalledWith({ skip: 0, take: 1 });
      expect(result).toEqual({
        data: rows,
        meta: { page: 1, limit: 1, total: 5, hasMore: true },
      });
    });

    it('sets hasMore false once the returned page reaches the total', async () => {
      const rows = [{ id: '1', name: 'a' }];
      repo.findAndCount!.mockResolvedValue([rows, 1]);

      const result = await service.findAll({ page: 1, limit: 20, skip: 0 });

      expect(result.meta.hasMore).toBe(false);
    });
  });

  describe('findOne', () => {
    it('returns the entity when found', async () => {
      const entity = { id: '1', name: 'a' };
      repo.findOne!.mockResolvedValue(entity);

      await expect(service.findOne('1')).resolves.toBe(entity);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('throws NotFoundException when the repository returns null', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('merges the given data onto the found entity before saving', async () => {
      const entity = { id: '1', name: 'a' };
      repo.findOne!.mockResolvedValue(entity);
      repo.save!.mockImplementation((e) => Promise.resolve(e));

      const result = await service.update('1', { name: 'b' });

      expect(repo.merge).toHaveBeenCalledWith(entity, { name: 'b' });
      expect(result).toEqual({ id: '1', name: 'b' });
    });

    it('propagates the not-found error instead of merging', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'b' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.merge).not.toHaveBeenCalled();
    });
  });
});
