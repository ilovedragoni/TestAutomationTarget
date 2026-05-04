import type { SignUpPayload } from '../api/auth.api';
import { uniqueEmail } from '../utils/helpers';

export function createTestUser(prefix = 'happy.path'): SignUpPayload {
  return {
    name: 'Happy Path User',
    email: uniqueEmail(prefix),
    password: 'secret123',
  };
}
