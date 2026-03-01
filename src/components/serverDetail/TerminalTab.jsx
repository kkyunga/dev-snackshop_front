import { useState, useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal as TerminalIcon, Loader } from "lucide-react";

export default function TerminalTab({ server }) {
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
