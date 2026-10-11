# Vectra Sport — TCC e protótipo

Workspace acadêmico para especificação do e-commerce Vectra Sport e protótipo navegável de loja esportiva.

## Executar a loja e o backend de pagamento

É necessário Node.js 20 ou superior. Na pasta do projeto:

```powershell
npm install
Copy-Item .env.example .env
```

No `.env`, informe um Access Token de **teste** do Mercado Pago e `SHIPPING_COST_BRL` com a tarifa fixa de frete definida pela loja. Inicie o servidor:

```powershell
npm start
```

Abra `http://localhost:4173`. Para receber o cliente de volta após o checkout, configure `APP_BASE_URL` como domínio público HTTPS; o Mercado Pago não aceita `localhost` em URLs de retorno. Sem credenciais e frete, a API recusa a criação de pagamento. Nunca coloque o Access Token no navegador, em `app.js` ou em repositório.

Como prévia visual, `index.html` pode ser aberto diretamente, mas o checkout não funcionará sem o backend. Imagens e fontes visuais dependem de conexão com a internet.

## O que funciona na demonstração

- Busca, filtros por modalidade e ordenação do catálogo.
- Detalhe do produto, seleção de tamanho e indicação de tamanhos indisponíveis.
- Carrinho com quantidades, remoção de itens e cupom demonstrativo `VECTRA10`.
- Consulta de CEP pela API pública ViaCEP no checkout para preencher rua, cidade e UF; o endereço também pode ser preenchido manualmente se a consulta falhar.
- Fluxo de checkout com redirecionamento ao Mercado Pago Checkout Pro quando configurado.
- Painel administrativo demonstrativo com itens de estoque baixo e reposição local.
- Persistência local de carrinho e estoque demonstrativo no navegador via `localStorage`.

O checkout consulta a API pública ViaCEP (`https://viacep.com.br`) para sugerir rua, cidade e UF a partir do CEP. A consulta requer conexão com a internet; se falhar, o endereço pode ser informado manualmente. O ViaCEP não calcula frete: o valor implementado continua sendo uma tarifa fixa configurada no servidor. O Checkout Pro processa pagamento no ambiente do Mercado Pago e oferece os métodos habilitados na conta, incluindo Pix, cartão e boleto no Brasil. A integração de pagamento depende das credenciais de teste do lojista. O projeto não mantém pedidos em banco, não valida status por webhook, não dá baixa permanente de estoque, não autentica usuários e não envia e-mails. Portanto, o retorno do provedor não deve ser tratado como confirmação final de pedido. Não use credenciais reais até implementar persistência, webhook verificado e testes.

## Documentação do TCC

- [Documento-base do TCC](docs/TCC.md): introdução, metodologia, dados fornecidos, requisitos, UC03, processo de compra, protótipo, conclusão e pendências acadêmicas.
- [Diagramas editáveis](docs/diagramas.md): casos de uso e fluxograma de compra em Mermaid.

Os números da pesquisa foram recebidos no roteiro do projeto. Antes da entrega, confira os dados e complete informações metodológicas, citações, referências, identificação institucional e evidências de validação, conforme as pendências no documento.

## Estrutura

- `index.html`: estrutura e conteúdo do protótipo.
- `styles.css`: identidade visual e comportamento responsivo.
- `app.js`: catálogo, filtros, carrinho, checkout e redirecionamento à API de pagamento.
- `server.js`: servidor local, validação do carrinho e criação de preferência Mercado Pago.
- `.env.example`: variáveis necessárias para configurar o ambiente de teste.
- `docs/`: texto acadêmico e fontes dos diagramas.
- `.github/copilot-instructions.md`: instruções locais do workspace.

## Checagem

Com Node.js instalado, execute `npm run check` para verificar a sintaxe do servidor e do frontend. A criação de pagamentos exige credenciais de teste; a consulta pública de CEP não exige credenciais.
