import DiagramCanvas from "@/features/diagram";
import NavbarComponent from "@/components/navbar";
import { Sidebar } from "@/components/sidebar/sidebar.component";
import RightInspector from "@/components/inspector/RightInspector";

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col">
      <NavbarComponent />
      {/* floating controls */}
      <div className="h-full w-full flex pl-10 pr-10 pb-10 pt-20 absolute">
        <Sidebar />
      </div>
      <DiagramCanvas />
      {/* Painel flutuante */}
      <RightInspector />
    </div>
  );
}
