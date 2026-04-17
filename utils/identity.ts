/**
 * Lightweight User Identity Utility
 * Manages a persistent userId in localStorage to link snapshots
 * to a specific browser/device.
 */

export const getOrInitializeUserId = (): string => {
  const KEY = 'face_to_code_user_id';
  let userId = localStorage.getItem(KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(KEY, userId);
  }

  return userId;
};

export const resetUserIdentity = () => {
  localStorage.removeItem('face_to_code_user_id');
};
