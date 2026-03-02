import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ReactApexChart from "react-apexcharts";
import { useServerMetricsEs } from "@/hooks/queries/useServerMetricsEs";

export default function ServerOverview({ server }) {
  const hardwareInfo = server?.hardwareInfo ?? null;
  const memoryData = server?.memoryHistory ?? [];
  const logData = server?.logStats ?? [];
  const schedules = server?.schedules ?? [];

  const { data: metricsHistory = [] } = useServerMetricsEs();
  const latestMetric = metricsHistory[metricsHistory.length - 1] ?? null;

  const cpuSeries = [
    {
      name: "CPU 사용률",
      data: metricsHistory.map((m) => ({ x: m.x, y: m.cpuUsage })),
    },
  ];

  const cpuChartOptions = {
    chart: {
      type: "area",
      height: 250,
      toolbar: { show: false },
      animations: { enabled: true, speed: 500 },
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.0 },
    },
    colors: ["#16a34a"],
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        format: "HH:mm:ss",
        style: { fontSize: "11px" },
      },
    },
    yaxis: {
      min: 0,
      labels: { formatter: (val) => `${val.toFixed(1)}%` },
    },
    tooltip: {
      x: { format: "HH:mm:ss" },
      y: { formatter: (val) => `${val.toFixed(1)}%` },
    },
    grid: { borderColor: "hsl(var(--border))" },
    theme: { mode: "light" },
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container p-6 mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>서버 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">CPU</p>
                <p className="text-sm font-semibold">{server.cpuInfo ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">서버 종류</p>
                <p className="text-sm font-semibold">{server.osType ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">운영체제</p>
                <p className="text-sm font-semibold">{server.osVersion ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">IP 주소</p>
                <p className="font-mono text-sm font-semibold">
                  {server.ip ?? "데이터 없음"}:{server.port ?? "-"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">위치</p>
                <p className="text-sm font-semibold">{server.country ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">클라우드 서비스</p>
                <p className="text-sm font-semibold">{server.cloudService ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">서버 용도</p>
                <p className="text-sm font-semibold">{server.purpose ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">인증 방식</p>
                <p className="text-sm font-semibold">{server.authType ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">사용자명</p>
                <p className="text-sm font-semibold">{server.username ?? "데이터 없음"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">설치된 소프트웨어</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {server.softwareToInstall?.length > 0
                    ? server.softwareToInstall.map((sw, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {sw.name}
                        </Badge>
                      ))
                    : <span className="text-sm text-muted-foreground">데이터 없음</span>
                  }
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
                {latestMetric?.cpuUsage?.toFixed(1) ?? "-"}%
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {latestMetric?.cpuCores ?? "-"} Cores /{" "}
                {latestMetric?.cpuThreads ?? "-"} Threads
              </p>
              <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all bg-primary"
                  style={{ width: `${latestMetric?.cpuUsage ?? 0}%` }}
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
                {latestMetric?.memoryUsed ?? "-"}MB
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                / {latestMetric?.memoryTotal ?? "-"}MB ({latestMetric?.memoryPercentage?.toFixed(1) ?? "-"}%)
              </p>
              <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all bg-primary"
                  style={{ width: `${latestMetric?.memoryPercentage ?? 0}%` }}
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
                {latestMetric?.diskUsed ?? "-"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                / {latestMetric?.diskTotal ?? "-"} ({latestMetric?.diskPercentage?.toFixed(1) ?? "-"}%)
              </p>
              <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all bg-primary"
                  style={{ width: `${latestMetric?.diskPercentage ?? 0}%` }}
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
                    {hardwareInfo?.network.rx ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">업로드</p>
                  <p className="text-xl font-bold">
                    {hardwareInfo?.network.tx ?? "-"}
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
              {metricsHistory.length > 0 ? (
                <ReactApexChart
                  key={metricsHistory.length}
                  type="area"
                  height={250}
                  series={cpuSeries}
                  options={cpuChartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                  데이터 로딩 중...
                </div>
              )}
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
  );
}
