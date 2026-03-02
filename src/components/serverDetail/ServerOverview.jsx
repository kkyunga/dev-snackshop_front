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
  const memoryData = server?.memoryHistory ?? [];
  const logData = server?.logStats ?? [];
  const schedules = server?.schedules ?? [];

  const { data: metricsHistory = [] } = useServerMetricsEs();
  const latestMetric = metricsHistory[metricsHistory.length - 1] ?? null;

  const memorySeries = [
    {
      name: "메모리 사용률",
      data: metricsHistory.map((m) => ({ x: m.x, y: m.memoryPercentage })),
    },
  ];

  const memoryChartOptions = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 700,
        dynamicAnimation: { enabled: true, speed: 500 },
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 100] },
    },
    colors: ["#818cf8"],
    markers: { size: 0, hover: { size: 5 }, colors: ["#818cf8"], strokeColors: "#0f0f1a", strokeWidth: 2 },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false, format: "HH:mm", style: { fontSize: "11px", colors: "#334155", fontFamily: "monospace" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: { formatter: (val) => `${val.toFixed(0)}%`, style: { fontSize: "11px", colors: ["#334155"], fontFamily: "monospace" } },
    },
    tooltip: {
      theme: "dark",
      x: { format: "HH:mm:ss" },
      y: { formatter: (val) => `${val.toFixed(1)}%` },
      marker: { show: true },
      style: { fontFamily: "monospace", fontSize: "12px" },
    },
    grid: { borderColor: "#0f0f1a", strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    annotations: {
      yaxis: [
        {
          y: 90,
          borderColor: "#ff4444",
          borderWidth: 1,
          strokeDashArray: 5,
          label: {
            text: "CRITICAL",
            position: "right",
            style: { color: "#ff4444", background: "transparent", fontSize: "10px", fontFamily: "monospace" },
          },
        },
      ],
    },
  };

  const cpuSeries = [
    {
      name: "CPU 사용률",
      data: metricsHistory.map((m) => ({ x: m.x, y: m.cpuUsage })),
    },
  ];

  const cpuChartOptions = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      sparkline: { enabled: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 700,
        dynamicAnimation: { enabled: true, speed: 500 },
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
    colors: ["#00cc33"],
    markers: {
      size: 0,
      hover: { size: 5 },
      colors: ["#00cc33"],
      strokeColors: "#000000",
      strokeWidth: 2,
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        format: "HH:mm",
        style: { fontSize: "11px", colors: "#1a6b2a", fontFamily: "monospace" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: {
        formatter: (val) => `${val.toFixed(0)}%`,
        style: { fontSize: "11px", colors: ["#1a6b2a"], fontFamily: "monospace" },
      },
    },
    tooltip: {
      theme: "dark",
      x: { format: "HH:mm:ss" },
      y: { formatter: (val) => `${val.toFixed(2)}%` },
      marker: { show: true },
      style: { fontFamily: "monospace", fontSize: "12px" },
    },
    grid: {
      borderColor: "#0a2a10",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 0, right: 0 },
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          borderColor: "#ff4444",
          borderWidth: 1,
          strokeDashArray: 5,
          label: {
            text: "CRITICAL",
            position: "right",
            style: {
              color: "#ff4444",
              background: "transparent",
              fontSize: "10px",
              fontFamily: "monospace",
            },
          },
        },
      ],
    },
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
                  네트워크 트래픽
                </CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">↓ 수신 (Download)</p>
                <p className="text-3xl font-bold text-blue-500">
                  {latestMetric?.networkRxKb != null ? latestMetric.networkRxKb : "-"}
                  <span className="text-sm font-normal text-muted-foreground ml-1">KB/s</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">↑ 송신 (Upload)</p>
                <p className="text-3xl font-bold text-orange-500">
                  {latestMetric?.networkTxKb != null ? latestMetric.networkTxKb : "-"}
                  <span className="text-sm font-normal text-muted-foreground ml-1">KB/s</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-black border-[#0a2a10]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00cc33] animate-pulse" />
                  <CardTitle className="text-sm font-mono text-[#00cc33]">CPU 사용률 추이</CardTitle>
                </div>
                <span className="text-2xl font-bold font-mono text-[#00cc33]">
                  {latestMetric?.cpuUsage?.toFixed(1) ?? "0"}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {metricsHistory.length > 0 ? (
                <ReactApexChart
                  key={metricsHistory.length}
                  type="area"
                  height={220}
                  series={cpuSeries}
                  options={cpuChartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm font-mono text-[#1a6b2a]">
                  $ loading metrics...
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f1a] border-[#1a1a2e]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <CardTitle className="text-sm font-mono text-indigo-400">메모리 사용률 추이</CardTitle>
                </div>
                <span className="text-2xl font-bold font-mono text-indigo-400">
                  {latestMetric?.memoryPercentage?.toFixed(1) ?? "0"}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {metricsHistory.length > 0 ? (
                <ReactApexChart
                  key={`mem-${metricsHistory.length}`}
                  type="area"
                  height={220}
                  series={memorySeries}
                  options={memoryChartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm font-mono text-indigo-900">
                  $ loading metrics...
                </div>
              )}
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
