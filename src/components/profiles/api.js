function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const configuredBaseUrl = String(process.env.REACT_APP_API_BASE_URL || '').trim();
  if (!configuredBaseUrl) {
    return '';
  }

  return trimTrailingSlash(configuredBaseUrl);
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return normalizedPath;
  }

  return `${apiBaseUrl}${normalizedPath}`;
}
