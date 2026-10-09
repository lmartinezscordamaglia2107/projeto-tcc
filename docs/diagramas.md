# Diagramas do sistema Vectra Sport

Os diagramas são fontes Mermaid editáveis. A renderização depende de um visualizador compatível com Mermaid.

## Figura 1 — Casos de uso

```mermaid
flowchart LR
  cliente["Cliente comprador"]
  admin["Administrador"]
  gateway["Gateway de pagamento"]
  subgraph sistema["Sistema de e-commerce Vectra Sport"]
    uc1([Consultar catálogo])
    uc2([Buscar e filtrar produtos])
    uc3([Gerenciar carrinho])
    uc4([Realizar checkout])
    uc5([Acompanhar pedido])
    uc6([Avaliar produto comprado])
    ua1([Gerenciar catálogo])
    ua2([Controlar estoque])
    ua3([Gerenciar pedidos])
    ug1([Autorizar pagamento])
  end
  cliente --- uc1
  cliente --- uc2
  cliente --- uc3
  cliente --- uc4
  cliente --- uc5
  cliente --- uc6
  admin --- ua1
  admin --- ua2
  admin --- ua3
  gateway --- ug1
  uc4 -. solicita autorização .-> ug1
```

## Figura 2 — Fluxograma de compra

```mermaid
flowchart TD
  A([Início]) --> B[Consultar catálogo]
  B --> C[Buscar ou filtrar produtos]
  C --> D[Selecionar produto e variação]
  D --> E{Tamanho disponível?}
  E -- Não --> F[Informar indisponibilidade e sugerir outra variação]
  F --> D
  E -- Sim --> G[Adicionar ao carrinho]
  G --> H{Continuar comprando?}
  H -- Sim --> B
  H -- Não --> I[Revisar carrinho e cupom]
  I --> J{Cliente autenticado?}
  J -- Não --> K[Entrar ou criar conta]
  K --> L[Confirmar endereço e frete]
  J -- Sim --> L
  L --> M[Selecionar forma de pagamento]
  M --> N[Enviar transação ao gateway]
  N --> O{Pagamento autorizado?}
  O -- Não --> P[Informar recusa e permitir nova tentativa]
  P --> M
  O -- Sim --> Q[Registrar pedido e atualizar estoque]
  Q --> R[Enviar confirmação]
  R --> S([Fim])
```

**Observação:** os diagramas representam a especificação proposta. A confirmação de pagamento, atualização de estoque e envio de e-mail aparecem como comportamento esperado de uma implementação futura, não como funcionalidades de produção do protótipo estático.
