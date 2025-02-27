import { getCurrentUser } from './auth';

export const getGreeting = async (): Promise<string> => {
  const hour = new Date().getHours();
  const timeGreeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
  
  const currentUser = await getCurrentUser();
  const userGreeting = currentUser ? currentUser.nickname : 'invité';
  
  return `${timeGreeting}, ${userGreeting}`;
};