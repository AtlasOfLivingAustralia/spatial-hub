import { APIRequestContext } from '@playwright/test';

const tokenUrl = process.env.OIDC_TOKEN_URL || 'http://e2e.localhost:18081/default/token';

// Bearer token for API calls. The local stack's mock OIDC provider issues one to any client_credentials request;
// against a real deployment provide E2E_TOKEN.
export async function bearer(request: APIRequestContext): Promise<Record<string, string>> {
  if (process.env.E2E_TOKEN) return { Authorization: `Bearer ${process.env.E2E_TOKEN}` };
  const res = await request.post(tokenUrl, {
    form: { grant_type: 'client_credentials', client_id: 'e2e', client_secret: 'e2e', scope: 'openid profile email' },
  });
  const body = await res.json();
  return { Authorization: `Bearer ${body.access_token}` };
}
