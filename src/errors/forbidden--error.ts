import { ApplicationError } from '@/protocols';

export function ForbiddenError(): ApplicationError {
  return {
    name: 'ForbiddenError',
    message: 'You dont have permission',
  };
}
