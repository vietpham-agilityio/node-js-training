export interface BaseRepository<
  T,
  TCreateInput = T,
  TUpdateInput = Partial<T>,
> {
  /** Create a new entity. */
  create(data: TCreateInput): Promise<T | null>;

  /** Find entity by ID. */
  findById(id: string): Promise<T | null>;

  /** Find all entities. */
  findAll(): Promise<T[]>;

  /** Update entity by ID. */
  updateById(id: string, data: Partial<TUpdateInput>): Promise<T | null>;

  /** Delete entity by ID. */
  deleteById(id: string): Promise<void>;
}
