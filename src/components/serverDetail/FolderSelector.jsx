import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function FolderSelector({ onSelect, onClose }) {
  const [expanded, setExpanded] = useState({
    "/": true,
    "/usr": false,
    "/usr/local": false,
    "/var": false,
    "/var/lib": false,
    "/opt": false,
    "/etc": false,
  });

  const [selectedFolder, setSelectedFolder] = useState("");

  const toggleFolder = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const fileStructure = [
    {
      name: "usr",
      path: "/usr",
      type: "folder",
      children: [
        {
          name: "local",
          path: "/usr/local",
          type: "folder",
          children: [
            { name: "bin", path: "/usr/local/bin", type: "folder" },
            { name: "lib", path: "/usr/local/lib", type: "folder" },
            { name: "apache2", path: "/usr/local/apache2", type: "folder" },
            { name: "nginx", path: "/usr/local/nginx", type: "folder" },
          ],
        },
        { name: "bin", path: "/usr/bin", type: "folder" },
        { name: "lib", path: "/usr/lib", type: "folder" },
      ],
    },
    {
      name: "var",
      path: "/var",
      type: "folder",
      children: [
        {
          name: "lib",
          path: "/var/lib",
          type: "folder",
          children: [
            { name: "mysql", path: "/var/lib/mysql", type: "folder" },
            { name: "postgresql", path: "/var/lib/postgresql", type: "folder" },
            { name: "mongodb", path: "/var/lib/mongodb", type: "folder" },
            { name: "redis", path: "/var/lib/redis", type: "folder" },
          ],
        },
        { name: "log", path: "/var/log", type: "folder" },
        { name: "www", path: "/var/www", type: "folder" },
      ],
    },
    {
      name: "opt",
      path: "/opt",
      type: "folder",
      children: [
        { name: "tomcat", path: "/opt/tomcat", type: "folder" },
        { name: "java", path: "/opt/java", type: "folder" },
      ],
    },
    {
      name: "etc",
      path: "/etc",
      type: "folder",
      children: [
        { name: "nginx", path: "/etc/nginx", type: "folder" },
        { name: "apache2", path: "/etc/apache2", type: "folder" },
      ],
    },
  ];

  const renderItem = (item, depth = 0) => {
    const isExpanded = expanded[item.path];
    const isSelected = selectedFolder === item.path;
    const Icon =
      item.type === "folder" ? (isExpanded ? FolderOpen : Folder) : File;

    return (
      <div key={item.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-accent"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.path);
              setSelectedFolder(item.path);
            }
          }}
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

  const handleConfirm = () => {
    if (selectedFolder) {
      if (confirm(`${selectedFolder} 경로에 설치하시겠습니까?`)) {
        onSelect(selectedFolder);
        onClose();
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>설치 경로 선택</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="p-2 mb-4 overflow-y-auto border rounded-lg h-96 bg-card">
            <div className="pb-2 mb-2 border-b">
              <p className="text-sm font-semibold text-muted-foreground">
                서버 폴더 구조
              </p>
              {selectedFolder && (
                <p className="mt-1 text-xs text-primary">
                  선택된 경로: {selectedFolder}
                </p>
              )}
            </div>
            <div>
              <div
                className={`flex items-center gap-2 py-1 px-2 font-semibold rounded cursor-pointer transition-colors ${
                  selectedFolder === "/"
                    ? "bg-primary/20 ring-1 ring-primary"
                    : "hover:bg-accent"
                }`}
                onClick={() => setSelectedFolder("/")}
              >
                <FolderOpen className="w-4 h-4 text-primary" />
                <span className="text-sm">/</span>
              </div>
              {fileStructure.map((item) => renderItem(item, 0))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={!selectedFolder}
            >
              선택 완료
            </Button>
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
