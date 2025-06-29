import { useQuery } from '@tanstack/react-query';
import { fetchAttempted, fetchMyTest, fetchPublicTests, fetchResultById, fetchTestById } from '../testApi';

export const useGetTestById = (id, token) => {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => fetchTestById(id, token),
    enabled: !!id && !!token, // only run when both are available
  });
};

export const useResultById = (id, token) => {
  return useQuery({
    queryKey: ['result', id],
    queryFn: () => fetchResultById(id, token),
    enabled: !!id && !!token, // only run when both are available
  });
};

export const useMyTest = (id, token) => {
  return useQuery({
    queryKey: ['mytest', id],
    queryFn: () => fetchMyTest(id, token),
    enabled: !!id && !!token, // only run when both are available
  });
};

export const usePublicTest = (id, token) => {
  return useQuery({
    queryKey: ['publicTest', id],
    queryFn: () => fetchPublicTests(id, token),
    enabled: !!id && !!token, // only run when both are available
  });
};

export const useAttempted = (id, token) => {
  console.log("inside hook")
  return useQuery({
    queryKey: ['attemptedTest', id],
    queryFn: () => fetchAttempted(id, token),
    enabled: !!id && !!token, // only run when both are available
  });
};
