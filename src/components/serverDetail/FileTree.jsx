import { useState } from "react";
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, Loader } from "lucide-react";
import { useServerFiles } from "@/hooks/queries/useServerFiles";

function FileNode({ name, path, type, serverId, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = type === "directory";

  const { data: children, isLoading } = useServerFiles(
    isFolder && expanded ? serverId : null,
    path
  );

  const toggle = () => {
    if (isFolder) setExpanded((v) => !v);
  };

  const Icon = isFolder ? (expanded ? FolderOpen : Folder) : File;

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-accent"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={toggle}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3" />
        )}
        {isLoading ? (
          <Loader className="w-4 h-4 shrink-0 animate-spin text-primary" />
        ) : (
          <Icon className="w-4 h-4 shrink-0 text-primary" />
        )}
        <span className="text-sm truncate">{name}</span>
      </div>
      {isFolder && expanded && children && (
        <div>
          {children.map((item) => (
            <FileNode
              key={item.path}
              {...item}
              serverId={serverId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ server, serverId }) {
  const { data: rootFiles, isLoading } = useServerFiles(serverId, "/");

  return (
    <div className="h-full p-2 overflow-y-auto border rounded-lg bg-card">
      <div className="pb-2 mb-2 border-b">
        <p className="text-sm font-semibold text-muted-foreground">파일 시스템</p>
        <p className="text-xs text-muted-foreground">{server.label}</p>
      </div>
      <div>
        <div className="flex items-center gap-2 px-2 py-1 font-semibold">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="text-sm">/</span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
            <Loader className="w-3 h-3 animate-spin" />
            로딩 중...
          </div>
        )}
        {rootFiles?.map((item) => (
          <FileNode key={item.path} {...item} serverId={serverId} depth={0} />
        ))}
      </div>
    </div>
  );
}
