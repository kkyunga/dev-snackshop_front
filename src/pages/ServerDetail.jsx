import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useServerDetail } from "@/hooks/queries/useServerDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  X,
  Activity,
  Bell,
  User,
  Upload,
} from "lucide-react";
import FileTree from "@/components/serverDetail/FileTree";
import TerminalTab from "@/components/serverDetail/TerminalTab";
import BackupSecurity from "@/components/serverDetail/BackupSecurity";
import ManagementDeploy from "@/components/serverDetail/ManagementDeploy";
import MiddlewareManager from "@/components/serverDetail/MiddlewareManager";
import ServerOverview from "@/components/serverDetail/ServerOverview";

export default function ServerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: server, isLoading } = useServerDetail(id);
  const onClose = () => navigate(-1);

  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "maintenance",
      title: `서버 정기 점검 예정`,
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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;

  const s = server ?? {};

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
                {s.label ?? "데이터 없음"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {s.ip ?? "데이터 없음"} • {s.osVersion ?? "데이터 없음"}
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
          <ServerOverview server={s} serverId={id} />
        ) : activeTab === "terminal" ? (
          <div className="h-full overflow-y-auto">
            <div className="container h-full p-6 mx-auto">
              <Card className="flex flex-col h-full">
                <CardContent className="flex-1 p-4 overflow-hidden">
                  <div className="grid h-full grid-cols-3 gap-4">
                    <div className="col-span-1 overflow-hidden">
                      <FileTree server={s} />
                    </div>
                    <div className="col-span-2 overflow-hidden">
                      <TerminalTab server={s} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === "middleware" ? (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto">
              <MiddlewareManager server={s} />
            </div>
          </div>
        ) : activeTab === "backup" ? (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto">
              <BackupSecurity server={s} />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="container p-6 mx-auto">
              <ManagementDeploy server={s} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
