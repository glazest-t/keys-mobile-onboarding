// Previously shared query links keep opening their assigned variant directly.
const legacyParams = new URLSearchParams(location.search);
const legacyVariant = legacyParams.get('variant');
if (legacyVariant === '1' || legacyVariant === '2') {
  const prefix = /prototype\.html$/.test(location.pathname) ? 'prototype' : 'onboarding';
  const target = new URL(`./${prefix}-variant-${legacyVariant}.html`, location.href);
  const step = legacyParams.get('step');
  if (['1', '2', '3'].includes(step)) target.searchParams.set('step', step);
  location.replace(target.href);
}
