interface SidebarItemProps {
  name: string;
  onDelete?: () => void;
  onClick?: () => void;
  onEdit?: () => void;
}

export function SidebarItem({ name, onDelete, onClick, onEdit }: SidebarItemProps) {
  return (
    <li className="flex justify-between items-center">
      <span className="cursor-pointer" onClick={onClick}>{name}</span>
      <div className="flex gap-1">
        <button onClick={onEdit} className="text-sm text-blue-500">Editar</button>
        <button onClick={onDelete} className="text-sm text-red-500">Excluir</button>
      </div>
    </li>
  );
}
