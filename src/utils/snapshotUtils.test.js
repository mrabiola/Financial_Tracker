import {
  getEffectiveSnapshotValue,
  getLatestSnapshotMonth,
  hasAnySnapshotForMonth
} from './snapshotUtils';

describe('snapshotUtils', () => {
  it('uses the current month snapshot when available', () => {
    const data = { 'asset-1_5': true, 'asset-1_4': true };
    const hasSnapshot = (accountId, monthIndex) => Boolean(data[`${accountId}_${monthIndex}`]);
    const getSnapshotValue = (accountId, monthIndex) =>
      accountId === 'asset-1' && monthIndex === 5 ? 1200 : 800;

    const value = getEffectiveSnapshotValue({
      accountId: 'asset-1',
      monthIndex: 5,
      hasSnapshot,
      getSnapshotValue
    });

    expect(value).toBe(1200);
  });

  it('returns 0 when the current month has no snapshot', () => {
    const data = { 'asset-1_3': true };
    const hasSnapshot = (accountId, monthIndex) => Boolean(data[`${accountId}_${monthIndex}`]);
    const getSnapshotValue = () => 900;

    const value = getEffectiveSnapshotValue({
      accountId: 'asset-1',
      monthIndex: 5,
      hasSnapshot,
      getSnapshotValue
    });

    expect(value).toBe(0);
  });

  it('finds the most recent month with data', () => {
    const accounts = [{ id: 'asset-1' }, { id: 'liability-1' }];
    const data = { 'liability-1_10': true };
    const hasSnapshot = (accountId, monthIndex) => Boolean(data[`${accountId}_${monthIndex}`]);

    const latest = getLatestSnapshotMonth({
      accounts,
      monthIndex: 11,
      hasSnapshot
    });

    expect(latest).toBe(10);
    expect(hasAnySnapshotForMonth({ accounts, monthIndex: 11, hasSnapshot })).toBe(false);
  });
});
