export const getEffectiveSnapshotValue = ({
  accountId,
  monthIndex,
  hasSnapshot,
  getSnapshotValue
}) => {
  if (hasSnapshot(accountId, monthIndex)) {
    return getSnapshotValue(accountId, monthIndex);
  }

  // Look backwards within the current year only
  for (let i = monthIndex - 1; i >= 0; i -= 1) {
    if (hasSnapshot(accountId, i)) {
      return getSnapshotValue(accountId, i);
    }
  }

  return 0;
};

export const hasAnySnapshotForMonth = ({ accounts, monthIndex, hasSnapshot }) =>
  accounts.some((account) => hasSnapshot(account.id, monthIndex));

export const getLatestSnapshotMonth = ({ accounts, monthIndex, hasSnapshot }) => {
  for (let i = monthIndex; i >= 0; i -= 1) {
    if (hasAnySnapshotForMonth({ accounts, monthIndex: i, hasSnapshot })) {
      return i;
    }
  }

  return null;
};
