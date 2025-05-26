import { Diagram } from "@/features/diagram";
import NavbarComponent from "@/components/navbar";
import { SidebarComponent } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col">
      <NavbarComponent></NavbarComponent>
      <div className="h-full w-full flex flex-row">
        <SidebarComponent></SidebarComponent>
        <Diagram></Diagram>
      </div>
    </div>
  )
}
