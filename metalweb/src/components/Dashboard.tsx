import { Button } from '@blueprintjs/core';

export interface DashboardStats {
  status: string;
  inference: string;
  onlineNodes: string;
  cpu: string;
  gpu: string;
  hdd: string;
}

type Props = Partial<DashboardStats>;   // all props optional for now

export default function DashboardBar({
  status = 'Online',
  inference = '10 tokens/s',
  onlineNodes = '5/10',
  cpu = '10 THz',
  gpu = '10 PFlops',
  hdd = '10 TB',
}: Props) {
  return (
    <div className="dashboard-section">
      {/* network button keeps the old styling */}
      <Button minimal className="simple-btn">
        Network
      </Button>

      <div className="dashboard-item">Status: {status}</div>
      <div className="dashboard-item">Inference: {inference}</div>
      <div className="dashboard-item">Online Nodes: {onlineNodes}</div>
      <div className="dashboard-item">CPU: {cpu}</div>
      <div className="dashboard-item">GPU: {gpu}</div>
      <div className="dashboard-item">HDD: {hdd}</div>
    </div>
  );
}
