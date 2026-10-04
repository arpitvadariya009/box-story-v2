const crypto = require('crypto');

/**
 * Generates a strong, random password meeting the following criteria:
 * - Exactly specified length (default: 8 characters)
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 digit (0-9)
 * - At least 1 special character (!@#$%^&*)
 *
 * @param {number} length - Password length (default 8)
 * @returns {string} - Generated strong password
 */
const generateStrongPassword = (length = 8) => {
  const finalLength = Math.max(8, length);

  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz';
  const digitChars = '23456789';
  const specialChars = '!@#$%^&*';
  const allChars = upperChars + lowerChars + digitChars + specialChars;

  // Guarantee at least one of each required character category
  const passwordArray = [
    upperChars[crypto.randomInt(0, upperChars.length)],
    lowerChars[crypto.randomInt(0, lowerChars.length)],
    digitChars[crypto.randomInt(0, digitChars.length)],
    specialChars[crypto.randomInt(0, specialChars.length)],
  ];

  // Fill the remaining length with random choices from all characters
  while (passwordArray.length < finalLength) {
    passwordArray.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Cryptographically shuffle array using Fisher-Yates algorithm
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};

module.exports = {
  generateStrongPassword,
};
