import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { BadRequestHttpException } from './http-exception';

export async function validateDTO(
  dto: object,
  cls: ClassConstructor<object>,
): Promise<void> {
  const clsInstanceDto = plainToInstance(cls, dto);
  const errors = await validate(clsInstanceDto);

  if (errors.length === 0) {
    return;
  }

  const allConstraints = errors
    .map((error) => error.constraints)
    .filter((constraints) => !!constraints);

  const errorMessages = allConstraints
    .map((constraints) => {
      const messages = [];
      for (const key in constraints) {
        messages.push(constraints[key]);
      }
      return messages;
    })
    .flat();

  throw new BadRequestHttpException(errorMessages);
}
