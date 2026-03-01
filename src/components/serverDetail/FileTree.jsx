import { useState } from "react";
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function FileTree({ server }) {
  const [expanded, setExpanded] = useState({
    "/": true,
    "/home": false,
    "/var": false,
    "/etc": false,
  });

  const toggleFolder = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const fileStructure = [
    {
      name: "home",
      path: "/home",
      type: "folder",
      children: [
        { name: "user", path: "/home/user", type: "folder" },
        { name: "admin", path: "/home/admin", type: "folder" },
      ],
    },
    {
      name: "var",
      path: "/var",
      type: "folder",
      children: [
        { name: "log", path: "/var/log", type: "folder" },
        { name: "www", path: "/var/www", type: "folder" },
      ],
    },
    {
      name: "etc",
      path: "/etc",
      type: "folder",
      children: [
        { name: "nginx", path: "/etc/nginx", type: "folder" },
        { name: "apache2", path: "/etc/apache2", type: "folder" },
        { name: "hosts", path: "/etc/hosts", type: "file" },
      ],
    },
  ];

  const renderItem = (item, depth = 0) => {
    const isExpanded = expanded[item.path];
    const Icon =
      item.type === "folder" ? (isExpanded ? FolderOpen : Folder) : File;

    return (
      <div key={item.path}>
        <div
          className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-accent"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => item.type === "folder" && toggleFolder(item.path)}
        >
          {item.type === "folder" &&
            (isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            ))}
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm">{item.name}</span>
        </div>
        {item.type === "folder" && isExpanded && item.children && (
          <div>
            {item.children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full p-2 overflow-y-auto border rounded-lg bg-card">
      <div className="pb-2 mb-2 border-b">
        <p className="text-sm font-semibold text-muted-foreground">
          파일 시스템
        </p>
        <p className="text-xs text-muted-foreground">{server.label}</p>
      </div>
      <div>
        <div className="flex items-center gap-2 px-2 py-1 font-semibold">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="text-sm">/</span>
        </div>
        {fileStructure.map((item) => renderItem(item, 0))}
      </div>
    </div>
  );
}
