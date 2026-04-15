import { useState, useEffect } from "react";
import { userMiddlewareList } from "@/api/userMiddlewareList";
import { simpleMiddlewareList } from "@/api/middlewareSimpleList";
import { useMiddlewareAdd } from "@/hooks/queries/useMiddlewareAdd";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  Plus,
  Trash2,
  Zap,
  Settings,
  Download,
  FolderSearch,
  Terminal as TerminalIcon,
} from "lucide-react";
import FolderSelector from "./FolderSelector";
import TerminalTab from "./TerminalTab";

export default function MiddlewareManager({ server, serverId }) {
  const [installedMiddleware, setInstalledMiddleware] = useState([]);

  useEffect(() => {
    if (!serverId) return;
    userMiddlewareList(serverId).then((res) => {
      const mapped = res.data.map((item) => ({
        name: item.name,
        version: item.version,
        type: item.type,
        path: item.path,
      }));
      setInstalledMiddleware(mapped);
    });
  }, [serverId]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addMethod, setAddMethod] = useState(null); // 'quick', 'advanced', 'manual'
  const [selectedMiddleware, setSelectedMiddleware] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [currentInstalling, setCurrentInstalling] = useState("");
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState({
    middleware: "",
    version: "",
    installPath: "",
    port: "",
    configOptions: {},
  });

  const { mutate: addMiddleware } = useMiddlewareAdd();

  const [availableMiddleware, setAvailableMiddleware] = useState([]);

  useEffect(() => {
    const fetchAvailableMiddleware = async () => {
      try {
        const data = await simpleMiddlewareList();
        const formatted = data.middleware.map((item) => ({
          name: item.name,
          defaultPath: item.path,
        }));
        setAvailableMiddleware(formatted);
      } catch (error) {
        console.error("미들웨어 목록 조회 실패:", error);
      }
    };

    fetchAvailableMiddleware();
  }, []);

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

  const handleQuickInstall = () => {
    if (selectedMiddleware.length === 0) return;

    const middlewares = selectedMiddleware.map((mw) => mw.name.split(" ")[0]);
    const mwVersion = selectedMiddleware.map((mw) => mw.name.split(" ")[1]);

    addMiddleware({
      userOsInstanceId: serverId,
      installPath: "",
      middlewares,
      mwVersion,
    });

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
                      <p className="mt-1 ml-6 text-xs text-primary">
                        {mw.defaultPath}
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
            <TerminalTab server={server} />
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
