export interface InfoPageContent {
  title: string;
  subtitle?: string;
  sections: { heading: string; body: string }[];
}

export const infoPages: Record<string, InfoPageContent> = {
  acessibilidade: {
    title: "Acessibilidade",
    subtitle: "Nosso compromisso com uma experiência inclusiva para todos.",
    sections: [
      {
        heading: "Recursos disponíveis",
        body: "Trabalhamos continuamente para que nosso site seja acessível a todas as pessoas, incluindo aquelas com deficiência visual, auditiva, motora ou cognitiva. Nosso site segue as diretrizes WCAG 2.1.",
      },
      {
        heading: "Atalhos de teclado",
        body: "Você pode navegar pelo site utilizando apenas o teclado. Use Tab para avançar, Shift+Tab para retroceder e Enter para acionar links e botões.",
      },
      {
        heading: "Contato",
        body: "Se você encontrar alguma barreira de acessibilidade, entre em contato pelo nosso canal de atendimento. Estamos sempre evoluindo.",
      },
    ],
  },
  "grupo-boticario": {
    title: "Grupo Boticário",
    subtitle: "Conheça o maior grupo de beleza multicanal do Brasil.",
    sections: [
      {
        heading: "Quem somos",
        body: "O Grupo Boticário reúne marcas como O Boticário, Eudora, Quem Disse, Berenice?, Vult, O.U.i e Beleza na Web, levando beleza, autoestima e cuidado para milhões de brasileiros.",
      },
      {
        heading: "Nossa missão",
        body: "Criar produtos e experiências que inspirem as pessoas a se sentirem bem com elas mesmas, gerando impacto positivo na sociedade e no planeta.",
      },
      {
        heading: "Sustentabilidade",
        body: "Investimos em embalagens sustentáveis, fórmulas conscientes e iniciativas de preservação ambiental por meio da Fundação Grupo Boticário.",
      },
    ],
  },
  ajuda: {
    title: "Precisa de ajuda?",
    subtitle: "Encontre respostas para as dúvidas mais comuns.",
    sections: [
      {
        heading: "Dúvidas sobre pedidos",
        body: "Para acompanhar seu pedido, acesse Minha Conta > Meus Pedidos. Lá você encontra status, código de rastreio e nota fiscal.",
      },
      {
        heading: "Trocas e devoluções",
        body: "Você tem até 7 dias após o recebimento para solicitar a troca ou devolução. Os produtos devem estar lacrados e na embalagem original.",
      },
      {
        heading: "Fale conosco",
        body: "Atendimento por chat de segunda a sábado, das 8h às 22h. WhatsApp: 0800 727 0011.",
      },
    ],
  },
  revendedor: {
    title: "Portal do Revendedor",
    subtitle: "Acesso exclusivo para nossa rede de revendedoras e revendedores.",
    sections: [
      {
        heading: "Acesso ao portal",
        body: "Use seu CPF e senha cadastrados para acessar pedidos, materiais de divulgação, treinamentos e benefícios exclusivos.",
      },
      {
        heading: "Suporte ao revendedor",
        body: "Conte com nossa equipe para apoio em vendas, logística e desenvolvimento do seu negócio.",
      },
    ],
  },
  "quero-revender": {
    title: "Quero Revender",
    subtitle: "Faça parte da maior rede de beleza do Brasil.",
    sections: [
      {
        heading: "Por que revender O Boticário?",
        body: "Tenha acesso a produtos amados pelo Brasil, descontos exclusivos, treinamentos gratuitos e a chance de empreender com flexibilidade.",
      },
      {
        heading: "Como começar",
        body: "Cadastre-se em poucos minutos, escolha seu kit inicial e comece a vender para sua rede de contatos. Sem mensalidade.",
      },
      {
        heading: "Benefícios",
        body: "Bonificações, campanhas de incentivo, programas de desenvolvimento profissional e a possibilidade de ter sua própria franquia.",
      },
    ],
  },
  "perguntas-frequentes": {
    title: "Perguntas Frequentes",
    sections: [
      { heading: "Como faço para criar uma conta?", body: "Clique em Entrar no topo do site e selecione Criar conta. Preencha seus dados e pronto." },
      { heading: "Posso cancelar meu pedido?", body: "Sim, enquanto o status estiver como 'Em separação'. Acesse Meus Pedidos para cancelar." },
      { heading: "Qual o prazo de entrega?", body: "O prazo varia conforme a região e é informado na finalização da compra." },
    ],
  },
  "formas-de-pagamento": {
    title: "Formas de Pagamento",
    sections: [
      { heading: "Cartões aceitos", body: "Visa, Mastercard, American Express, Elo, Diners e Hipercard." },
      { heading: "Pix", body: "Aprovação imediata e 5% de desconto adicional em compras à vista." },
      { heading: "Parcelamento", body: "Em até 10x sem juros no cartão de crédito para compras acima de R$ 100." },
    ],
  },
  "frete-e-entrega": {
    title: "Frete e Entrega",
    sections: [
      { heading: "Prazos", body: "De 2 a 10 dias úteis, dependendo da sua região." },
      { heading: "Frete grátis", body: "Em compras acima de R$ 159 para todo o Brasil." },
      { heading: "Rastreamento", body: "Você recebe o código por e-mail assim que o pedido é despachado." },
    ],
  },
  "trocas-e-devolucoes": {
    title: "Trocas e Devoluções",
    sections: [
      { heading: "Prazo", body: "7 dias corridos a partir do recebimento, conforme o Código de Defesa do Consumidor." },
      { heading: "Como solicitar", body: "Entre em Meus Pedidos, escolha o item e clique em 'Solicitar troca/devolução'." },
      { heading: "Reembolso", body: "Estornado na mesma forma de pagamento em até 2 faturas." },
    ],
  },
  "mapa-do-site": {
    title: "Mapa do Site",
    sections: [
      { heading: "Categorias principais", body: "Perfumaria, Corpo e Banho, Maquiagem, Cabelos, Skincare, Infantil, Masculino, Presentes." },
      { heading: "Atendimento", body: "Ajuda, Trocas e Devoluções, Frete, Pagamento, Acessibilidade." },
      { heading: "Institucional", body: "Grupo Boticário, Sustentabilidade, Diversidade, Quero Revender." },
    ],
  },
  "politica-de-privacidade": {
    title: "Política de Privacidade",
    sections: [
      { heading: "Coleta de dados", body: "Coletamos apenas os dados necessários para processar seu pedido e melhorar sua experiência." },
      { heading: "Uso dos dados", body: "Seus dados são tratados conforme a LGPD e nunca compartilhados sem seu consentimento." },
      { heading: "Seus direitos", body: "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento." },
    ],
  },
  "termos-de-uso": {
    title: "Termos de Uso",
    sections: [
      { heading: "Aceitação", body: "Ao usar este site, você concorda com nossos termos e condições." },
      { heading: "Propriedade intelectual", body: "Todo o conteúdo é protegido por direitos autorais e marcas registradas." },
    ],
  },
  "preferencias-de-cookies": {
    title: "Preferências de Cookies",
    sections: [
      { heading: "Sobre os cookies", body: "Usamos cookies para melhorar sua navegação, personalizar conteúdo e analisar o tráfego." },
      { heading: "Gerenciar", body: "Você pode aceitar, recusar ou personalizar suas preferências a qualquer momento." },
    ],
  },
  "proteja-se-contra-fraudes": {
    title: "Proteja-se Contra Fraudes",
    sections: [
      { heading: "Canais oficiais", body: "Compre apenas no site oficial e em nossos perfis verificados nas redes sociais." },
      { heading: "Atenção a links", body: "Nunca clique em links suspeitos recebidos por e-mail, SMS ou WhatsApp." },
      { heading: "Em caso de dúvida", body: "Entre em contato pelos nossos canais oficiais antes de fornecer qualquer dado." },
    ],
  },
  "codigo-de-defesa-do-consumidor": {
    title: "Código de Defesa do Consumidor",
    sections: [
      { heading: "Seus direitos", body: "Conheça os direitos garantidos pelo CDC nas suas compras online." },
    ],
  },
  "consumidor-gov": {
    title: "consumidor.gov",
    sections: [
      { heading: "Plataforma oficial", body: "Estamos cadastrados na plataforma consumidor.gov.br para resolução pública de demandas." },
    ],
  },
  "alerta-sobre-seguranca": {
    title: "Alerta Sobre Segurança",
    sections: [
      { heading: "Comunicações oficiais", body: "Nunca solicitamos senhas, dados de cartão ou códigos por telefone, SMS ou e-mail." },
    ],
  },
  "nossos-projetos": {
    title: "Nossos Projetos",
    sections: [{ heading: "Iniciativas", body: "Conheça os projetos sociais e ambientais apoiados pelo Grupo Boticário." }],
  },
  "nossa-historia": {
    title: "Nossa História",
    sections: [{ heading: "Mais de 40 anos", body: "Uma história de paixão pela beleza e cuidado com as pessoas." }],
  },
  sustentabilidade: {
    title: "Sustentabilidade",
    sections: [{ heading: "Compromisso", body: "Metas ambiciosas de redução de impacto ambiental até 2030." }],
  },
  diversidade: {
    title: "Diversidade",
    sections: [{ heading: "Beleza plural", body: "Acreditamos que a diversidade fortalece nossa marca e nossa sociedade." }],
  },
  "relatorio-transparente": {
    title: "Relatório Transparente",
    sections: [{ heading: "Prestação de contas", body: "Acesse nossos relatórios anuais de sustentabilidade e governança." }],
  },
};
