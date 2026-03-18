import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useValidateKey } from "@/hooks/queries/useValidateKey";
import { useServerAdd } from "@/hooks/queries/useServerAdd";
import { useServerUpdate } from "@/hooks/queries/useServerUpdate";
import { useMiddlewareAdd } from "@/hooks/queries/useMiddlewareAdd";
import { fetchServerSpecItems } from "@/api/serverSpec";
import { simpleMiddlewareList } from "@/api/middlewareList.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerList } from "@/hooks/queries/useServerList";
import { useServerDetail } from "@/hooks/queries/useServerDetail";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Server,
  Plus,
  Edit,
  Trash2,
  LogIn,
  Upload,
  Globe,
  Wifi,
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  X,
  Terminal as TerminalIcon,
  User,
  Bell,
  Activity,
  Shield,
  Database,
  GitBranch,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  LogOut,
  Mail,
  Calendar,
  History,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import {serverRemove} from "@/api/serverRemove.js";

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
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { type: "system", text: `Connected to ${server.label} (${server.ip})` },
    { type: "system", text: "Type commands below..." },
  ]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newHistory = [
      ...history,
      { type: "input", text: `$ ${input}` },
      { type: "output", text: `Command "${input}" executed (demo mode)` },
    ];
    setHistory(newHistory);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono text-green-400 bg-black rounded-lg">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <TerminalIcon className="w-4 h-4" />
        <span className="text-sm">Terminal - {server.label}</span>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={
              item.type === "system"
                ? "text-yellow-400"
                : item.type === "input"
                  ? "text-green-400"
                  : "text-gray-300"
            }
          >
            {item.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="p-2 border-t border-gray-700">
        <div className="flex items-center gap-2 px-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-green-400 bg-transparent border-none outline-none"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </form>
    </div>
  );
}

function UserProfile({ onClose, servers }) {
  const [activeTab, setActiveTab] = useState("overview");

  // 현재 로그인한 사용자 정보 (실제 앱에서는 인증 시스템에서 가져옴)
  const userInfo = {
    name: "김서버",
    email: "admin@serverhub.com",
    role: "시스템 관리자",
    joinDate: "2024-01-15",
    lastLogin: "2026-01-28 09:30:15",
    avatar: null,
  };

  // 서버 접속 기록
  const serverAccessLogs = [
    {
      id: 1,
      serverName: "Production Server",
      ip: "192.168.1.100",
      action: "접속",
      date: "2026-01-28 09:30",
      status: "success",
    },
    {
      id: 2,
      serverName: "DB Server",
      ip: "192.168.1.102",
      action: "접속",
      date: "2026-01-28 08:15",
      status: "success",
    },
    {
      id: 3,
      serverName: "Development Server",
      ip: "192.168.1.101",
      action: "접속 실패",
      date: "2026-01-27 16:45",
      status: "failed",
    },
    {
      id: 4,
      serverName: "Production Server",
      ip: "192.168.1.100",
      action: "접속",
      date: "2026-01-27 14:20",
      status: "success",
    },
    {
      id: 5,
      serverName: "DB Server",
      ip: "192.168.1.102",
      action: "접속",
      date: "2026-01-27 10:00",
      status: "success",
    },
  ];

  // 미들웨어 설치 기록
  const middlewareLogs = [
    {
      id: 1,
      serverName: "Production Server",
      middleware: "Redis 7.0.5",
      action: "설치",
      date: "2026-01-27 15:30",
      status: "success",
    },
    {
      id: 2,
      serverName: "Production Server",
      middleware: "Node.js 18.12.1",
      action: "설치",
      date: "2026-01-26 11:20",
      status: "success",
    },
    {
      id: 3,
      serverName: "DB Server",
      middleware: "MongoDB 6.0.3",
      action: "설치",
      date: "2026-01-25 09:45",
      status: "success",
    },
    {
      id: 4,
      serverName: "Development Server",
      middleware: "Docker 23.0.0",
      action: "삭제",
      date: "2026-01-24 14:10",
      status: "success",
    },
    {
      id: 5,
      serverName: "Production Server",
      middleware: "Nginx 1.22.1",
      action: "업데이트",
      date: "2026-01-23 16:55",
      status: "success",
    },
  ];

  // 백업 및 보안 기록
  const backupSecurityLogs = [
    {
      id: 1,
      serverName: "Production Server",
      action: "MySQL DB 백업",
      type: "backup",
      date: "2026-01-28 03:00",
      status: "success",
    },
    {
      id: 2,
      serverName: "DB Server",
      action: "방화벽 규칙 추가 (포트 8080)",
      type: "security",
      date: "2026-01-27 16:20",
      status: "success",
    },
    {
      id: 3,
      serverName: "Production Server",
      action: "Nginx 설정 백업",
      type: "backup",
      date: "2026-01-27 03:00",
      status: "success",
    },
    {
      id: 4,
      serverName: "Development Server",
      action: "IP 차단 (1.2.3.4)",
      type: "security",
      date: "2026-01-26 22:15",
      status: "success",
    },
    {
      id: 5,
      serverName: "Production Server",
      action: "웹 소스코드 복원",
      type: "restore",
      date: "2026-01-26 10:30",
      status: "success",
    },
  ];

  // 배포 기록
  const deployLogs = [
    {
      id: 1,
      serverName: "Production Server",
      method: "GitHub",
      info: "v1.2.1 - 메인 배너 수정 (a1b2c3)",
      date: "2026-01-28 12:00",
      status: "active",
    },
    {
      id: 2,
      serverName: "Development Server",
      method: "Manual",
      info: "hotfix_20260127.zip",
      date: "2026-01-27 18:30",
      status: "success",
    },
    {
      id: 3,
      serverName: "Production Server",
      method: "GitHub",
      info: "v1.2.0 - API 최적화 (d4e5f6)",
      date: "2026-01-26 14:00",
      status: "rollback",
    },
    {
      id: 4,
      serverName: "Development Server",
      method: "Internal Git",
      info: "feature/login 브랜치 (g7h8i9)",
      date: "2026-01-25 11:20",
      status: "success",
    },
    {
      id: 5,
      serverName: "Production Server",
      method: "GitHub",
      info: "v1.1.9 - 버그 수정 (j0k1l2)",
      date: "2026-01-24 09:45",
      status: "success",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">성공</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      case "active":
        return <Badge className="bg-blue-500">운영중</Badge>;
      case "rollback":
        return <Badge className="bg-orange-500">롤백됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "backup":
        return <Database className="w-4 h-4 text-blue-500" />;
      case "security":
        return <Shield className="w-4 h-4 text-orange-500" />;
      case "restore":
        return <RotateCcw className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b shadow-sm bg-card">
        <div className="container flex items-center justify-between px-6 py-4 mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-primary">
                마이페이지
              </h1>
              <p className="text-sm text-muted-foreground">
                사용자 정보 및 활동 로그
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            닫기
          </Button>
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
              개요
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === "server"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("server")}
            >
              서버 접속 기록
              {activeTab === "server" && (
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
              미들웨어 기록
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
              백업/보안 기록
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
              배포 기록
              {activeTab === "deploy" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container p-6 mx-auto space-y-6">
          {activeTab === "overview" && (
            <>
              {/* 사용자 정보 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle>사용자 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">이름</p>
                        <p className="font-semibold">{userInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">이메일</p>
                        <p className="flex items-center gap-2 font-semibold">
                          <Mail className="w-4 h-4" />
                          {userInfo.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">역할</p>
                        <p className="font-semibold">{userInfo.role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">가입일</p>
                        <p className="flex items-center gap-2 font-semibold">
                          <Calendar className="w-4 h-4" />
                          {userInfo.joinDate}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">
                          마지막 로그인
                        </p>
                        <p className="flex items-center gap-2 font-semibold">
                          <Clock className="w-4 h-4" />
                          {userInfo.lastLogin}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 요약 통계 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        관리 중인 서버
                      </CardTitle>
                      <Server className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{servers.length}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      개의 서버
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        이번 주 접속
                      </CardTitle>
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {serverAccessLogs.length}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      회 접속
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        미들웨어 작업
                      </CardTitle>
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {middlewareLogs.length}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      건 처리
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        배포 횟수
                      </CardTitle>
                      <GitBranch className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{deployLogs.length}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      회 배포
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 최근 활동 요약 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <History className="w-5 h-5 text-primary" />
                      최근 서버 접속
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {serverAccessLogs.slice(0, 3).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Server className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {log.serverName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {log.date}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(log.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="w-5 h-5 text-primary" />
                      최근 배포
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {deployLogs.slice(0, 3).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{log.method}</Badge>
                            <div>
                              <p className="text-sm font-medium">
                                {log.serverName}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {log.info}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(log.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "server" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  서버 접속 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 font-medium text-left">서버명</th>
                        <th className="p-3 font-medium text-left">IP 주소</th>
                        <th className="p-3 font-medium text-left">액션</th>
                        <th className="p-3 font-medium text-left">일시</th>
                        <th className="p-3 font-medium text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serverAccessLogs.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="p-3 font-medium">{log.serverName}</td>
                          <td className="p-3 font-mono text-xs">{log.ip}</td>
                          <td className="p-3">{log.action}</td>
                          <td className="p-3 text-muted-foreground">
                            {log.date}
                          </td>
                          <td className="p-3">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "middleware" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  미들웨어 설치/관리 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 font-medium text-left">서버명</th>
                        <th className="p-3 font-medium text-left">미들웨어</th>
                        <th className="p-3 font-medium text-left">액션</th>
                        <th className="p-3 font-medium text-left">일시</th>
                        <th className="p-3 font-medium text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {middlewareLogs.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="p-3 font-medium">{log.serverName}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-primary" />
                              {log.middleware}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                log.action === "삭제"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {log.action}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {log.date}
                          </td>
                          <td className="p-3">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "backup" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  백업 및 보안 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 font-medium text-left">서버명</th>
                        <th className="p-3 font-medium text-left">작업 내용</th>
                        <th className="p-3 font-medium text-left">타입</th>
                        <th className="p-3 font-medium text-left">일시</th>
                        <th className="p-3 font-medium text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupSecurityLogs.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="p-3 font-medium">{log.serverName}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.type)}
                              {log.action}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">
                              {log.type === "backup"
                                ? "백업"
                                : log.type === "security"
                                  ? "보안"
                                  : "복원"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {log.date}
                          </td>
                          <td className="p-3">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "deploy" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  배포 기록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 font-medium text-left">서버명</th>
                        <th className="p-3 font-medium text-left">배포 방식</th>
                        <th className="p-3 font-medium text-left">배포 정보</th>
                        <th className="p-3 font-medium text-left">일시</th>
                        <th className="p-3 font-medium text-left">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployLogs.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="p-3 font-medium">{log.serverName}</td>
                          <td className="p-3">
                            <Badge variant="secondary">{log.method}</Badge>
                          </td>
                          <td className="p-3 font-mono text-xs">{log.info}</td>
                          <td className="p-3 text-muted-foreground">
                            {log.date}
                          </td>
                          <td className="p-3">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Main() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedServer, setSelectedServer] = useState(null);
  const [activeServer, setActiveServer] = useState(null);
  const [connectedServer, setConnectedServer] = useState(null);
  const [connectDialogServer, setConnectDialogServer] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  // const [isVerified, setIsVerified] = useState(false);
  // const [verificationCode, setVerificationCode] = useState("");
  // const [verifyError, setVerifyError] = useState("");
  const [connectAuth, setConnectAuth] = useState({
    type: "password",
    username: "",
    password: "",
    keyFile: null,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingServerId, setEditingServerId] = useState(null);

  const { data: serverDetail } = useServerDetail(editingServerId, { refetchInterval: false });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "maintenance",
      title: "Production Server 정기 점검 예정",
      message: "내일 오전 2시 ~ 4시 정기 점검이 예정되어 있습니다.",
      time: "1시간 전",
      read: false,
      serverId: 1,
    },
    {
      id: 2,
      type: "update",
      title: "MySQL 업데이트 필요",
      message: "DB Server의 MySQL을 8.0.33으로 업데이트해주세요.",
      time: "3시간 전",
      read: false,
      serverId: 3,
    },
    {
      id: 3,
      type: "security",
      title: "보안 업데이트 알림",
      message: "Development Server에 보안 패치가 필요합니다.",
      time: "1일 전",
      read: true,
      serverId: 2,
    },
  ]);

  const { data: servers = [], isLoading, isError } = useServerList();

  useEffect(() => {
    if (isError) {
      localStorage.removeItem("userToken");
      window.location.href = "/login";
    }
  }, [isError]);

  const {
    data: serverSpec,
  } = useQuery({
    queryKey: ["serverSpec"],
    queryFn: fetchServerSpecItems,
    select: (res) => res.data,
  });
  const rawOsList = serverSpec?.osList || [];
  const osList = rawOsList.map((os) => {
    const displayName = os.text || os.value;
    let osType = "Linux";
    if (String(displayName).startsWith("Windows")) osType = "Windows";
    else if (String(displayName).startsWith("macOS")) osType = "macOS";
    return { ...os, displayName, osType };
  });
  const purposeList = serverSpec?.serverPurposeList || [];
  const cloudItemList = serverSpec?.cloudItemList || [];
  const osTypes = [...new Set(osList.map((os) => os.osType))];

  useEffect(() => {
    if (!serverDetail || !isEditMode || !serverSpec) return;

    // 매 렌더마다 새 참조가 생기는 osList 등을 의존성에 넣으면
    // 입력할 때마다 effect가 재실행되어 폼이 초기화되므로
    // serverSpec(안정적인 쿼리 데이터)에서 직접 파싱
    const rawOsList = (serverSpec.osList || []).map((os) => {
      const displayName = os.text || os.value;
      let osType = String(displayName);
      // if (String(displayName).startsWith("Windows")) .osType = "Windows";
      // else if (String(displayName).startsWith("macOS")) osType = "macOS";
      return { ...os, displayName, osType };
    });
    const specCloudList = serverSpec.cloudItemList || [];
    const specPurposeList = serverSpec.serverPurposeList || [];

    if (rawOsList.length === 0 || specCloudList.length === 0) return;

    const matchingOs = rawOsList.find(
      (os) => os.displayName === serverDetail.osVersion || os.text === serverDetail.osVersion,
    );
    const matchingCloud = specCloudList.find(
      (c) => c.text === serverDetail.cloudService || c.name === serverDetail.cloudService,
    );
    const matchingPurpose = specPurposeList.find(
      (p) => p.text === serverDetail.purpose || p.name === serverDetail.purpose,
    );

    setNewServer({
      id: serverDetail.id,
      label: serverDetail.label || "",
      ip: serverDetail.ip || "",
      port: serverDetail.port || "",
      osType: serverDetail.osType || "Linux",
      osVersion: matchingOs ? String(matchingOs.value) : "",
      country: serverDetail.country || "",
      cloudService: matchingCloud ? String(matchingCloud.value) : "",
      purpose: matchingPurpose ? String(matchingPurpose.value) : "",
      authType: serverDetail.authType || "password",
      username: serverDetail.username || "",
      password: serverDetail.password || "",
      fileName: serverDetail.fileName || "",
      keyFile: null,
      softwareToInstall: [],
    });
    setShowAddForm(true);
  }, [serverDetail, editingServerId, serverSpec]);

  // 서버 spec 데이터 로드 후 osVersion 기본값 세팅
  useEffect(() => {
    if (osList.length > 0 && !newServer.osVersion) {
      const firstOs = osList.find((os) => os.osType === newServer.osType);
      if (firstOs) {
        setNewServer((prev) => ({ ...prev, osVersion: String(firstOs.value) }));
      }
    }
  }, [osList]);

  useEffect(() => {
    if (cloudItemList.length > 0 && !newServer.cloudService) {
      setNewServer((prev) => ({
        ...prev,
        cloudService: String(cloudItemList[0].value),
      }));
    }
  }, [cloudItemList]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [keyValidation, setKeyValidation] = useState({
    status: "",
    message: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [keyFileDelete, setKeyFileDelete] = useState(false);
  const [newServer, setNewServer] = useState({
    label: "",
    ip: "",
    port: "",
    osType: "Linux",
    osVersion: "",
    country: "",
    cloudService: "",
    purpose: "",
    authType: "password",
    username: "",
    password: "",
    fileName: "",
    keyFile: null,
    softwareToInstall: [
      // { name: "java", path: "/usr/lib/jvm" },
      // { name: "apache", path: "/usr/local/apache2" },
    ],
  });

  const [softwareOptions, setSoftwareOptions] = useState([]);

  useEffect(() => {
    const fetchMiddlewareList = async () => {
      try {
        const data = await simpleMiddlewareList();
        // API 응답의 name에서 버전 제거 (예: "Tomcat 10.1.18" -> "tomcat")
        const formatted = data.middleware.map((item) => ({
          name: item.name,
          path: item.path,
        }));
        setSoftwareOptions(formatted);
      } catch (error) {
        console.error("미들웨어 목록 조회 실패:", error);
      }
    };

    fetchMiddlewareList();
  }, []);

  const handleSoftwareToggle = (software) => {
    setNewServer((prev) => {
      const isSelected = prev.softwareToInstall.some(
        (s) => s.name === software.name,
      );
      if (isSelected) {
        return {
          ...prev,
          softwareToInstall: prev.softwareToInstall.filter(
            (s) => s.name !== software.name,
          ),
        };
      } else {
        return {
          ...prev,
          softwareToInstall: [...prev.softwareToInstall, software],
        };
      }
    });
  };

  const { mutate: validateKey } = useValidateKey(
    setKeyValidation,
    setNewServer,
  );

  const { mutate: addServer, isPending: isAdding } = useServerAdd(
    setShowAddForm,
    setNewServer,
  );

  const { mutate: updateServer, isPending: isUpdating } = useServerUpdate();

  const { mutate: addMiddleware } = useMiddlewareAdd();

  const handleKeyFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pem", "ppk", "key"].includes(ext)) {
      setKeyValidation({
        status: "error",
        message: "지원하지 않는 파일 형식입니다 (.pem, .ppk, .key)",
      });
      return;
    }
    if (newServer.fileName) {
      setKeyFileDelete(true);
    }
    validateKey(file);
  };

  const handleKeyDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleKeyFile(file);
  };

  const handleServerClick = (server) => {
    if (connectedServer) return;
    navigate(`/server/${server.id}`);
  };

  const handleEditServer = (server) => {
    setEditingServerId(server.id);
    setIsEditMode(true);
  };

  const handleConnectSubmit = (e) => {
    e.preventDefault();
    setConnectedServer(connectDialogServer);
    setActiveServer(connectDialogServer);
    setSelectedServer(null);
    setConnectDialogServer(null);
  };

  const handleDisconnect = () => {
    setConnectedServer(null);
    setActiveServer(null);
  };

  const handleAddServer = (e) => {
    e.preventDefault();

    addServer(
        {
          label: newServer.label,
          ip: newServer.ip,
          port: newServer.port,
          osType: newServer.osType,
          osVersion: newServer.osVersion,
          country: newServer.country,
          cloudService: newServer.cloudService,
          purpose: newServer.purpose,
          authType: newServer.authType,
          username: newServer.username,
          password: newServer.password,
          keyFile: newServer.keyFile,
          softwareToInstall: newServer.softwareToInstall,
        },
        {
          onSuccess: (res) => {
            if (newServer.softwareToInstall.length > 0) {
              const middlewares = newServer.softwareToInstall.map(
                  (s) => s.name.split(" ")[0],
              );
              const mwVersion = newServer.softwareToInstall.map(
                  (s) => s.name.split(" ")[1],
              );
              const installPath = newServer.softwareToInstall.map(
                  (s) => s.path,
              );

              addMiddleware({
                userOsInstanceId: res.id,
                installPath,
                mwVersion,
                middlewares,
              });
            }
          },
        },
    );
  };

  const handleUpdateServer = (e) => {
    e.preventDefault();

    updateServer(
        {
          userOsId: editingServerId,
          label: newServer.label,
          ip: newServer.ip,
          port: newServer.port,
          osType: newServer.osType,
          osVersion: newServer.osVersion,
          country: newServer.country,
          cloudService: newServer.cloudService,
          purpose: newServer.purpose,
          authType: newServer.authType || "password",
          username: newServer.username,
          password: newServer.password,
          keyFile: newServer.keyFile,
          keyFileDelete,
        },
        {
          onSuccess: () => {
            setShowAddForm(false);
            setIsEditMode(false);
            setEditingServerId(null);
            setKeyFileDelete(false);
          },
        }
    );
  }

  const handleDeleteServer = async (id) => {
    if (confirm("정말 이 서버를 삭제하시겠습니까?")) {
      try {
        await serverRemove(id);
        queryClient.invalidateQueries({ queryKey: ["servers"] });
        setSelectedServer(null);
        if (connectedServer?.id === id) {
          setConnectedServer(null);
        }
      } catch (error) {
        alert("서버 삭제에 실패했습니다.");
        console.error("서버 삭제 실패:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    } finally {
      // 성공하든 실패하든 클라이언트 데이터는 지웁니다.
      localStorage.removeItem("userToken");
      navigate("/login", { replace: true });
    }
  };

  if (showUserProfile) {
    return (
      <UserProfile
        onClose={() => setShowUserProfile(false)}
        servers={servers}
      />
    );
  }


  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      <header className="border-b shadow-sm bg-card">
        <div className="container flex items-center justify-between px-6 py-4 mx-auto">
          <Link to="/main" className="transition-opacity hover:opacity-80">
            <h1 className="text-4xl tracking-wider font-display text-primary">
              SERVERHUB
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">
                {servers.length}
              </span>{" "}
              서버
              {connectedServer && (
                <span className="ml-3">
                  <span className="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                  접속중
                </span>
              )}
            </div>

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

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowUserProfile(true)}
            >
              <User className="w-5 h-5" />
            </Button>

            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <Dialog
        open={!!connectDialogServer}
        onOpenChange={() => setConnectDialogServer(null)}
      >
        <DialogContent onClose={() => setConnectDialogServer(null)}>
          <DialogHeader>
            <DialogTitle>서버 접속 - {connectDialogServer?.label}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConnectSubmit} className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label>접속 방식</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  variant={
                    connectAuth.type === "password" ? "default" : "outline"
                  }
                  onClick={() =>
                    setConnectAuth({ ...connectAuth, type: "password" })
                  }
                >
                  비밀번호
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  variant={connectAuth.type === "key" ? "default" : "outline"}
                  onClick={() =>
                    setConnectAuth({ ...connectAuth, type: "key" })
                  }
                >
                  인증키
                </Button>
              </div>
            </div>

            {connectAuth.type === "password" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="connect-username">사용자명 (계정)</Label>
                  <Input
                    id="connect-username"
                    placeholder="root"
                    value={connectAuth.username}
                    onChange={(e) =>
                      setConnectAuth({
                        ...connectAuth,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connect-password">비밀번호</Label>
                  <Input
                    id="connect-password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={connectAuth.password}
                    onChange={(e) =>
                      setConnectAuth({
                        ...connectAuth,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="connect-keyFile">인증키 파일</Label>
                <div className="p-6 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    클릭하여 파일 선택 또는 드래그 앤 드롭
                  </p>
                  <input
                    id="connect-keyFile"
                    type="file"
                    className="hidden"
                    accept=".pem,.ppk"
                    onChange={(e) =>
                      setConnectAuth({
                        ...connectAuth,
                        keyFile: e.target.files[0],
                      })
                    }
                  />
                </div>
                {connectAuth.keyFile && (
                  <p className="text-sm text-muted-foreground">
                    선택된 파일: {connectAuth.keyFile.name}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              접속하기
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-hidden">
        {connectedServer ? (
          <div className="h-full p-6">
            <Card className="flex flex-col h-full">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    {connectedServer.label} - 접속됨
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={handleDisconnect}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-hidden">
                <div className="grid h-full grid-cols-3 gap-4">
                  <div className="col-span-1 overflow-hidden">
                    <FileTree server={connectedServer} />
                  </div>
                  <div className="col-span-2 overflow-hidden">
                    <Terminal server={connectedServer} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-primary">
                    서버 관리
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    서버를 추가하고 관리하세요
                  </p>
                </div>
                <Button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setIsEditMode(false);
                      setEditingServerId(null);
                    }}
                  variant={showAddForm ? "secondary" : "default"}
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showAddForm ? "취소" : "새 서버 추가"}
                </Button>
              </div>

              {showAddForm && (
                <Card className="shadow-lg border-primary/20">
                  <CardHeader className="bg-primary/5">
                    <CardTitle>{isEditMode ? "서버 수정" : "새 서버 추가"}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={isEditMode ? handleUpdateServer : handleAddServer} className="space-y-6">
                      {/* 기본 정보 섹션 */}
                      <div className="p-5 border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                        <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-blue-900">
                          <Server className="w-5 h-5" />
                          기본 정보
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="label">서버 별명</Label>
                            <Input
                              id="label"
                              placeholder="예: Production Server"
                              value={newServer.label}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  label: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cloudService">
                              클라우드 서비스
                            </Label>
                            <select
                              id="cloudService"
                              className="w-full h-10 px-3 text-sm border rounded-md border-input bg-background"
                              value={newServer.cloudService}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  cloudService: e.target.value,
                                })
                              }
                            >
                              {cloudItemList.map((c) => (
                                <option key={c.value} value={String(c.value)}>
                                  {c.text || c.value}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="osType">서버 종류</Label>
                            <select
                              id="osType"
                              className="w-full h-10 px-3 text-sm border rounded-md border-input bg-background"
                              value={newServer.osType}
                              onChange={(e) => {
                                const osType = e.target.value;
                                const firstOs = osList.find(
                                  (os) => os.osType === osType,
                                );
                                setNewServer({
                                  ...newServer,
                                  osType,
                                  osVersion: firstOs
                                    ? String(firstOs.value)
                                    : "",
                                });
                              }}
                            >
                              {osTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="osVersion">OS 버전</Label>
                            <select
                              id="osVersion"
                              className="w-full h-10 px-3 text-sm border rounded-md border-input bg-background"
                              value={newServer.osVersion}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  osVersion: e.target.value,
                                })
                              }
                            >
                              {osList
                                .filter((os) => os.osType === newServer.osType)
                                .map((os) => (
                                  <option
                                    key={os.value}
                                    value={String(os.value)}
                                  >
                                    {os.displayName}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ip">IP 주소</Label>
                            <Input
                              id="ip"
                              placeholder="192.168.1.1"
                              value={newServer.ip}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  ip: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="port">Port</Label>
                            <Input
                              id="port"
                              placeholder="22"
                              value={newServer.port}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  port: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="country">국가</Label>
                            <Input
                              id="country"
                              placeholder="대한민국"
                              value={newServer.country}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  country: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="purpose">서버 용도</Label>
                            <select
                              id="purpose"
                              className="w-full h-10 px-3 text-sm border rounded-md border-input bg-background"
                              value={newServer.purpose}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  purpose: e.target.value,
                                })
                              }
                            >
                              <option value="">선택하세요</option>
                              {purposeList.map((p) => (
                                <option key={p.value} value={String(p.value)}>
                                  {p.text || p.value}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 접속 정보 섹션 */}
                      <div className="p-5 border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                        <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-green-900">
                          <LogIn className="w-5 h-5" />
                          접속 정보
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="username">사용자명 (계정)</Label>
                            <Input
                              id="username"
                              placeholder="예: root, admin"
                              value={newServer.username}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  username: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="비밀번호를 입력하세요"
                              value={newServer.password}
                              onChange={(e) =>
                                setNewServer({
                                  ...newServer,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="keyFile">인증키 파일 (선택)</Label>
                            <div>
                              {newServer.fileName && (
                                <div className="flex items-center gap-2">
                                  <label>{newServer.fileName}</label>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setNewServer((prev) => ({ ...prev, fileName: "", keyFile: null }));
                                      setKeyFileDelete(true);
                                    }}
                                  >
                                    삭제
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div
                              className={`p-6 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer ${
                                isDragging
                                  ? "border-primary bg-primary/10"
                                  : newServer.keyFile
                                    ? "border-green-400 bg-green-50"
                                    : "hover:bg-accent/50"
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                              }}
                              onDragLeave={() => setIsDragging(false)}
                              onDrop={handleKeyDrop}
                              onClick={() =>
                                document.getElementById("keyFile").click()
                              }
                            >
                              {newServer.keyFile ? (
                                <>
                                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                  <p className="text-sm font-medium text-green-700">
                                    {newServer.keyFile.name}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    클릭하여 다른 파일로 변경
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {isDragging
                                      ? "여기에 파일을 놓으세요"
                                      : "클릭하여 파일 선택 또는 드래그 앤 드롭"}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    .pem, .ppk, .key 파일 지원
                                  </p>
                                </>
                              )}
                              <input
                                id="keyFile"
                                type="file"
                                className="hidden"
                                accept=".pem,.ppk,.key"
                                onChange={(e) =>
                                  handleKeyFile(e.target.files[0])
                                }
                              />
                            </div>
                            {keyValidation.message && (
                              <p
                                className={`text-sm font-medium ${
                                  keyValidation.status === "success"
                                    ? "text-green-600"
                                    : keyValidation.status === "error"
                                      ? "text-red-500"
                                      : "text-yellow-600"
                                }`}
                              >
                                {keyValidation.status === "success" && "✓ "}
                                {keyValidation.status === "error" && "✗ "}
                                {keyValidation.status === "loading" && "⏳ "}
                                {keyValidation.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 소프트웨어 설치 섹션 - 수정 모드에서는 표시 안 함 */}
                      {!isEditMode && (
                          <div className="p-5 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-purple-900">
                              <Package className="w-5 h-5" />
                              소프트웨어 설치
                            </h3>
                            <div className="space-y-3">
                              <Label>설치할 소프트웨어 (선택)</Label>
                              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/20">
                                {softwareOptions.map((software) => {
                                  const isSelected = newServer.softwareToInstall.some(
                                      (s) => s.name === software.name,
                                  );
                                  return (
                                      <div
                                          key={software.name}
                                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                              isSelected
                                                  ? "border-primary bg-primary/10"
                                                  : "border-border hover:border-primary/50"
                                          }`}
                                          onClick={() => handleSoftwareToggle(software)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                  isSelected
                                                      ? "bg-primary border-primary"
                                                      : "border-muted-foreground"
                                              }`}
                                          >
                                            {isSelected && (
                                                <div className="w-2 h-2 bg-white rounded-sm" />
                                            )}
                                          </div>
                                          <span className="text-sm font-medium">{software.name}</span>
                                        </div>
                                        {isSelected && (
                                            <p className="mt-1 ml-6 text-xs text-muted-foreground">
                                              설치 경로: {software.path}
                                            </p>
                                        )}
                                      </div>
                                  );
                                })}
                              </div>
                              {newServer.softwareToInstall.length === 0 && (
                                  <p className="text-sm italic text-muted-foreground">
                                    선택하지 않으면 기본 OS만 설치됩니다
                                  </p>
                              )}
                            </div>
                          </div>
                      )}


                      {/* 제출 버튼 */}
                      <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isAdding || isUpdating} // 수정 중 상태(isUpdating)도 고려
                      >
                        {isEditMode ? (
                            isUpdating ? "서버 정보 수정 중..." : "서버 정보 수정 완료"
                        ) : (
                            isAdding ? "새 서버 추가 중..." : "새 서버 등록하기"
                        )}
                      </Button>
                      {/*<Button*/}
                      {/*  type="submit"*/}
                      {/*  className="w-full"*/}
                      {/*  size="lg"*/}
                      {/*  disabled={isAdding}*/}
                      {/*>*/}
                      {/*  {isAdding ? "서버 추가 중..." : "서버 추가"}*/}
                      {/*</Button>*/}
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoading && (
                <Card className="p-16 text-center">
                  <Server className="w-20 h-20 mx-auto mb-4 opacity-50 animate-pulse text-muted-foreground" />
                  <p className="text-lg font-semibold text-muted-foreground">
                    서버 목록을 불러오는 중...
                  </p>
                </Card>
              )}

              {isError && (
                <Card className="p-16 text-center">
                  <AlertTriangle className="w-20 h-20 mx-auto mb-4 text-red-400 opacity-70" />
                  <p className="mb-2 text-xl font-semibold text-red-600">
                    서버 정보를 불러오는 중 문제가 발생했습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    잠시 후 다시 시도해주세요
                  </p>
                </Card>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {servers.map((server) => (
                  <Card
                    key={server.id}
                    className="flex flex-col h-full transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:scale-105 hover:ring-2 hover:ring-primary/50 hover:bg-primary/5 active:scale-95"
                    onClick={() => handleServerClick(server)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-lg transition-all ${
                              activeServer?.id === server.id
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Server className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {server.label}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {server.os}
                            </p>
                          </div>
                        </div>
                        {server.cloudService && (
                          <Badge variant="secondary" className="text-xs">
                            {server.cloudService}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-mono text-xs">
                            {server.ip}:{server.port}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{server.country}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold mb-1.5 text-muted-foreground">
                          설치된 소프트웨어
                        </p>
                        <div className="flex flex-wrap gap-1 overflow-y-auto max-h-24">
                          {server.software.map((sw, idx) => (
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
                    </CardContent>

                    <CardFooter className="pt-0 mt-auto">
                      <div className="grid grid-cols-2 gap-1.5 w-full">
                        <Button
                            size="sm"
                            variant="outline"
                            className="col-span-1"
                            onClick={(e) => {
                              e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                              handleEditServer(server); // 수정할 서버 데이터 전달
                            }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="col-span-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteServer(server.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {!isLoading && !isError && servers.length === 0 && (
                <Card className="p-16 text-center">
                  <Server className="w-20 h-20 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="mb-2 text-xl font-semibold">
                    등록된 서버가 없습니다
                  </p>
                  <p className="mb-6 text-sm text-muted-foreground">
                    새 서버를 추가하여 관리를 시작하세요
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />첫 서버 추가하기
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
