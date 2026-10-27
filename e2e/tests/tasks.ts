import { expect, APIRequestContext } from '@playwright/test';
import { bearer } from './auth';

// Creates a task as the e2e user and waits for it to end. Status, as the hub reads it in
// toolsService.js and the service writes it in TaskQueueService: under 2 queued or running,
// 2 cancelled, 3 error, 4 finished.
export async function runTask(request: APIRequestContext, name: string, input: Record<string, unknown>, waitSeconds = 90) {
  const headers = await bearer(request);
  const res = await request.post('/ws/tasks/create?userId=e2e@example.org&sessionId=e2e', { headers, data: { name, input } });
  expect(res.status(), await res.text()).toBe(200);
  const task = await res.json();
  expect(task.errors, JSON.stringify(task)).toBeUndefined();
  const id = task.id;
  let status: any;
  for (let i = 0; i < waitSeconds; i++) {
    status = await (await request.get(`/ws/tasks/status/${id}`)).json();
    if (status.status >= 2) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { id, status };
}
