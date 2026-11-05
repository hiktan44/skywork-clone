'use client';

import { createAuthClient } from 'better-auth/react';

// Same-origin: the client calls /api/auth/* on the current host.
export const authClient = createAuthClient();
