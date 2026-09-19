# Diagrams

All diagrams below are Mermaid — they render natively on GitHub. For the
final report, screenshot them from GitHub or export via
[mermaid.live](https://mermaid.live) (paste the code block in).

These match the **actual implemented system**, not the original proposal.

---

## 1. Architecture Diagram

```mermaid
flowchart TD
    U[User Browser] -->|HTTPS| FE[React Frontend<br/>Vercel]
    FE -->|REST API calls<br/>JWT Bearer token| BE[Express Backend<br/>Back4App Containers]
    BE -->|Mongoose ODM| DB[(MongoDB Atlas)]
    BE -->|HTTPS, batched price calls| CG[CoinGecko API<br/>external market data]

    subgraph Backend Modules
        BE --> Auth[Auth Module]
        BE --> Market[Market Data Module]
        BE --> Trade[Trading Engine]
        BE --> Wallet[Wallet Module]
        BE --> Portfolio[Portfolio Module]
        BE --> Ledger[Transaction Ledger]
    end
```

## 2. Use-Case Diagram

```mermaid
flowchart LR
    User((Registered User))

    User --> UC1([Register Account])
    User --> UC2([Log In])
    User --> UC3([View Market Prices])
    User --> UC4([View Price History Chart])
    User --> UC5([Buy Asset])
    User --> UC6([Sell Asset])
    User --> UC7([View Portfolio & P&L])
    User --> UC8([View Transaction History])
    User --> UC9([View Wallet Balance])

    UC5 -. requires .-> UC2
    UC6 -. requires .-> UC2
    UC7 -. requires .-> UC2
```

## 3. Data Flow Diagram — Level 0 (Context)

```mermaid
flowchart LR
    User([User]) -->|Login, Trade requests| System[[Cryptocurrency Simulator]]
    System -->|Portfolio, Prices, History| User
    System -->|Price requests| CoinGecko([CoinGecko API])
    CoinGecko -->|Price data| System
    System -->|Read/Write| DB[(MongoDB)]
```

## 4. Data Flow Diagram — Level 1 (BUY/SELL focus)

```mermaid
flowchart TD
    User([User]) -->|1. Submit BUY/SELL| API[Trading Engine Process]
    API -->|2. Validate quantity/asset| Validate[Validation]
    API -->|3. Fetch fresh price| CoinGecko([CoinGecko API])
    API -->|4. Check cash/holdings| WalletStore[(Wallet Data Store)]
    API -->|5. Check holdings| HoldingStore[(Holding Data Store)]
    API -->|6. Write updated cash| WalletStore
    API -->|7. Write updated holding| HoldingStore
    API -->|8. Write transaction record| TxStore[(Transaction Data Store)]
    API -->|9. Return result| User
```

## 5. ER / Database Diagram

```mermaid
erDiagram
    USER ||--|| WALLET : has
    USER ||--o{ HOLDING : owns
    USER ||--o{ TRANSACTION : makes

    USER {
        ObjectId _id
        string username
        string email
        string passwordHash
    }
    WALLET {
        ObjectId _id
        ObjectId userId
        number virtualCash
    }
    HOLDING {
        ObjectId _id
        ObjectId userId
        string assetId
        string symbol
        number quantity
        number avgCost
    }
    TRANSACTION {
        ObjectId _id
        ObjectId userId
        string assetId
        string symbol
        string type
        number quantity
        number executionPrice
        number totalValue
        string status
        date timestamp
        number sequenceNumber
        string previousHash
        string hash
    }
    LEDGER_STATE {
        string _id
        string lastHash
        number length
    }
```

`LEDGER_STATE` is a singleton document (global, not per-user) tracking
the current end of the hash chain — see `docs/blockchain-module.md`.

## 6. BUY Sequence Diagram

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend (tradingEngine.executeBuy)
    participant CG as CoinGecko API
    participant DB as MongoDB (transaction session)

    U->>FE: Enter quantity, click Buy
    FE->>BE: POST /api/trades/buy {assetId, quantity}
    BE->>BE: validateQuantity, validateAsset
    BE->>CG: GET fresh price (bypasses cache)
    CG-->>BE: current price (INR)
    BE->>DB: startSession / withTransaction
    BE->>DB: findOne Wallet
    alt insufficient cash
        BE-->>FE: 409 Insufficient virtual cash
    else sufficient cash
        BE->>DB: wallet.virtualCash -= tradeValue
        BE->>DB: findOne/upsert Holding (Weighted Avg Cost)
        BE->>DB: create Transaction (status COMPLETED)
        DB-->>BE: commit transaction
        BE-->>FE: 201 {transaction, wallet, holding}
        FE-->>U: Show updated balance & holding
    end
```

## 7. SELL Sequence Diagram

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant BE as Backend (tradingEngine.executeSell)
    participant CG as CoinGecko API
    participant DB as MongoDB (transaction session)

    U->>FE: Enter quantity, click Sell
    FE->>BE: POST /api/trades/sell {assetId, quantity}
    BE->>BE: validateQuantity, validateAsset
    BE->>CG: GET fresh price (bypasses cache)
    CG-->>BE: current price (INR)
    BE->>DB: startSession / withTransaction
    BE->>DB: findOne Holding
    alt insufficient holdings
        BE-->>FE: 409 Insufficient holdings
    else sufficient holdings
        BE->>DB: wallet.virtualCash += tradeValue
        BE->>DB: holding.quantity -= quantity (avgCost unchanged)
        BE->>DB: delete Holding if quantity == 0
        BE->>DB: create Transaction (status COMPLETED)
        DB-->>BE: commit transaction
        BE-->>FE: 201 {transaction, wallet, holding}
        FE-->>U: Show updated balance & holding
    end
```
