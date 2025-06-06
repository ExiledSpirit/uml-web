import { Diagram } from "@/features/diagram";
import NavbarComponent from "@/components/navbar";
import { Sidebar } from "@/components/sidebar/sidebar.component";

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col">
      <NavbarComponent />
      <div className="h-full w-full flex flex-row">
        <Sidebar />
        <Diagram />
      </div>
    </div>
  );
}
