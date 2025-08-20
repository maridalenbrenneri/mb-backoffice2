import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ensureDataSourceInitialized } from '~/typeorm/data-source';
import { UserEntity } from '~/services/entities';

export type { UserEntity as User };

async function getRepo() {
  const ds = await ensureDataSourceInitialized();
  return ds.getRepository(UserEntity);
}

export async function getUserById(id: string) {
  const repo = await getRepo();
  return repo.findOne({ where: { id } });
}

export async function getUserByEmail(email: string) {
  const repo = await getRepo();
  return repo.findOne({ where: { email } });
}

export async function createUser(email: string, password: string) {
  const repo = await getRepo();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = repo.create({
    id: randomUUID(),
    email,
    passwordHash,
  });
  return repo.save(user);
}

export async function deleteUserByEmail(email: string) {
  const repo = await getRepo();
  return repo.delete({ email });
}

export async function verifyLogin(email: string, password: string) {
  const repo = await getRepo();
  const user = await repo.findOne({ where: { email } });

  if (!user?.passwordHash) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  // Return without passwordHash
  const { passwordHash, ...userWithoutPassword } = user as any;
  return userWithoutPassword as Omit<UserEntity, 'passwordHash'>;
}
