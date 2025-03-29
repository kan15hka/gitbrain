import { useQueryClient } from "@tanstack/react-query";

const useRefetch = () => {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries(); // ✅ Correct refetch method
  };
};

export default useRefetch;
