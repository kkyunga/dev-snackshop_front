import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  Settings,
  Zap,
  Upload,
  GitBranch,
  Github,
  Play,
  Loader,
  XCircle,
  RotateCcw,
  FileCode,
  CheckCircle,
} from "lucide-react";

export default function ManagementDeploy({ server }) {
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
