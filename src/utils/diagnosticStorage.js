const STORAGE_KEY = 'healthDiagnosticResults';

export const getStoredDiagnosticResults = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read diagnostic results:', error);
    return null;
  }
};

export const clearStoredDiagnosticResults = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear diagnostic results:', error);
  }
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const getNextReminderDate = (frequency, fromDate = new Date()) => {
  if (!frequency) return null;
  const map = {
    monthly: 1,
    quarterly: 3,
    yearly: 12
  };
  const months = map[frequency];
  if (!months) return null;
  return addMonths(fromDate, months).toISOString();
};

export const buildHealthSnapshotPayload = (stored) => {
  if (!stored || !stored.healthScore || !stored.grade) return null;

  return {
    score: stored.healthScore.totalScore,
    grade: stored.grade,
    breakdown: stored.healthScore.breakdown || {},
    inputs: stored.formData || {},
    source: 'diagnostic',
    created_at: stored.timestamp
      ? new Date(stored.timestamp).toISOString()
      : new Date().toISOString()
  };
};

export const buildBaselineSettings = (existingSettings = {}, stored, reminderFrequency) => {
  if (!stored || !stored.healthScore || !stored.grade) return existingSettings;

  const capturedAt = stored.timestamp
    ? new Date(stored.timestamp).toISOString()
    : new Date().toISOString();

  const baseline = {
    grade: stored.grade,
    score: stored.healthScore.totalScore,
    breakdown: stored.healthScore.breakdown || {},
    capturedAt
  };

  const reminder = reminderFrequency
    ? {
        frequency: reminderFrequency,
        nextReminderAt: getNextReminderDate(reminderFrequency),
        createdAt: new Date().toISOString()
      }
    : null;

  return {
    ...existingSettings,
    diagnosticBaseline: baseline,
    diagnosticReminder: reminder
  };
};
