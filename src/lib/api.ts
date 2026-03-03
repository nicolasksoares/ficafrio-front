import axios, { type AxiosError } from "axios"
import { toast } from "sonner"

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ficafrio_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error("Tempo Esgotado", {
          description: "A requisição demorou muito. Tente novamente.",
        })
      } else {
        toast.error("Erro de Conexão", {
          description: "Não foi possível conectar ao servidor. Verifique sua internet.",
        })
      }
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const message = data?.message || "Ocorreu um erro inesperado."

    switch (status) {
      case 401:
        toast.error("Sessão Expirada", {
          description: "Por favor, faça login novamente.",
        })
        localStorage.removeItem("ficafrio_token")
        if (!window.location.pathname.includes("/auth")) {
          window.location.href = "/auth"
        }
        break

      case 403:
        toast.error("Acesso Negado", {
          description: message,
        })
        break

      case 404:
        toast.error("Não Encontrado", {
          description: "O recurso solicitado não foi encontrado.",
        })
        break

      case 422:
        if (data?.errors) {
          // Mostra todos os erros de validação
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n')
          
          toast.error("Dados Inválidos", {
            description: errorMessages || message,
            duration: 5000, // Mostra por mais tempo para ler todos os erros
          })
        } else {
          toast.error("Validação Falhou", {
            description: message,
          })
        }
        break

      case 429:
        toast.error("Muitas Requisições", {
          description: "Por favor, aguarde um momento antes de tentar novamente.",
        })
        break

      case 500:
      case 502:
      case 503:
        toast.error("Erro no Servidor", {
          description: "Nosso servidor está com problemas. Tente novamente em breve.",
        })
        break

      default:
        toast.error("Erro", {
          description: message,
        })
    }

    return Promise.reject(error)
  },
)

export default api