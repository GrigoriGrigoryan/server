import { plainToInstance, ClassConstructor } from 'class-transformer';

export function serializeDTO<T>(dto: object, cls: ClassConstructor<T>): T {
  return plainToInstance(cls, dto, {
    excludeExtraneousValues: true,
  });
}
