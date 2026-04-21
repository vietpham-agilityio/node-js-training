export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
}

export type APIResponse<T> = T & BaseEntity & { id: string };
