import { Repository, getRepository } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import { logger, NotFoundHttpException } from '../../common';

export class UserService {
  constructor(private userRepository: Repository<User> = getRepository(User)) {
    logger.info("'UserService' initialized");
  }

  public getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundHttpException(`User with id '${id}' not found`);
    }
    return user;
  }

  public getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ email });
  }

  public async createUser(userDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userDto);
    return this.userRepository.save(user);
  }

  public async validateUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.save({ ...user, verified: true });
  }

  public async deleteUser(id) {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }
}
