const CONSENT_COOKIE = 'figulyarnya-cookie-consent'
const CONSENT_VERSION = '1'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

export type CookieConsentValue = `${typeof CONSENT_VERSION}:accepted`

/**
 * Versioned cookie-consent preference (essential/ack).
 * Bump CONSENT_VERSION when the policy text meaningfully changes.
 */
export function useCookieConsent() {
  const consent = useCookie<CookieConsentValue | null>(CONSENT_COOKIE, {
    default: () => null,
    maxAge: CONSENT_MAX_AGE,
    sameSite: 'lax',
    secure: !import.meta.dev,
    watch: true,
  })

  const hasConsent = computed(() => consent.value === `${CONSENT_VERSION}:accepted`)

  function accept() {
    consent.value = `${CONSENT_VERSION}:accepted`
  }

  function reset() {
    consent.value = null
  }

  return {
    consent,
    hasConsent,
    accept,
    reset,
    version: CONSENT_VERSION,
  }
}
