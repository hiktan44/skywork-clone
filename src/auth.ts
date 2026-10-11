import NextAuth from 'next-auth';
import { taskAuthConfig } from '@/lib/task-auth-config';

export const { auth, handlers } = NextAuth(() => taskAuthConfig());
