import { useQuery } from '@tanstack/react-query';
import { getPortfolioReport } from '../services/report.service';

export function usePortfolioReport() {
  return useQuery({
    queryKey: ['reports', 'portfolio'],
    queryFn: getPortfolioReport,
  });
}
