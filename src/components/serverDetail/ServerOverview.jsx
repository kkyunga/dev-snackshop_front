import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  Calendar,
  FileText,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ReactApexChart from "react-apexcharts";
import { useServerMetricsEs } from "@/hooks/queries/useServerMetricsEs";
import { useServerLogAnalyze } from "@/hooks/queries/useServerLogAnalyze";

const LOG_SECTIONS = [
  { key: "syslog",  label: "Syslog" },
  { key: "auth",    label: "Auth" },
  { key: "kernel",  label: "Kernel" },
  { key: "package", label: "Package" },
  { key: "systemd", label: "Systemd" },
  { key: "dmesg",   label: "Dmesg" },
];

const CHART_CONFIG = {
  syslog:  [
    { key: "errorCount",  name: "에러",        fill: "#ef4444" },
    { key: "oomCount",    name: "OOM Kill",    fill: "#dc2626" },
    { key: "cronFail",    name: "Cron 실패",   fill: "#f97316" },
    { key: "serviceFail", name: "서비스 실패", fill: "#eab308" },
  ],
  auth: [
    { key: "authSuccess", name: "로그인 성공",  fill: "#22c55e" },
    { key: "authFail",    name: "로그인 실패",  fill: "#ef4444" },
    { key: "invalidUser", name: "잘못된 계정",  fill: "#f97316" },
    { key: "rootLogin",   name: "Root 로그인", fill: "#dc2626" },
    { key: "sudoUsage",   name: "Sudo",        fill: "#3b82f6" },
  ],
  kernel: [
    { key: "errorCount",     name: "에러",        fill: "#ef4444" },
    { key: "segfaultCount",  name: "Segfault",    fill: "#dc2626" },
    { key: "diskErrorCount", name: "디스크 에러", fill: "#f97316" },
  ],
  package: [
    { key: "installCount", name: "설치", fill: "#22c55e" },
    { key: "removeCount",  name: "제거", fill: "#f97316" },
    { key: "errorCount",   name: "에러", fill: "#ef4444" },
  ],
  systemd: [
    { key: "failedCount", name: "실패 유닛", fill: "#ef4444" },
  ],
  dmesg: [
    { key: "errorCount", name: "에러", fill: "#ef4444" },
  ],
};

const TABLE_CONFIG = {
  syslog:  { listKey: "topErrors",    cols: [{ key: "message", label: "메시지" }, { key: "count", label: "횟수" }] },
  auth:    { listKey: "topAttackIps", cols: [{ key: "ip",      label: "IP" },     { key: "count", label: "시도" }] },
  kernel:  { listKey: "topErrors",    cols: [{ key: "message", label: "메시지" }, { key: "count", label: "횟수" }] },
  package: { listKey: "recentList",   cols: [{ key: "action",  label: "작업" },   { key: "packageName", label: "패키지" }] },
  systemd: { listKey: "failedUnits",  cols: [{ key: "unit",    label: "유닛" },   { key: "state", label: "상태" }] },
  dmesg:   { listKey: "topErrors",    cols: [{ key: "message", label: "메시지" }, { key: "count", label: "횟수" }] },
};

const getSectionData = (logAnalyze, key) => {
  if (!logAnalyze?.system) return null;
  return key === "package" ? logAnalyze.system["package"] : logAnalyze.system[key];
};

const getSectionBadgeCount = (key, data) => {
  if (!data) return 0;
  switch (key) {
    case "syslog":  return (data.errorCount ?? 0) + (data.oomCount ?? 0) + (data.cronFail ?? 0) + (data.serviceFail ?? 0);
    case "auth":    return (data.authFail ?? 0) + (data.invalidUser ?? 0) + (data.rootLogin ?? 0);
    case "kernel":  return (data.errorCount ?? 0) + (data.segfaultCount ?? 0) + (data.diskErrorCount ?? 0);
    case "package": return (data.installCount ?? 0) + (data.removeCount ?? 0);
    case "systemd": return data.failedCount ?? 0;
    case "dmesg":   return data.errorCount ?? 0;
    default:        return 0;
  }
};

export default function ServerOverview({ server, serverId }) {
  const [selectedLogType, setSelectedLogType] = useState("syslog");

  const schedules = server?.schedules ?? [];

  const { data: metricsHistory = [] } = useServerMetricsEs();
  const { data: logAnalyze }          = useServerLogAnalyze(serverId);
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
      animations: { enabled: true, easing: "easeinout", speed: 700, dynamicAnimation: { enabled: true, speed: 500 } },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 100] } },
    colors: ["#818cf8"],
    markers: { size: 0, hover: { size: 5 }, colors: ["#818cf8"], strokeColors: "#0f0f1a", strokeWidth: 2 },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false, format: "HH:mm", style: { fontSize: "11px", colors: "#334155", fontFamily: "monospace" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0, max: 100, tickAmount: 4,
      labels: { formatter: (val) => `${val.toFixed(0)}%`, style: { fontSize: "11px", colors: ["#334155"], fontFamily: "monospace" } },
    },
    tooltip: { theme: "dark", x: { format: "HH:mm:ss" }, y: { formatter: (val) => `${val.toFixed(1)}%` }, marker: { show: true }, style: { fontFamily: "monospace", fontSize: "12px" } },
    grid: { borderColor: "#0f0f1a", strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    annotations: {
      yaxis: [{ y: 90, borderColor: "#ff4444", borderWidth: 1, strokeDashArray: 5, label: { text: "CRITICAL", position: "right", style: { color: "#ff4444", background: "transparent", fontSize: "10px", fontFamily: "monospace" } } }],
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
      animations: { enabled: true, easing: "easeinout", speed: 700, dynamicAnimation: { enabled: true, speed: 500 } },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.0, stops: [0, 100] } },
    colors: ["#00cc33"],
    markers: { size: 0, hover: { size: 5 }, colors: ["#00cc33"], strokeColors: "#000000", strokeWidth: 2 },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false, format: "HH:mm", style: { fontSize: "11px", colors: "#1a6b2a", fontFamily: "monospace" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0, tickAmount: 4,
      labels: { formatter: (val) => `${val.toFixed(0)}%`, style: { fontSize: "11px", colors: ["#1a6b2a"], fontFamily: "monospace" } },
    },
    tooltip: { theme: "dark", x: { format: "HH:mm:ss" }, y: { formatter: (val) => `${val.toFixed(2)}%` }, marker: { show: true }, style: { fontFamily: "monospace", fontSize: "12px" } },
    grid: { borderColor: "#0a2a10", strokeDashArray: 3, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { left: 0, right: 0 } },
    annotations: {
      yaxis: [{ y: 80, borderColor: "#ff4444", borderWidth: 1, strokeDashArray: 5, label: { text: "CRITICAL", position: "right", style: { color: "#ff4444", background: "transparent", fontSize: "10px", fontFamily: "monospace" } } }],
    },
  };

  const sectionData  = getSectionData(logAnalyze, selectedLogType);
  const chartBars    = CHART_CONFIG[selectedLogType] ?? [];
  const chartData    = chartBars.map((b) => ({ name: b.name, value: sectionData?.[b.key] ?? 0, fill: b.fill }));
  const hasChartData = chartData.some((d) => d.value > 0);
  const tableConf    = TABLE_CONFIG[selectedLogType];
  const tableItems   = sectionData?.[tableConf?.listKey] ?? [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="container p-6 mx-auto space-y-6">

        {/* ── 서버 상세 정보 ── */}
        <Card>
          <CardHeader>
            <CardTitle>서버 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">CPU</p><p className="text-sm font-semibold">{server.cpuInfo ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">서버 종류</p><p className="text-sm font-semibold">{server.osType ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">운영체제</p><p className="text-sm font-semibold">{server.osVersion ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">IP 주소</p><p className="font-mono text-sm font-semibold">{server.ip ?? "데이터 없음"}:{server.port ?? "-"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">위치</p><p className="text-sm font-semibold">{server.country ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">클라우드 서비스</p><p className="text-sm font-semibold">{server.cloudService ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">서버 용도</p><p className="text-sm font-semibold">{server.purpose ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">인증 방식</p><p className="text-sm font-semibold">{server.authType ?? "데이터 없음"}</p></div>
              <div><p className="mb-1 text-sm font-medium text-muted-foreground">사용자명</p><p className="text-sm font-semibold">{server.username ?? "데이터 없음"}</p></div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">설치된 소프트웨어</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {server.softwareToInstall?.length > 0
                    ? server.softwareToInstall.map((sw, idx) => <Badge key={idx} variant="secondary" className="text-xs">{sw.name}</Badge>)
                    : <span className="text-sm text-muted-foreground">데이터 없음</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 미니 카드 4개 ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">CPU 사용률</CardTitle>
                <Cpu className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestMetric?.cpuUsage?.toFixed(1) ?? "-"}%</div>
              <p className="mt-1 text-xs text-muted-foreground">{latestMetric?.cpuCores ?? "-"} Cores / {latestMetric?.cpuThreads ?? "-"} Threads</p>
              <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full transition-all bg-primary" style={{ width: `${latestMetric?.cpuUsage ?? 0}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">메모리</CardTitle>
                <MemoryStick className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestMetric?.memoryUsed ?? "-"}MB</div>
              <p className="mt-1 text-xs text-muted-foreground">/ {latestMetric?.memoryTotal ?? "-"}MB ({latestMetric?.memoryPercentage?.toFixed(1) ?? "-"}%)</p>
              <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full transition-all bg-primary" style={{ width: `${latestMetric?.memoryPercentage ?? 0}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">디스크</CardTitle>
                <HardDrive className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{latestMetric?.diskUsed ?? "-"}</div>
              <p className="mt-1 text-xs text-muted-foreground">/ {latestMetric?.diskTotal ?? "-"} ({latestMetric?.diskPercentage?.toFixed(1) ?? "-"}%)</p>
              <div className="h-2 mt-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full transition-all bg-primary" style={{ width: `${latestMetric?.diskPercentage ?? 0}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">네트워크 트래픽</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">↓ 수신 (Download)</p>
                <p className="text-3xl font-bold text-blue-500">
                  {latestMetric?.networkRxKb != null ? latestMetric.networkRxKb : "-"}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">KB/s</span>
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">↑ 송신 (Upload)</p>
                <p className="text-3xl font-bold text-orange-500">
                  {latestMetric?.networkTxKb != null ? latestMetric.networkTxKb : "-"}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">KB/s</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── CPU / 메모리 추이 차트 ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-black border-[#0a2a10]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00cc33] animate-pulse" />
                  <CardTitle className="text-sm font-mono text-[#00cc33]">CPU 사용률 추이</CardTitle>
                </div>
                <span className="text-2xl font-bold font-mono text-[#00cc33]">{latestMetric?.cpuUsage?.toFixed(1) ?? "0"}%</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {metricsHistory.length > 0 ? (
                <ReactApexChart key={metricsHistory.length} type="area" height={220} series={cpuSeries} options={cpuChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm font-mono text-[#1a6b2a]">$ loading metrics...</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f1a] border-[#1a1a2e]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <CardTitle className="font-mono text-sm text-indigo-400">메모리 사용률 추이</CardTitle>
                </div>
                <span className="font-mono text-2xl font-bold text-indigo-400">{latestMetric?.memoryPercentage?.toFixed(1) ?? "0"}%</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {metricsHistory.length > 0 ? (
                <ReactApexChart key={`mem-${metricsHistory.length}`} type="area" height={220} series={memorySeries} options={memoryChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-[220px] text-sm font-mono text-indigo-900">$ loading metrics...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 로그 분석 ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <CardTitle>로그 분석</CardTitle>
                  {logAnalyze?.system && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {logAnalyze.system.osType} {logAnalyze.system.osVersion}
                    </span>
                  )}
                </div>
                {logAnalyze?.collectedAt && (
                  <span className="text-xs text-muted-foreground">
                    수집: {new Date(logAnalyze.collectedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>

              {/* 섹션 탭 */}
              <div className="flex flex-wrap gap-1.5">
                {LOG_SECTIONS.map((s) => {
                  const secData = getSectionData(logAnalyze, s.key);
                  const count = getSectionBadgeCount(s.key, secData);
                  const isActive = selectedLogType === s.key;
                  const isError = s.key !== "package" && count > 0;
                  const isActivity = s.key === "package" && count > 0;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setSelectedLogType(s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      {s.label}
                      <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[16px] h-4 px-1 ${
                        isActive
                          ? "bg-white/20 text-inherit"
                          : isError
                            ? "bg-red-500/15 text-red-500"
                            : isActivity
                              ? "bg-blue-500/15 text-blue-500"
                              : "bg-green-500/15 text-green-600"
                      }`}>
                        {count > 0 ? count : "✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {logAnalyze ? (
              <div className="space-y-4">
                {/* 수치 요약 카드 */}
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${chartBars.length}, minmax(0, 1fr))` }}>
                  {chartBars.map((bar) => {
                    const val = sectionData?.[bar.key] ?? 0;
                    return (
                      <div key={bar.key} className="p-3 text-center rounded-lg bg-muted/40">
                        <div className="text-2xl font-bold font-mono" style={{ color: val > 0 ? bar.fill : undefined }}>
                          {val}
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{bar.name}</div>
                      </div>
                    );
                  })}
                </div>

                {/* 차트 or 정상 상태 */}
                {hasChartData ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-5 rounded-lg bg-green-500/5 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">정상 — 이상 없음</span>
                  </div>
                )}

                {/* 상세 테이블 */}
                {tableItems.length > 0 && (
                  <div className="overflow-hidden border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          {tableConf.cols.map((col) => (
                            <th key={col.key} className="px-3 py-2 font-medium text-left text-muted-foreground">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableItems.map((item, i) => (
                          <tr key={i} className="border-t hover:bg-muted/50">
                            {tableConf.cols.map((col) => (
                              <td key={col.key} className={`px-3 py-2 font-mono ${col.key === "message" ? "max-w-xs truncate" : ""}`}>
                                {item[col.key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 브루트포스 경고 (Auth 전용) */}
                {selectedLogType === "auth" && sectionData?.topAttackIps?.length > 0 && (
                  <div className="p-3 border rounded-md bg-orange-500/10 border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-orange-600">브루트포스 공격 의심 IP</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sectionData.topAttackIps.map((item, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-[10px] border-orange-500/30 text-orange-600">
                          {item.ip} ({item.count}회)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] space-y-2">
                <div className="w-6 h-6 border-2 rounded-full border-primary border-t-transparent animate-spin" />
                <p className="text-sm font-mono text-muted-foreground">$ loading log analysis...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 정기 점검 일정 ── */}
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
                <div key={schedule.id} className="flex items-start gap-3 p-3 transition-colors border rounded-lg hover:bg-accent/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{schedule.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{schedule.date} {schedule.time}</p>
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
  );
}
