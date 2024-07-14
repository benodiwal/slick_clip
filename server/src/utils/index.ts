import crypto from 'crypto';
import getEnvVar from 'env/index';

export const generateApiToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateUniqueUrl = () => {
  return crypto.randomBytes(16).toString('hex');
};

export const getFileLocation = (userId: string) => {
    return `${getEnvVar('STORAGE_PATH')}/${userId}`;
}
