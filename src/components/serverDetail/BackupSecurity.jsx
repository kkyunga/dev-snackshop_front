import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  Download,
  Trash2,
  FolderSearch,
  Shield,
  Database,
  AlertTriangle,
  Lock,
  CheckCircle,
  FileCode,
} from "lucide-react";
import FolderSelector from "./FolderSelector";

export default function BackupSecurity({ server }) {
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
