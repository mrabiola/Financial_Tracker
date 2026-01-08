export const getAccountCanonicalKey = (account) =>
  account?.canonical_id || null;

export const getAccountLegacyKey = (account) => {
  if (!account) return null;
  const name = typeof account.name === 'string' ? account.name.trim().toLowerCase() : '';
  const type = typeof account.type === 'string' ? account.type.trim().toLowerCase() : '';

  if (name && type) {
    return `${type}_${name}`;
  }

  return name || null;
};

export const getAccountMappingKey = (account) =>
  getAccountCanonicalKey(account) || getAccountLegacyKey(account);
