import { Scene3D } from '@/components/Canvas3D/Scene3D';
import { PropertiesPanel } from '@/components/UI/PropertiesPanel';
import { ToolPanel } from '@/components/UI/ToolPanel';
import { ViewControls } from '@/components/UI/ViewControls';

export default function App() {
  return (
    <div className="h-screen w-screen relative">
      <Scene3D />
      <ToolPanel />
      <ViewControls />
      <PropertiesPanel />
    </div>
  );
}
