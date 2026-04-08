import { DeploymentTable } from "@/components/DeploymentTable";
import { mockDeployments } from "@/lib/mock-data";

const DeploymentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground text-sm mt-1">View all deployment activity across your projects.</p>
      </div>
      <DeploymentTable deployments={mockDeployments} />
    </div>
  );
};

export default DeploymentsPage;
