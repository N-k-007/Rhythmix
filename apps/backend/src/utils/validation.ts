/**
 * Removes leading and trailing whitespaces and collapses multiple spaces inside a string.
 * @param value The input string to sanitize
 * @returns A trimmed string
 */
export function sanitizeInput(value: string, isEmail = false): string {
  if (typeof value !== 'string') return value;
  let sanitized = value.trim().replace(/\s+/g, ' ');
  if (isEmail) sanitized = sanitized.toLowerCase();
  return sanitized;
}

/**
 * Validates if an email is in a proper format.
 * @param email The email string to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return false;
  if (localPart.length > 64 || domain.length > 253) return false;
  if (localPart.includes('..') || domain.includes('..')) return false;
  if (!domain.includes('.')) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates if a username is alphanumeric (with underscores), and between 3 and 20 characters.
 * @param username The username string to validate
 * @returns true if valid, false otherwise
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return typeof username === 'string' && usernameRegex.test(username);
}

/**
 * Validates if a password is strong enough.
 * Must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, and be 8+ characters long.
 * @param password The password string to validate
 * @returns true if valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return typeof password === 'string' && passwordRegex.test(password);
}
