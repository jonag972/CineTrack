import { getCurrentUser } from './auth';

/**
 * Function to get a greeting message based on the current time and user.
 * @returns {Promise<string>} A greeting message.
 */
export const getGreeting = async (): Promise<string> => {
  const hour = new Date().getHours();
  const timeGreeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
  
  const currentUser = await getCurrentUser();
  const userGreeting = currentUser ? currentUser.nickname : 'invité';
  
  return `${timeGreeting}, ${userGreeting}`;
};
