import type React from "react"

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 pb-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-xl font-bold text-slate-900 ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-slate-600 ${className}`}>{children}</p>
)

const Button = ({
  children,
  href,
  className = "",
}: { children: React.ReactNode; href?: string; className?: string }) => (
  <a
    href={href}
    className={`inline-block text-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${className}`}
  >
    {children}
  </a>
)

const MailIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const PhoneIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MessageCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const HelpCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ShieldIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const FileTextIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const Suporte = () => {
  const contactMethods = [
    {
      icon: MailIcon,
      title: "E-mail",
      description: "Resposta em até 24 horas",
      info: "contato@ficafrioltda.com",
      buttonText: "Enviar E-mail",
      href: "mailto:contato@ficafrioltda.com",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: PhoneIcon,
      title: "Telefone",
      description: "Seg a Sex, 9h às 18h",
      info: "(11) 99369-3710",
      buttonText: "Ligar Agora",
      href: "tel:+5511993693710",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      icon: MessageCircleIcon,
      title: "WhatsApp",
      description: "Atendimento rápido",
      info: "(11) 99369-3710",
      buttonText: "Abrir WhatsApp",
      href: "https://wa.me/5511993693710",
      gradient: "from-cyan-500 to-teal-500",
    },
  ]

  const faqs = [
    {
      icon: HelpCircleIcon,
      question: "Como cadastrar minha empresa?",
      answer:
        'Acesse a página "Cadastrar Empresa" no menu principal e preencha o formulário com as informações da sua empresa. Nossa equipe validará o cadastro em até 48 horas.',
    },
    {
      icon: HelpCircleIcon,
      question: "Quais tipos de produtos posso armazenar?",
      answer:
        "Aceitamos produtos perecíveis como hortifruti, carnes, laticínios, congelados e outros itens que necessitem de refrigeração controlada.",
    },
    {
      icon: HelpCircleIcon,
      question: "Como funciona o pagamento?",
      answer: "O pagamento é processado de forma segura através da plataforma. Aceitamos diversas formas de pagamento.",
    },
    {
      icon: ShieldIcon,
      question: "Meus dados estão seguros?",
      answer:
        "Sim. Utilizamos as melhores práticas de segurança e criptografia para proteger seus dados. Consulte nossa Política de Privacidade para mais detalhes.",
    },
    {
      icon: FileTextIcon,
      question: "Preciso de contrato?",
      answer:
        "Sim. Todas as reservas são formalizadas através de contrato digital para garantir segurança jurídica para ambas as partes.",
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Suporte
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Central de Suporte</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Estamos aqui para ajudar. Entre em contato conosco ou consulte nossa base de conhecimento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${method.gradient}`} />
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${method.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>{method.title}</CardTitle>
                  <CardDescription className="mt-2">{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-slate-900 mb-4">{method.info}</p>
                  <Button
                    href={method.href}
                    className={`w-full bg-linear-to-r ${method.gradient} text-white hover:shadow-lg hover:scale-105`}
                  >
                    {method.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Perguntas Frequentes</h2>
              <p className="text-slate-600">Encontre respostas rápidas para as dúvidas mais comuns</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <faq.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-3">{faq.question}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">{faq.answer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Suporte
