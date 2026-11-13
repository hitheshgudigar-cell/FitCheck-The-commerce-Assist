// Generate a unique session ID in memory (not in localStorage, per requirements)
let memorySessionId: string | null = null;

export function getSessionId(): string {
  if (!memorySessionId) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    memorySessionId = `fc_sess_${timestamp}_${randomStr}`;
  }
  return memorySessionId;
}

export function resetSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  memorySessionId = `fc_sess_${timestamp}_${randomStr}`;
  return memorySessionId;
}
