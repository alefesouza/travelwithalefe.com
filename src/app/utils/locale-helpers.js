/**
 * Get localized text based on current host
 * @param {string} host - Current host
 * @param {string} text - Default text
 * @param {string} text_pt - Portuguese text
 * @returns {string} Localized text
 */
export function getLocalizedText(host, text, text_pt) {
  const isBR = host.includes('viajarcomale.com.br');
  return isBR && text_pt ? text_pt : text;
}

/**
 * Check if current host is Brazilian version
 * @param {string} host - Current host
 * @returns {boolean}
 */
export function isBrazilianHost(host) {
  return host.includes('viajarcomale.com.br');
}
