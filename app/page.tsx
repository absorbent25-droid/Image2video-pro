import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">
          🚀 Image2Video App
        </h1>

        <form className="flex flex-col gap-4">
          <Input type="file" accept="image/*" />
          <Button type="submit" variant="primary">
            Конвертировать
          </Button>
          <Button type="button" variant="secondary">
            Очистить
          </Button>
        </form>
      </Card>
    </main>
  );
}
