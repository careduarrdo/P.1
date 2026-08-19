# Barbearia Black

Site moderno e responsivo para apresentação de serviços e agendamento de horários de uma barbearia fictícia. O projeto foi desenvolvido somente com HTML5, CSS3 e JavaScript puro e funciona ao abrir o arquivo `index.html`.

## Objetivo

Demonstrar, em um projeto de portfólio, a construção de uma interface profissional sem frameworks, incluindo responsividade, validação de formulário, persistência local e integração com WhatsApp.

## Tecnologias utilizadas

- HTML5 semântico
- CSS3 com Grid, Flexbox, variáveis, animações e media queries
- JavaScript puro
- Web Storage API por meio do `localStorage`
- API de URL do WhatsApp

## Funcionalidades

- Página inicial com menu responsivo e chamada para agendamento
- Cards de serviços com preço e duração
- Preenchimento automático do serviço ao clicar em `Escolher`
- Formulário detalhado de agendamento
- Validação de campos obrigatórios, telefone e data
- Bloqueio de datas anteriores ao dia atual
- Bloqueio de horário duplicado para o mesmo barbeiro
- Armazenamento dos agendamentos no navegador
- Card visual de confirmação
- Geração de mensagem completa para WhatsApp
- Listagem de agendamentos salvos
- Cancelamento com confirmação
- Seções Sobre e Contato
- Layout adaptado para computador, tablet e celular
- Respeito à preferência de redução de movimentos do sistema

## Como executar

1. Baixe ou clone este repositório.
2. Mantenha os quatro arquivos na mesma pasta.
3. Abra o arquivo `index.html` em um navegador moderno.

Não é necessário instalar dependências, iniciar servidor ou configurar banco de dados.

## Estrutura dos arquivos

```text
barbearia-black/
├── index.html    # Estrutura e conteúdo da página
├── style.css     # Aparência, animações e responsividade
├── script.js     # Validação, agendamentos e WhatsApp
└── README.md     # Documentação do projeto
```

## Como funciona o localStorage

Os agendamentos são convertidos em JSON e salvos no `localStorage` com a chave `barbeariaBlackAppointments`. Ao carregar a página, o JavaScript recupera essa lista e recria os cards da seção **Meus Agendamentos**.

O `localStorage` pertence ao navegador e ao dispositivo atual. Por isso, este projeto simula um sistema de armazenamento, mas não sincroniza dados entre pessoas ou dispositivos. Em uma aplicação comercial, seria necessário usar servidor, autenticação e banco de dados.

## Sistema de agendamento

Ao enviar o formulário, o JavaScript:

1. Verifica os campos obrigatórios.
2. Valida nome, telefone, data e descrição do corte.
3. Compara barbeiro, data e horário com os agendamentos salvos.
4. Impede a reserva caso o mesmo barbeiro já esteja ocupado.
5. Salva o novo registro no `localStorage`.
6. Atualiza a confirmação e a lista de agendamentos.

## Integração com WhatsApp

Após a confirmação, o sistema monta uma mensagem contendo todos os dados da reserva, aplica `encodeURIComponent` e gera uma URL no formato `https://wa.me/numero?text=mensagem`.

Para usar o número real, altere esta constante no início do arquivo `script.js`:

```javascript
const WHATSAPP_NUMBER = "5511999999999";
```

Use somente números, incluindo código do país e DDD, sem espaços, parênteses, `+` ou hífens.

## Personalização

Você pode alterar facilmente:

- Serviços, preços e durações no `index.html`
- Barbeiros e horários disponíveis no `index.html`
- Cores nas variáveis declaradas no início do `style.css`
- Número do WhatsApp no `script.js`
- Telefone, endereço e redes sociais no `index.html`

## O que aprendi com este projeto

- Organizar responsabilidades entre HTML, CSS e JavaScript
- Criar interfaces responsivas com Grid e Flexbox
- Validar formulários sem bibliotecas externas
- Persistir e recuperar dados com `localStorage`
- Evitar conflitos de agendamento
- Gerar mensagens dinâmicas para WhatsApp
- Manipular o DOM com segurança
- Criar componentes visuais reutilizáveis e acessíveis

## Observação

A Barbearia Black, os profissionais e os dados de contato apresentados são fictícios e foram criados exclusivamente para demonstração em portfólio.

## Licença

Este projeto pode ser usado e adaptado para fins educacionais e de portfólio.
