import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFindEmail } from "@/hooks/queries/findEmail";

export default function FindEmail() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [foundEmail, setFoundEmail] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const { mutate: findEmail, isPending } = useFindEmail(
    setFoundEmail,
    setError,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFoundEmail("");
    findEmail({ name: formData.name, phone: formData.phone });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-heading text-primary">
            이메일 찾기
          </CardTitle>
          <CardDescription>
            가입 시 사용한 이메일 주소를 찾습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {foundEmail && (
              <Alert variant="success">
                <AlertTitle>이메일을 찾았습니다</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="text-lg font-medium">{foundEmail}</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                ※ 전화번호 인증 기능은 제공되지 않습니다
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              이메일 찾기
            </Button>

            {foundEmail && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                로그인하러 가기
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← 로그인 화면으로 돌아가기
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
