import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { HomeIcon } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8">Você aqui de novo?</p>
      <Button asChild>
        <Link to="/" className="flex items-center gap-2">
          <HomeIcon className="w-4 h-4" />
          Retornar
        </Link>
      </Button>
    </div>
  )
}

