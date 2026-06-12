import { useState, useEffect, useCallback } from 'react';

import { Class } from '@/types/finance';
import { fetchClasses as fetchClassesApi } from '@/api/finance';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  
  const fetchClasses = useCallback(async () => {
    try {
      const data = await fetchClassesApi();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, refetchClasses: fetchClasses };
}
