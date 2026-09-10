import { useQuery } from "@tanstack/react-query";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/dashboard.query-keys";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";

export function useEmpresaDashboardQuery(empresaId: string | undefined) {
  return useQuery({
    queryKey: dashboardQueryKeys.empresa(empresaId ?? ""),
    queryFn: () => dashboardService.getEmpresaDashboard(empresaId!),
    enabled: Boolean(empresaId),
  });
}
