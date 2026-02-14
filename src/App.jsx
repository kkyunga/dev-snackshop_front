import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import FindEmail from "@/pages/FindEmail";
import FindPassword from "@/pages/FindPassword";
import VerifyCode from "@/pages/VerifyCode";
import DesignSystem from "@/pages/DesignSystem";
import PrivateRoute from "@/pages/PrivateRoute";
import Main from "@/pages/Main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 1. 루트(/) 접속 시 홈인 /main으로 자동 이동 */}
          <Route path="/" element={<Navigate to="/main" replace />} />

          {/* 2. 실제 홈 페이지인 /main을 PrivateRoute로 감싸기 (중요!) */}
          <Route
            path="/main"
            element={
              <PrivateRoute>
                <Main />
              </PrivateRoute>
            }
          />

          {/* 3. 로그인 및 인증 페이지 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/find-email" element={<FindEmail />} />
          <Route path="/find-password" element={<FindPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/design-system" element={<DesignSystem />} />

          {/* 4. 정의되지 않은 모든 경로는 홈(/main)으로 보냄 */}
          <Route path="*" element={<Navigate to="/main" replace />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
