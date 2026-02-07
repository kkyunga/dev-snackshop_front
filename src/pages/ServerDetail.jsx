import { useState, useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Server,
  X,
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  Calendar,
  Terminal as TerminalIcon,
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Package,
  Plus,
  Trash2,
  Zap,
  Settings,
  Download,
  FolderSearch,
  User,
  Bell,
  Upload,
  Shield,
  Database,
  AlertTriangle,
  Lock,
  CheckCircle,
  Clock,
  GitBranch,
  Github,
  Play,
  Loader,
  XCircle,
  RotateCcw,
  FileCode,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function FileTree({ server }) {
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

function Terminal({ server }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const wsRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // SSH 접속 정보
  const sshConfig = {
    host: "223.130.159.24",
    username: "root",
    password: "L7?4U7UNt7ye",
    port: 22,
  };

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9080";
  const WS_URL = API_BASE_URL.replace("http", "ws") + "/api/ws/ssh";
  alert(WS_URL);
  useEffect(() => {
    // xterm 초기화
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#1a1a2e",
        foreground: "#00ff00",
        cursor: "#00ff00",
        cursorAccent: "#1a1a2e",
        selectionBackground: "#3d3d5c",
      },
      rows: 24,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddon.fit();
    }

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // 초기 메시지
    term.writeln("\x1b[33m=== SSH Terminal ===\x1b[0m");
    term.writeln(`\x1b[36mServer: ${server.label} (${server.ip})\x1b[0m`);
    term.writeln(
      '\x1b[33m"연결" 버튼을 클릭하여 SSH 접속을 시작하세요.\x1b[0m',
    );
    term.writeln("");

    // 창 크기 조절 시 터미널 크기 맞춤
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [server]);

  const connectSSH = () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    const term = xtermRef.current;
    term.writeln("\x1b[33mSSH 연결 중...\x1b[0m");

    // WebSocket 연결
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    debugger;
    ws.onopen = () => {
      console.log("WebSocket 연결됨");
      // SSH 접속 정보 전송
      ws.send(
        JSON.stringify({
          type: "connect",
          host: sshConfig.host,
          port: sshConfig.port,
          username: sshConfig.username,
          password: sshConfig.password,
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connected") {
        setIsConnected(true);
        setIsConnecting(false);
        term.writeln("\x1b[32mSSH 연결 성공!\x1b[0m");
        term.writeln("");
      } else if (data.type === "data") {
        term.write(data.data);
      } else if (data.type === "error") {
        setConnectionError(data.message);
        setIsConnecting(false);
        term.writeln(`\x1b[31m오류: ${data.message}\x1b[0m`);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket 오류:", error);
      setConnectionError("WebSocket 연결 실패");
      setIsConnecting(false);
      term.writeln(
        "\x1b[31mWebSocket 연결 실패. 백엔드 서버가 실행 중인지 확인하세요.\x1b[0m",
      );
    };

    ws.onclose = () => {
      console.log("WebSocket 연결 종료");
      setIsConnected(false);
      setIsConnecting(false);
      term.writeln("\x1b[33m연결이 종료되었습니다.\x1b[0m");
    };

    // 터미널 입력을 WebSocket으로 전송
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "input", data }));
      }
    });
  };

  const disconnectSSH = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    const term = xtermRef.current;
    term.writeln("\x1b[33m연결을 끊었습니다.\x1b[0m");
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a2e] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 text-green-400">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-sm">Terminal - {server.label}</span>
          {isConnected && (
            <Badge className="text-xs bg-green-500">연결됨</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button
              size="sm"
              onClick={connectSSH}
              disabled={isConnecting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConnecting ? (
                <>
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  연결 중...
                </>
              ) : (
                "연결"
              )}
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={disconnectSSH}>
              연결 끊기
            </Button>
          )}
        </div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 p-2"
        style={{ minHeight: "400px" }}
      />

      {connectionError && (
        <div className="px-4 py-2 text-sm text-red-300 bg-red-900/50">
          {connectionError}
        </div>
      )}
    </div>
  );
}

function FolderSelector({ onSelect, onClose }) {
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

function BackupSecurity({ server }) {
  const [backupTab, setBackupTab] = useState("middleware"); // 'middleware' or 'source-log'
  const [middlewareBackupTargets, setMiddlewareBackupTargets] = useState({
    apache: true,
    apache_error: false,
    apache_access: false,
    mysql: true,
    mysql_error: false,
    mysql_slow: false,
    mysql_general: false,
    php: false,
    php_error: false,
    redis: false,
    redis_log: false,
    nginx: true,
    nginx_error: false,
    nginx_access: false,
  });
  const [sourceBackupTargets, setSourceBackupTargets] = useState({
    web1: false,
    web2: false,
    api1: false,
    api2: false,
    config1: false,
    config2: false,
    db1: false,
    db2: false,
    static1: false,
    static2: false,
  });
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [storageLocation, setStorageLocation] = useState("local");
  const [localBackupPath, setLocalBackupPath] = useState("/backup");
  const [s3BucketName, setS3BucketName] = useState("");
  const [s3Region, setS3Region] = useState("ap-northeast-2");
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [newPort, setNewPort] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [currentBackupItem, setCurrentBackupItem] = useState("");

  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      name: "240522_apache_backup.tar.gz",
      size: "80MB",
      date: "2024-05-22 03:00",
      type: "middleware",
      category: "Apache",
    },
    {
      id: 2,
      name: "240522_mysql_backup.sql",
      size: "150MB",
      date: "2024-05-22 03:00",
      type: "middleware",
      category: "MySQL",
    },
    {
      id: 3,
      name: "240521_nginx_access.log",
      size: "45MB",
      date: "2024-05-21 03:00",
      type: "log",
      category: "Nginx Access Log",
    },
    {
      id: 4,
      name: "240520_system.log",
      size: "30MB",
      date: "2024-05-20 03:00",
      type: "log",
      category: "System Log",
    },
  ]);

  // 설치된 미들웨어 목록 (실제로는 MiddlewareManager에서 가져와야 함)
  const installedMiddleware = [
    {
      id: "apache",
      name: "Apache",
      version: "2.4.52",
      size: "~80MB",
      logs: [
        { id: "apache_error", name: "에러 로그", size: "~15MB" },
        { id: "apache_access", name: "접속 로그", size: "~50MB" },
      ],
    },
    {
      id: "mysql",
      name: "MySQL",
      version: "8.0.32",
      size: "~150MB",
      logs: [
        { id: "mysql_error", name: "에러 로그", size: "~25MB" },
        { id: "mysql_slow", name: "슬로우 쿼리 로그", size: "~15MB" },
        { id: "mysql_general", name: "일반 로그", size: "~80MB" },
      ],
    },
    {
      id: "php",
      name: "PHP",
      version: "8.1.12",
      size: "~50MB",
      logs: [{ id: "php_error", name: "에러 로그", size: "~10MB" }],
    },
    {
      id: "redis",
      name: "Redis",
      version: "7.0.5",
      size: "~20MB",
      logs: [{ id: "redis_log", name: "운영 로그", size: "~5MB" }],
    },
    {
      id: "nginx",
      name: "Nginx",
      version: "1.22.1",
      size: "~10MB",
      logs: [
        { id: "nginx_error", name: "에러 로그", size: "~8MB" },
        { id: "nginx_access", name: "접속 로그", size: "~45MB" },
      ],
    },
  ];

  // 소스 코드 파일 목록
  const sourceFiles = [
    {
      id: "web1",
      name: "web-source-20260128.tar.gz",
      path: "/var/www/html",
      size: "~250MB",
      category: "웹 소스",
    },
    {
      id: "web2",
      name: "web-source-20260127.tar.gz",
      path: "/var/www/html",
      size: "~248MB",
      category: "웹 소스",
    },
    {
      id: "api1",
      name: "api-server-20260128.tar.gz",
      path: "/opt/api",
      size: "~180MB",
      category: "API 서버",
    },
    {
      id: "api2",
      name: "api-server-20260127.tar.gz",
      path: "/opt/api",
      size: "~178MB",
      category: "API 서버",
    },
    {
      id: "config1",
      name: "nginx-config-20260128.tar",
      path: "/etc/nginx",
      size: "~5MB",
      category: "설정 파일",
    },
    {
      id: "config2",
      name: "apache-config-20260127.tar",
      path: "/etc/apache2",
      size: "~8MB",
      category: "설정 파일",
    },
    {
      id: "db1",
      name: "database-schema-20260128.sql",
      path: "/backup/db",
      size: "~120MB",
      category: "데이터베이스",
    },
    {
      id: "db2",
      name: "database-schema-20260127.sql",
      path: "/backup/db",
      size: "~118MB",
      category: "데이터베이스",
    },
    {
      id: "static1",
      name: "static-assets-20260128.tar.gz",
      path: "/var/www/static",
      size: "~350MB",
      category: "정적 파일",
    },
    {
      id: "static2",
      name: "static-assets-20260127.tar.gz",
      path: "/var/www/static",
      size: "~348MB",
      category: "정적 파일",
    },
  ];

  const [sourceSearchQuery, setSourceSearchQuery] = useState("");
  const [selectedMiddleware, setSelectedMiddleware] = useState(null);

  const [firewallRules, setFirewallRules] = useState([
    { id: 1, service: "SSH", port: "22", protocol: "TCP", status: "allowed" },
    { id: 2, service: "HTTP", port: "80", protocol: "TCP", status: "allowed" },
    {
      id: 3,
      service: "HTTPS",
      port: "443",
      protocol: "TCP",
      status: "allowed",
    },
  ]);

  const [securityLogs, setSecurityLogs] = useState([
    {
      id: 1,
      time: "2024-05-22 10:15:02",
      level: "INFO",
      message: "외부 IP(211.x.x.x)로부터 80포트 접속 허용",
    },
    {
      id: 2,
      time: "2024-05-22 09:40:11",
      level: "WARN",
      message: "미등록 IP(1.x.x.x)의 22포트 접속 시도 5회 실패 -> IP 차단됨",
    },
    {
      id: 3,
      time: "2024-05-22 08:30:45",
      level: "INFO",
      message: "MySQL 백업 완료: 240522_db_full.sql",
    },
    {
      id: 4,
      time: "2024-05-22 07:20:33",
      level: "WARN",
      message: "비정상적인 트래픽 패턴 감지 (Rate: 1000 req/s)",
    },
  ]);

  const handleBackupNow = async () => {
    const targets = [];
    const targetDetails = [];

    if (backupTab === "middleware") {
      // 미들웨어 및 로그 백업
      installedMiddleware.forEach((mw) => {
        // 미들웨어 자체 백업
        if (middlewareBackupTargets[mw.id]) {
          targets.push(mw.name);
          targetDetails.push({
            name: mw.name,
            type: "middleware",
            category: mw.name,
            fileName: `${mw.id}_backup.tar.gz`,
            size: mw.size.replace("~", ""),
          });
        }
        // 미들웨어 로그 백업
        mw.logs.forEach((log) => {
          if (middlewareBackupTargets[log.id]) {
            targets.push(`${mw.name} ${log.name}`);
            targetDetails.push({
              name: `${mw.name} ${log.name}`,
              type: "log",
              category: `${mw.name} ${log.name}`,
              fileName: `${log.id}_20260128.log`,
              size: log.size.replace("~", ""),
            });
          }
        });
      });
    } else {
      // 소스 코드 백업 - 동적으로 처리
      sourceFiles.forEach((source) => {
        if (sourceBackupTargets[source.id]) {
          targets.push(source.name);
          targetDetails.push({
            name: source.name,
            type: "source",
            category: source.category,
            fileName: source.name,
            size: source.size.replace("~", ""),
          });
        }
      });
    }

    if (targets.length === 0) {
      alert("백업할 항목을 선택해주세요.");
      return;
    }

    setIsBackingUp(true);
    setBackupProgress(0);

    const totalSteps = targetDetails.length;
    let currentStep = 0;

    for (const target of targetDetails) {
      setCurrentBackupItem(target.name);

      // 백업 진행 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      currentStep++;
      setBackupProgress((currentStep / totalSteps) * 100);
    }

    // 백업 완료 후 히스토리에 추가
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
    const timeStr = now.toISOString().slice(0, 16).replace("T", " ");

    const newBackups = targetDetails.map((target, index) => ({
      id: Math.max(...backupHistory.map((b) => b.id), 0) + index + 1,
      name: `${dateStr}_${target.fileName}`,
      size: target.size,
      date: timeStr,
      type: target.type,
      category: target.category,
    }));

    setBackupHistory([...newBackups, ...backupHistory]);
    setIsBackingUp(false);
    setBackupProgress(0);
    setCurrentBackupItem("");
  };

  const handleToggleFirewall = (id) => {
    setFirewallRules(
      firewallRules.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              status: rule.status === "allowed" ? "blocked" : "allowed",
            }
          : rule,
      ),
    );
  };

  const handleAddFirewallRule = () => {
    if (!newServiceName || !newPort) {
      alert("서비스 명과 포트를 입력해주세요.");
      return;
    }

    const newRule = {
      id: Math.max(...firewallRules.map((r) => r.id), 0) + 1,
      service: newServiceName,
      port: newPort,
      protocol: "TCP",
      status: "allowed",
    };

    setFirewallRules([...firewallRules, newRule]);
    setNewServiceName("");
    setNewPort("");
  };

  const handleDeleteBackup = (id) => {
    if (confirm("이 백업 파일을 삭제하시겠습니까?")) {
      setBackupHistory(backupHistory.filter((b) => b.id !== id));
    }
  };

  const handleRestore = (backup) => {
    if (
      confirm(
        `${backup.name} 파일로 복원하시겠습니까?\n현재 데이터가 백업되고 이 파일로 교체됩니다.`,
      )
    ) {
      alert("복원이 시작되었습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단: 보안 상태 요약 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                최근 백업
              </CardTitle>
              <Database className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold">성공</span>
            </div>
            <p className="text-sm text-muted-foreground">2024-05-22 03:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                방화벽 상태
              </CardTitle>
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-semibold">활성화</span>
            </div>
            <p className="text-sm text-muted-foreground">
              허용된 포트:{" "}
              {firewallRules.filter((r) => r.status === "allowed").length}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                보안 위협
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-green-600">낮음</span>
            </div>
            <p className="text-sm text-muted-foreground">
              최근 24시간 내 차단: 12건
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 중단: 백업 관리 + 방화벽 제어 */}
      {/* 첫 번째 로우: 데이터 백업 관리 (좌측) + 백업 설정 (우측) */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 백업 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 좌측: 백업 대상 선택 (탭 + 리스트) */}
            <div className="space-y-4">
              {/* 탭 네비게이션 */}
              <div className="flex gap-2 border-b">
                <button
                  className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                    backupTab === "middleware"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setBackupTab("middleware")}
                >
                  미들웨어
                  {backupTab === "middleware" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                    backupTab === "source-log"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setBackupTab("source-log")}
                >
                  소스/로그
                  {backupTab === "source-log" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>

              {/* 미들웨어 백업 탭 */}
              {backupTab === "middleware" && (
                <div className="space-y-4">
                  <div>
                    <Label className="block mb-2 text-sm font-medium">
                      설치된 미들웨어 및 로그
                    </Label>
                    <div className="p-2 space-y-3 overflow-y-auto border rounded-lg max-h-96">
                      {installedMiddleware.map((mw) => (
                        <div
                          key={mw.id}
                          className="p-3 border rounded-lg bg-accent/20"
                        >
                          {/* 미들웨어 자체 */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`mw-${mw.id}`}
                                checked={middlewareBackupTargets[mw.id]}
                                onChange={(e) =>
                                  setMiddlewareBackupTargets({
                                    ...middlewareBackupTargets,
                                    [mw.id]: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`mw-${mw.id}`}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <Package className="w-5 h-5 text-primary" />
                                  <span className="font-semibold">
                                    {mw.name}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    v{mw.version}
                                  </Badge>
                                </div>
                              </label>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {mw.size}
                            </span>
                          </div>

                          {/* 미들웨어 로그들 */}
                          {mw.logs.length > 0 && (
                            <div className="pl-3 mt-2 ml-6 space-y-1 border-l-2 border-primary/30">
                              {mw.logs.map((log) => (
                                <div
                                  key={log.id}
                                  className="flex items-center justify-between p-1.5 hover:bg-accent/50 rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id={`log-${log.id}`}
                                      checked={middlewareBackupTargets[log.id]}
                                      onChange={(e) =>
                                        setMiddlewareBackupTargets({
                                          ...middlewareBackupTargets,
                                          [log.id]: e.target.checked,
                                        })
                                      }
                                      className="w-3.5 h-3.5 rounded border-gray-300"
                                    />
                                    <label
                                      htmlFor={`log-${log.id}`}
                                      className="text-xs cursor-pointer"
                                    >
                                      <span className="text-muted-foreground">
                                        {log.name}
                                      </span>
                                    </label>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {log.size}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 소스 코드 백업 탭 */}
              {backupTab === "source-log" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">소스 파일</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const filteredSources = sourceFiles.filter((source) =>
                            source.name
                              .toLowerCase()
                              .includes(sourceSearchQuery.toLowerCase()),
                          );
                          const allChecked = filteredSources.every(
                            (source) => sourceBackupTargets[source.id],
                          );
                          const newTargets = { ...sourceBackupTargets };
                          filteredSources.forEach((source) => {
                            newTargets[source.id] = !allChecked;
                          });
                          setSourceBackupTargets(newTargets);
                        }}
                      >
                        {sourceFiles
                          .filter((source) =>
                            source.name
                              .toLowerCase()
                              .includes(sourceSearchQuery.toLowerCase()),
                          )
                          .every((source) => sourceBackupTargets[source.id])
                          ? "전체 해제"
                          : "전체 선택"}
                      </Button>
                    </div>

                    {/* 검색 입력 */}
                    <Input
                      placeholder="소스 파일 검색 (예: web, api, 20260128...)"
                      value={sourceSearchQuery}
                      onChange={(e) => setSourceSearchQuery(e.target.value)}
                      className="mb-2"
                    />

                    <div className="p-2 space-y-2 overflow-y-auto border rounded-lg max-h-96">
                      {sourceFiles
                        .filter((source) =>
                          source.name
                            .toLowerCase()
                            .includes(sourceSearchQuery.toLowerCase()),
                        )
                        .map((source) => (
                          <div
                            key={source.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-accent/50"
                          >
                            <div className="flex items-center flex-1 gap-2">
                              <input
                                type="checkbox"
                                id={`source-${source.id}`}
                                checked={sourceBackupTargets[source.id]}
                                onChange={(e) =>
                                  setSourceBackupTargets({
                                    ...sourceBackupTargets,
                                    [source.id]: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`source-${source.id}`}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-primary" />
                                    <span className="font-medium">
                                      {source.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {source.category}
                                    </Badge>
                                  </div>
                                  <span className="ml-6 text-xs text-muted-foreground">
                                    {source.path}
                                  </span>
                                </div>
                              </label>
                            </div>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {source.size}
                            </span>
                          </div>
                        ))}
                      {sourceFiles.filter((source) =>
                        source.name
                          .toLowerCase()
                          .includes(sourceSearchQuery.toLowerCase()),
                      ).length === 0 && (
                        <div className="py-8 text-sm text-center text-muted-foreground">
                          검색 결과가 없습니다.
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {
                        sourceFiles.filter((source) =>
                          source.name
                            .toLowerCase()
                            .includes(sourceSearchQuery.toLowerCase()),
                        ).length
                      }
                      개 파일 표시 중
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 우측: 백업 주기 + 저장 위치 */}
            <div className="space-y-4">
              {/* 탭 높이만큼 상단 여백 추가 */}
              <div className="h-10"></div>

              <div>
                <Label className="block mb-2 text-sm font-medium">
                  백업 주기
                </Label>
                <select
                  className="w-full h-10 px-3 border rounded-md border-input bg-background"
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                  <option value="manual">수동</option>
                </select>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-medium">
                  저장 위치
                </Label>
                <div className="space-y-3">
                  {/* 로컬 서버 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="local"
                        name="storage"
                        value="local"
                        checked={storageLocation === "local"}
                        onChange={(e) => setStorageLocation(e.target.value)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="local"
                        className="text-sm font-medium cursor-pointer"
                      >
                        로컬 서버
                      </label>
                    </div>
                    {storageLocation === "local" && (
                      <div className="ml-6 space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          백업 저장 경로
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={localBackupPath}
                            onChange={(e) => setLocalBackupPath(e.target.value)}
                            placeholder="/backup"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPathSelector(true)}
                          >
                            <FolderSearch className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* S3 스토리지 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="external"
                        name="storage"
                        value="external"
                        checked={storageLocation === "external"}
                        onChange={(e) => setStorageLocation(e.target.value)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="external"
                        className="text-sm font-medium cursor-pointer"
                      >
                        외부 스토리지 (S3)
                      </label>
                    </div>
                    {storageLocation === "external" && (
                      <div className="ml-6 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            S3 버킷 이름
                          </Label>
                          <Input
                            value={s3BucketName}
                            onChange={(e) => setS3BucketName(e.target.value)}
                            placeholder="my-backup-bucket"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            리전
                          </Label>
                          <select
                            className="w-full h-10 px-3 border rounded-md border-input bg-background"
                            value={s3Region}
                            onChange={(e) => setS3Region(e.target.value)}
                          >
                            <option value="ap-northeast-2">
                              서울 (ap-northeast-2)
                            </option>
                            <option value="ap-northeast-1">
                              도쿄 (ap-northeast-1)
                            </option>
                            <option value="us-east-1">
                              버지니아 북부 (us-east-1)
                            </option>
                            <option value="us-west-2">
                              오레곤 (us-west-2)
                            </option>
                            <option value="eu-west-1">
                              아일랜드 (eu-west-1)
                            </option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            저장 경로 (선택)
                          </Label>
                          <Input
                            placeholder="backups/server-name/"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 폴더 선택기 팝업 */}
              {showPathSelector && (
                <FolderSelector
                  onSelect={(path) => {
                    setLocalBackupPath(path);
                    setShowPathSelector(false);
                  }}
                  onClose={() => setShowPathSelector(false)}
                />
              )}
            </div>
          </div>

          {/* 백업 버튼 - 맨 아래 중앙 */}
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-md space-y-4">
              <Button
                onClick={handleBackupNow}
                className="w-full"
                disabled={isBackingUp}
              >
                {isBackingUp ? "백업 중..." : "지금 백업하기"}
              </Button>

              {isBackingUp && (
                <div className="p-4 space-y-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">백업 진행 중...</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(backupProgress)}%
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="relative h-full overflow-hidden transition-all duration-300 ease-out bg-primary"
                      style={{ width: `${backupProgress}%` }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {currentBackupItem} 백업 중...
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 두 번째 로우: 백업 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle>백업 히스토리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {backupHistory.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-3 transition-colors border rounded-lg hover:bg-accent/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{backup.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {backup.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {backup.size} • {backup.date}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(backup)}
                  >
                    복원
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert("다운로드 시작")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteBackup(backup.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 세 번째 로우: 네트워크 보안/방화벽 */}
      <Card>
        <CardHeader>
          <CardTitle>네트워크 보안 / 방화벽</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold">방화벽 규칙 설정</h4>
            <div className="overflow-y-auto border rounded-lg max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 font-medium text-left">서비스 명</th>
                    <th className="p-3 font-medium text-left">
                      포트 / 프로토콜
                    </th>
                    <th className="p-3 font-medium text-left">상태</th>
                    <th className="p-3 font-medium text-left">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {firewallRules.map((rule) => (
                    <tr key={rule.id} className="border-t">
                      <td className="p-3">{rule.service}</td>
                      <td className="p-3">
                        {rule.port} / {rule.protocol}
                      </td>
                      <td className="p-3">
                        {rule.status === "allowed" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            허용됨
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            차단됨
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant={
                            rule.status === "allowed"
                              ? "destructive"
                              : "default"
                          }
                          onClick={() => handleToggleFirewall(rule.id)}
                        >
                          {rule.status === "allowed" ? "차단" : "허용"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30">
                    <td className="p-3">
                      <Input
                        placeholder="서비스 명"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="h-8"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        placeholder="포트 번호"
                        value={newPort}
                        onChange={(e) => setNewPort(e.target.value)}
                        className="h-8"
                      />
                    </td>
                    <td className="p-3 text-muted-foreground">-</td>
                    <td className="p-3">
                      <Button size="sm" onClick={handleAddFirewallRule}>
                        규칙 추가
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단: 실시간 보안 로그 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle>실시간 보안 로그</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 space-y-1 overflow-y-auto font-mono text-sm text-green-400 bg-black rounded-lg max-h-64">
            {securityLogs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-gray-500">[{log.time}]</span>
                <span
                  className={
                    log.level === "INFO"
                      ? "text-blue-400"
                      : log.level === "WARN"
                        ? "text-yellow-400"
                        : log.level === "ERROR"
                          ? "text-red-400"
                          : "text-green-400"
                  }
                >
                  [{log.level}]
                </span>
                <span className="text-green-400">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ManagementDeploy({ server }) {
  const [deployMode, setDeployMode] = useState("github"); // 'github', 'internal', 'manual'
  const [gitConfig, setGitConfig] = useState({
    repoUrl: "",
    branch: "main",
    token: "",
  });
  const [buildScript, setBuildScript] = useState(
    "npm install && npm run build",
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [deployHistory, setDeployHistory] = useState([
    {
      id: 1,
      date: "2026-01-25 12:00",
      method: "GitHub",
      info: "v1.2.1 - 메인 배너 수정 (hash: a1b2c3)",
      status: "active",
    },
    {
      id: 2,
      date: "2026-01-25 11:30",
      method: "Manual",
      info: "manual_backup_20260125.zip",
      status: "completed",
    },
    {
      id: 3,
      date: "2026-01-24 18:00",
      method: "Internal",
      info: "v1.2.0 - API 최적화 (hash: d4e5f6)",
      status: "completed",
    },
  ]);

  const deploySteps = [
    { id: 1, name: "소스 확보", icon: GitBranch },
    { id: 2, name: "의존성 설치", icon: Package },
    { id: 3, name: "빌드/컴파일", icon: Settings },
    { id: 4, name: "서비스 재시작", icon: Zap },
    { id: 5, name: "완료", icon: CheckCircle },
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setCurrentStep(0);
    setDeployLogs([]);

    const steps = [
      { message: "Fetching source from repository...", delay: 1500 },
      { message: "Running npm install...", delay: 2000 },
      { message: "Building application...", delay: 2500 },
      { message: "Restarting services...", delay: 1500 },
      { message: "Deployment completed successfully!", delay: 1000 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setDeployLogs((prev) => [...prev, `> [${timeStr}] ${steps[i].message}`]);
      setCurrentStep(i + 1);

      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
    }

    // 배포 완료 후 히스토리에 추가
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace("T", " ");
    const newDeploy = {
      id: Math.max(...deployHistory.map((d) => d.id), 0) + 1,
      date: dateStr,
      method:
        deployMode === "github"
          ? "GitHub"
          : deployMode === "internal"
            ? "Internal"
            : "Manual",
      info:
        deployMode === "github"
          ? `${gitConfig.branch} branch - hash: ${Math.random().toString(36).substr(2, 6)}`
          : "Manual deployment",
      status: "active",
    };

    setDeployHistory([
      newDeploy,
      ...deployHistory.map((d) => ({ ...d, status: "completed" })),
    ]);
    setIsDeploying(false);
  };

  const handleRollback = (deploy) => {
    if (confirm(`${deploy.info}\n이 시점으로 서버 소스를 되돌리시겠습니까?`)) {
      alert("현재 운영 중인 소스를 백업한 후 롤백을 시작합니다.");
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`${files.length}개 파일이 업로드되었습니다.`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      alert(`${files.length}개 파일이 업로드되었습니다.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단: 배포 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>배포 방식 및 소스 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 배포 모드 선택 */}
          <div>
            <Label className="block mb-3 text-sm font-medium">
              배포 모드 선택
            </Label>
            <div className="flex gap-2">
              <Button
                variant={deployMode === "github" ? "default" : "outline"}
                onClick={() => setDeployMode("github")}
                className="flex-1"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant={deployMode === "internal" ? "default" : "outline"}
                onClick={() => setDeployMode("internal")}
                className="flex-1"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                사내 Git
              </Button>
              <Button
                variant={deployMode === "manual" ? "default" : "outline"}
                onClick={() => setDeployMode("manual")}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                수동 업로드
              </Button>
            </div>
          </div>

          {/* Git 모드 설정 */}
          {(deployMode === "github" || deployMode === "internal") && (
            <div className="p-4 space-y-3 border rounded-lg bg-accent/20">
              <div className="space-y-2">
                <Label className="text-sm">Repository URL</Label>
                <Input
                  placeholder="https://github.com/username/repository.git"
                  value={gitConfig.repoUrl}
                  onChange={(e) =>
                    setGitConfig({ ...gitConfig, repoUrl: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Branch</Label>
                  <Input
                    placeholder="main"
                    value={gitConfig.branch}
                    onChange={(e) =>
                      setGitConfig({ ...gitConfig, branch: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Access Token</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={gitConfig.token}
                    onChange={(e) =>
                      setGitConfig({ ...gitConfig, token: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 수동 업로드 모드 */}
          {deployMode === "manual" && (
            <div
              className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/30 hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">
                파일을 드래그하여 업로드하거나 클릭하세요
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                ZIP, TAR.GZ 파일 지원
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".zip,.tar.gz,.tgz"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload").click()}
              >
                파일 선택
              </Button>
            </div>
          )}

          {/* 빌드 스크립트 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">빌드 스크립트</Label>
            <div className="relative">
              <FileCode className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
              <textarea
                className="w-full min-h-[100px] pl-10 pr-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
                value={buildScript}
                onChange={(e) => setBuildScript(e.target.value)}
                placeholder="npm install && npm run build"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              배포 시 실행할 명령어를 입력하세요
            </p>
          </div>

          {/* 배포 시작 버튼 */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isDeploying ? "배포 중..." : "실시간 배포 시작"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 중앙: 실시간 파이프라인 & 콘솔 */}
      {isDeploying && (
        <Card>
          <CardHeader>
            <CardTitle>실시간 배포 파이프라인</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 파이프라인 비주얼라이저 */}
            <div className="flex items-center justify-between gap-4">
              {deploySteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > index;
                const isActive = currentStep === index + 1;
                const isPending = currentStep < index + 1;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isCompleted
                            ? "bg-green-500"
                            : isActive
                              ? "bg-primary animate-pulse"
                              : "bg-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : isActive ? (
                          <Loader className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <StepIcon
                            className={`w-6 h-6 ${isPending ? "text-muted-foreground" : "text-white"}`}
                          />
                        )}
                      </div>
                      <p
                        className={`text-xs text-center font-medium ${
                          isCompleted
                            ? "text-green-600"
                            : isActive
                              ? "text-primary"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                    {index < deploySteps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 mt-[-24px] transition-all ${
                          currentStep > index + 1 ? "bg-green-500" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 실시간 로그 콘솔 */}
            <div>
              <h4 className="mb-3 text-sm font-semibold">배포 로그</h4>
              <div className="p-4 space-y-1 overflow-y-auto font-mono text-sm text-green-400 bg-black rounded-lg max-h-64">
                {deployLogs.map((log, index) => (
                  <div key={index} className="text-green-400">
                    {log}
                  </div>
                ))}
                {deployLogs.length === 0 && (
                  <div className="text-gray-500">
                    Waiting for deployment to start...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 하단: 배포 히스토리 & 롤백 */}
      <Card>
        <CardHeader>
          <CardTitle>배포 히스토리 및 롤백</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 font-medium text-left">배포 일시</th>
                  <th className="p-3 font-medium text-left">방식</th>
                  <th className="p-3 font-medium text-left">
                    배포 정보 (시점/커밋)
                  </th>
                  <th className="p-3 font-medium text-left">상태</th>
                  <th className="p-3 font-medium text-left">관리</th>
                </tr>
              </thead>
              <tbody>
                {deployHistory.map((deploy) => (
                  <tr key={deploy.id} className="border-t">
                    <td className="p-3">{deploy.date}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{deploy.method}</Badge>
                    </td>
                    <td className="p-3 font-mono text-xs">{deploy.info}</td>
                    <td className="p-3">
                      {deploy.status === "active" ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          운영중
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          완료
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert("로그를 확인합니다.")}
                        >
                          로그
                        </Button>
                        {deploy.status !== "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            onClick={() => handleRollback(deploy)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            롤백
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            * 롤백 시 현재 운영 중인 소스가 자동으로 백업됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MiddlewareManager({ server }) {
  const [installedMiddleware, setInstalledMiddleware] = useState([
    {
      id: 1,
      name: "Apache",
      version: "2.4.52",
      type: "Web Server",
      status: "running",
      path: "/usr/local/apache2",
    },
    {
      id: 2,
      name: "MySQL",
      version: "8.0.32",
      type: "Database",
      status: "running",
      path: "/var/lib/mysql",
    },
    {
      id: 3,
      name: "PHP",
      version: "8.1.12",
      type: "Runtime",
      status: "running",
      path: "/usr/local/php",
    },
    {
      id: 4,
      name: "Redis",
      version: "7.0.5",
      type: "Cache",
      status: "running",
      path: "/usr/local/redis",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addMethod, setAddMethod] = useState(null); // 'quick', 'advanced', 'manual'
  const [selectedMiddleware, setSelectedMiddleware] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [currentInstalling, setCurrentInstalling] = useState("");
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [selectedPath, setSelectedPath] = useState("");
  const [advancedConfig, setAdvancedConfig] = useState({
    middleware: "",
    version: "",
    installPath: "",
    port: "",
    configOptions: {},
  });

  const availableMiddleware = [
    {
      name: "Apache",
      category: "Web Server",
      versions: ["2.4.52", "2.4.51", "2.4.50"],
      defaultPath: "/usr/local/apache2",
      defaultPort: "80",
    },
    {
      name: "Nginx",
      category: "Web Server",
      versions: ["1.22.1", "1.22.0", "1.20.2"],
      defaultPath: "/etc/nginx",
      defaultPort: "80",
    },
    {
      name: "MySQL",
      category: "Database",
      versions: ["8.0.32", "8.0.31", "5.7.40"],
      defaultPath: "/var/lib/mysql",
      defaultPort: "3306",
    },
    {
      name: "PostgreSQL",
      category: "Database",
      versions: ["15.1", "14.6", "13.9"],
      defaultPath: "/var/lib/postgresql",
      defaultPort: "5432",
    },
    {
      name: "MongoDB",
      category: "NoSQL",
      versions: ["6.0.3", "5.0.14", "4.4.18"],
      defaultPath: "/var/lib/mongodb",
      defaultPort: "27017",
    },
    {
      name: "Redis",
      category: "Cache",
      versions: ["7.0.5", "7.0.4", "6.2.8"],
      defaultPath: "/usr/local/redis",
      defaultPort: "6379",
    },
    {
      name: "Docker",
      category: "Container",
      versions: ["23.0.0", "20.10.22", "20.10.21"],
      defaultPath: "/var/lib/docker",
      defaultPort: "",
    },
    {
      name: "InfluxDB",
      category: "시계열 DB",
      versions: ["2.6.1", "2.6.0", "1.8.10"],
      defaultPath: "/var/lib/influxdb",
      defaultPort: "8086",
    },
    {
      name: "Tomcat",
      category: "Application Server",
      versions: ["10.1.4", "9.0.70", "8.5.84"],
      defaultPath: "/opt/tomcat",
      defaultPort: "8080",
    },
    {
      name: "Node.js",
      category: "Runtime",
      versions: ["18.12.1", "16.19.0", "14.21.2"],
      defaultPath: "/usr/local/node",
      defaultPort: "",
    },
  ];

  const toggleMiddlewareSelection = (middleware) => {
    setSelectedMiddleware((prev) => {
      const isSelected = prev.some((m) => m.name === middleware.name);
      if (isSelected) {
        return prev.filter((m) => m.name !== middleware.name);
      } else {
        return [...prev, middleware];
      }
    });
  };

  const handleQuickInstall = async () => {
    if (selectedMiddleware.length === 0) return;

    setIsInstalling(true);
    setInstallProgress(0);

    const totalSteps = selectedMiddleware.length;
    let currentStep = 0;

    for (const middleware of selectedMiddleware) {
      setCurrentInstalling(middleware.name);
      const newId =
        Math.max(...installedMiddleware.map((m) => m.id), 0) + 1 + currentStep;
      const newMiddleware = {
        id: newId,
        name: middleware.name,
        version: middleware.versions[0],
        type: middleware.category,
        status: "installing",
        path: `/usr/local/${middleware.name.toLowerCase()}`,
      };

      setInstalledMiddleware((prev) => [...prev, newMiddleware]);

      // Simulate installation time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setInstalledMiddleware((prev) =>
        prev.map((m) => (m.id === newId ? { ...m, status: "running" } : m)),
      );

      currentStep++;
      setInstallProgress((currentStep / totalSteps) * 100);
    }

    setIsInstalling(false);
    setInstallProgress(0);
    setCurrentInstalling("");
    setSelectedMiddleware([]);
    setShowAddDialog(false);
    setAddMethod(null);
  };

  const handleAdvancedAdd = () => {
    const newId = Math.max(...installedMiddleware.map((m) => m.id), 0) + 1;
    const middleware = availableMiddleware.find(
      (m) => m.name === advancedConfig.middleware,
    );
    const newMiddleware = {
      id: newId,
      name: advancedConfig.middleware,
      version: advancedConfig.version,
      type: middleware?.category || "Custom",
      status: "installing",
      path: advancedConfig.installPath,
    };
    setInstalledMiddleware([...installedMiddleware, newMiddleware]);
    setShowAddDialog(false);
    setAddMethod(null);
    setAdvancedConfig({
      middleware: "",
      version: "",
      installPath: "",
      port: "",
      configOptions: {},
    });

    setTimeout(() => {
      setInstalledMiddleware((prev) =>
        prev.map((m) => (m.id === newId ? { ...m, status: "running" } : m)),
      );
    }, 3000);
  };

  const handleDelete = (id) => {
    if (confirm("이 미들웨어를 삭제하시겠습니까?")) {
      setInstalledMiddleware(installedMiddleware.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">설치된 미들웨어</h3>
          <p className="text-sm text-muted-foreground">
            {installedMiddleware.length}개 설치됨
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(!showAddDialog)}>
          <Plus className="w-4 h-4 mr-2" />
          미들웨어 추가
        </Button>
      </div>

      {showAddDialog && !addMethod && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>설치 방법 선택</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card
              className="transition-all cursor-pointer hover:border-primary"
              onClick={() => setAddMethod("quick")}
            >
              <CardContent className="pt-6 text-center">
                <Zap className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h4 className="mb-2 font-semibold">빠른 추가</h4>
                <p className="text-sm text-muted-foreground">
                  기본 설정으로 자동 설치
                </p>
              </CardContent>
            </Card>
            <Card
              className="transition-all cursor-pointer hover:border-primary"
              onClick={() => setAddMethod("advanced")}
            >
              <CardContent className="pt-6 text-center">
                <Settings className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h4 className="mb-2 font-semibold">상세 추가</h4>
                <p className="text-sm text-muted-foreground">
                  버전과 설정을 직접 선택
                </p>
              </CardContent>
            </Card>
            <Card
              className="transition-all cursor-pointer hover:border-primary"
              onClick={() => setAddMethod("manual")}
            >
              <CardContent className="pt-6 text-center">
                <TerminalIcon className="w-12 h-12 mx-auto mb-3 text-primary" />
                <h4 className="mb-2 font-semibold">사용자 설치</h4>
                <p className="text-sm text-muted-foreground">
                  터미널에서 직접 설치
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {addMethod === "quick" && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>빠른 추가 - 미들웨어 선택</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedMiddleware.length}개 선택됨
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalling && (
              <div className="p-4 space-y-3 border rounded-lg bg-primary/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">설치 중...</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(installProgress)}%
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="relative h-full overflow-hidden transition-all duration-300 ease-out bg-primary"
                    style={{ width: `${installProgress}%` }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {currentInstalling} 설치 중...
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {availableMiddleware.map((mw) => {
                const isSelected = selectedMiddleware.some(
                  (m) => m.name === mw.name,
                );
                return (
                  <Card
                    key={mw.name}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                        : "hover:border-primary hover:bg-primary/5"
                    }`}
                    onClick={() =>
                      !isInstalling && toggleMiddlewareSelection(mw)
                    }
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                        <Package className="w-4 h-4 text-primary" />
                        <p className="text-sm font-semibold">{mw.name}</p>
                      </div>
                      <p className="ml-6 text-xs text-muted-foreground">
                        {mw.category}
                      </p>
                      <p className="mt-1 ml-6 text-xs text-primary">
                        v{mw.versions[0]}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
          <div className="flex gap-2 p-4 border-t">
            <Button
              className="flex-1"
              onClick={handleQuickInstall}
              disabled={selectedMiddleware.length === 0 || isInstalling}
            >
              <Download className="w-4 h-4 mr-2" />
              선택 항목 설치 ({selectedMiddleware.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAddMethod(null);
                setSelectedMiddleware([]);
              }}
              disabled={isInstalling}
            >
              취소
            </Button>
          </div>
        </Card>
      )}

      {addMethod === "advanced" && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>상세 추가 - 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>미들웨어 선택</Label>
              <select
                className="w-full h-10 px-3 border rounded-md border-input bg-background"
                value={advancedConfig.middleware}
                onChange={(e) => {
                  const selectedMw = availableMiddleware.find(
                    (m) => m.name === e.target.value,
                  );
                  setAdvancedConfig({
                    ...advancedConfig,
                    middleware: e.target.value,
                    version: "",
                    installPath: selectedMw?.defaultPath || "",
                    port: selectedMw?.defaultPort || "",
                  });
                }}
              >
                <option value="">선택하세요</option>
                {availableMiddleware.map((mw) => (
                  <option key={mw.name} value={mw.name}>
                    {mw.name} ({mw.category})
                  </option>
                ))}
              </select>
            </div>

            {advancedConfig.middleware && (
              <>
                <div className="space-y-2">
                  <Label>버전 선택</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md border-input bg-background"
                    value={advancedConfig.version}
                    onChange={(e) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        version: e.target.value,
                      })
                    }
                  >
                    <option value="">선택하세요</option>
                    {availableMiddleware
                      .find((m) => m.name === advancedConfig.middleware)
                      ?.versions.map((v) => (
                        <option key={v} value={v}>
                          v{v}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>설치 경로</Label>
                  <div className="flex gap-2">
                    <Input
                      value={advancedConfig.installPath}
                      onChange={(e) =>
                        setAdvancedConfig({
                          ...advancedConfig,
                          installPath: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPathSelector(true)}
                    >
                      <FolderSearch className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    기본 경로가 자동 설정되었습니다. 찾아보기 버튼으로 경로를
                    선택할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>포트 번호 (선택)</Label>
                  <Input
                    value={advancedConfig.port}
                    onChange={(e) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        port: e.target.value,
                      })
                    }
                  />
                  {advancedConfig.port && (
                    <p className="text-xs text-muted-foreground">
                      기본 포트: {advancedConfig.port}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={handleAdvancedAdd}
                disabled={
                  !advancedConfig.middleware ||
                  !advancedConfig.version ||
                  !advancedConfig.installPath
                }
              >
                <Download className="w-4 h-4 mr-2" />
                설치 시작
              </Button>
              <Button variant="outline" onClick={() => setAddMethod(null)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPathSelector && (
        <FolderSelector
          onSelect={(path) => {
            setAdvancedConfig({ ...advancedConfig, installPath: path });
            setShowPathSelector(false);
          }}
          onClose={() => setShowPathSelector(false)}
        />
      )}

      {addMethod === "manual" && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>사용자 설치 - 터미널</CardTitle>
          </CardHeader>
          <CardContent>
            <Terminal server={server} />
          </CardContent>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={() => setAddMethod(null)}
              className="w-full"
            >
              닫기
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {installedMiddleware.map((mw) => (
          <Card key={mw.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{mw.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {mw.type}
                      </Badge>
                      <Badge
                        variant={
                          mw.status === "running" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {mw.status === "running" ? "실행중" : "설치중"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      버전: {mw.version} • 경로: {mw.path}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(mw.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ServerDetail({ server, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "maintenance",
      title: `${server.label} 정기 점검 예정`,
      message: "내일 오전 2시 ~ 4시 정기 점검이 예정되어 있습니다.",
      time: "1시간 전",
      read: false,
    },
    {
      id: 2,
      type: "update",
      title: "MySQL 업데이트 필요",
      message: "MySQL을 8.0.33으로 업데이트해주세요.",
      time: "3시간 전",
      read: false,
    },
    {
      id: 3,
      type: "security",
      title: "보안 업데이트 알림",
      message: "보안 패치가 필요합니다.",
      time: "1일 전",
      read: true,
    },
  ]);

  // Mock hardware data
  const hardwareInfo = {
    cpu: {
      model: "Intel Xeon E5-2680 v4",
      cores: 14,
      threads: 28,
      usage: 45,
    },
    memory: {
      total: 64,
      used: 28,
      free: 36,
      percentage: 44,
    },
    disk: {
      total: 500,
      used: 280,
      free: 220,
      percentage: 56,
    },
    network: {
      rx: "125.4 Mbps",
      tx: "84.2 Mbps",
    },
  };

  // Mock performance data
  const cpuData = [
    { time: "00:00", usage: 30 },
    { time: "04:00", usage: 25 },
    { time: "08:00", usage: 55 },
    { time: "12:00", usage: 68 },
    { time: "16:00", usage: 45 },
    { time: "20:00", usage: 38 },
    { time: "24:00", usage: 32 },
  ];

  const memoryData = [
    { time: "00:00", used: 25, free: 39 },
    { time: "04:00", used: 22, free: 42 },
    { time: "08:00", used: 30, free: 34 },
    { time: "12:00", used: 35, free: 29 },
    { time: "16:00", used: 28, free: 36 },
    { time: "20:00", used: 26, free: 38 },
    { time: "24:00", used: 28, free: 36 },
  ];

  const logData = [
    { category: "Info", count: 1240 },
    { category: "Warning", count: 85 },
    { category: "Error", count: 12 },
    { category: "Critical", count: 2 },
  ];

  // Mock maintenance schedules
  const schedules = [
    {
      id: 1,
      title: "정기 백업",
      date: "2026-01-25",
      time: "02:00",
      type: "backup",
      status: "scheduled",
    },
    {
      id: 2,
      title: "보안 패치",
      date: "2026-01-27",
      time: "03:00",
      type: "maintenance",
      status: "scheduled",
    },
    {
      id: 3,
      title: "디스크 정리",
      date: "2026-01-30",
      time: "01:00",
      type: "maintenance",
      status: "scheduled",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b shadow-sm bg-card">
        <div className="container flex items-center justify-between px-6 py-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-primary">
                {server.label}
              </h1>
              <p className="text-sm text-muted-foreground">
                {server.ip} • {server.os}
              </p>
            </div>
            <Badge variant="secondary" className="ml-2">
              <Activity className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 z-50 border rounded-lg shadow-lg top-12 w-96 bg-card">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">알림</h3>
                      <button
                        onClick={() => {
                          setNotifications(
                            notifications.map((n) => ({ ...n, read: true })),
                          );
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        모두 읽음
                      </button>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-96">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">알림이 없습니다</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                          onClick={() => {
                            setNotifications(
                              notifications.map((n) =>
                                n.id === notification.id
                                  ? { ...n, read: true }
                                  : n,
                              ),
                            );
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                notification.type === "maintenance"
                                  ? "bg-orange-500/10"
                                  : notification.type === "update"
                                    ? "bg-blue-500/10"
                                    : "bg-red-500/10"
                              }`}
                            >
                              {notification.type === "maintenance" && (
                                <Activity className="w-4 h-4 text-orange-500" />
                              )}
                              {notification.type === "update" && (
                                <Upload className="w-4 h-4 text-blue-500" />
                              )}
                              {notification.type === "security" && (
                                <Server className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 mt-1 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>

            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              닫기
            </Button>
          </div>
        </div>

        <div className="container px-6 mx-auto">
          <div className="flex gap-1 border-b">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "overview"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              서버 정보
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "terminal"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("terminal")}
            >
              터미널
              {activeTab === "terminal" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "middleware"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("middleware")}
            >
              미들웨어 관리
              {activeTab === "middleware" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "backup"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("backup")}
            >
              백업 및 보안
              {activeTab === "backup" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "deploy"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("deploy")}
            >
              운영 및 배포
              {activeTab === "deploy" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeTab === "overview" ? (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>서버 상세 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        CPU 모델
                      </p>
                      <p className="text-sm font-semibold">
                        {hardwareInfo.cpu.model}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        운영체제
                      </p>
                      <p className="text-sm font-semibold">{server.os}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        IP 주소
                      </p>
                      <p className="font-mono text-sm font-semibold">
                        {server.ip}:{server.port}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        위치
                      </p>
                      <p className="text-sm font-semibold">{server.country}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        클라우드 서비스
                      </p>
                      <p className="text-sm font-semibold">
                        {server.cloudService}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-muted-foreground">
                        설치된 소프트웨어
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {server.software?.map((sw, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {sw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        CPU 사용률
                      </CardTitle>
                      <Cpu className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {hardwareInfo.cpu.usage}%
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {hardwareInfo.cpu.cores} Cores /{" "}
                      {hardwareInfo.cpu.threads} Threads
                    </p>
                    <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full transition-all bg-primary"
                        style={{ width: `${hardwareInfo.cpu.usage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        메모리
                      </CardTitle>
                      <MemoryStick className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {hardwareInfo.memory.used}GB
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      / {hardwareInfo.memory.total}GB (
                      {hardwareInfo.memory.percentage}%)
                    </p>
                    <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full transition-all bg-primary"
                        style={{ width: `${hardwareInfo.memory.percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        디스크
                      </CardTitle>
                      <HardDrive className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {hardwareInfo.disk.used}GB
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      / {hardwareInfo.disk.total}GB (
                      {hardwareInfo.disk.percentage}%)
                    </p>
                    <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full transition-all bg-primary"
                        style={{ width: `${hardwareInfo.disk.percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        네트워크
                      </CardTitle>
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          다운로드
                        </p>
                        <p className="text-xl font-bold">
                          {hardwareInfo.network.rx}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">업로드</p>
                        <p className="text-xl font-bold">
                          {hardwareInfo.network.tx}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>CPU 사용률 추이</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={cpuData}>
                        <defs>
                          <linearGradient
                            id="colorUsage"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(142 76% 36%)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(142 76% 36%)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="usage"
                          stroke="hsl(142 76% 36%)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorUsage)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>메모리 사용률 추이</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={memoryData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="used"
                          stroke="hsl(142 76% 36%)"
                          strokeWidth={2}
                          name="사용중"
                        />
                        <Line
                          type="monotone"
                          dataKey="free"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={2}
                          name="여유"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>로그 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={logData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="category"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(142 76% 36%)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>정기 점검 일정</CardTitle>
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-start gap-3 p-3 transition-colors border rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {schedule.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {schedule.date} {schedule.time}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {schedule.type === "backup" ? "백업" : "유지보수"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : activeTab === "terminal" ? (
          <div className="h-full overflow-y-auto">
            <div className="container h-full p-6 mx-auto">
              <Card className="flex flex-col h-full">
                <CardContent className="flex-1 p-4 overflow-hidden">
                  <div className="grid h-full grid-cols-3 gap-4">
                    <div className="col-span-1 overflow-hidden">
                      <FileTree server={server} />
                    </div>
                    <div className="col-span-2 overflow-hidden">
                      <Terminal server={server} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === "middleware" ? (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto">
              <MiddlewareManager server={server} />
            </div>
          </div>
        ) : activeTab === "backup" ? (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto">
              <BackupSecurity server={server} />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto">
              <ManagementDeploy server={server} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
