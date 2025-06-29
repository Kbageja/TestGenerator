import { useMutation } from '@tanstack/react-query';
import { createTest, evalTest } from '../testApi';

export const useCreateTest = () => {
  return useMutation({
    mutationFn: createTest
  });
};

export const useEvaluation = () => {
  return useMutation({
    mutationFn: evalTest,
    onError: (error) => {
      console.error('Evaluation mutation error:', error);
    },
    onSuccess: (data) => {
      console.log('Evaluation successful:', data);
    }
  });
};