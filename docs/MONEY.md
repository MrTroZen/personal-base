# Money

`docs/MONEY.md` is the product and implementation source of truth for the Money section. It defines the intended direction; it does not mean every capability below is implemented.

## Purpose

Money should become a visual personal finance dashboard rather than primarily a transaction list. Its main question is:

> What happened to my money during this period?

The page should make income, spending, investment, cash flow, trends, and project finances understandable at a glance.

## Core transaction types

Support three transaction types:

- **Income:** money received.
- **Expense:** money consumed through ordinary spending.
- **Investment:** money deliberately put into a project, business, learning, or an asset.

Investment must remain separate from ordinary expenses in summaries and breakdowns.

## Time system

One selected date range controls the entire Money page. Every metric, chart, breakdown, project summary, and transaction result must use that same period.

The range direction includes:

- This month
- Last month
- 3 months
- 6 months
- Year to date
- 1 year
- All time
- Custom range

Monthly views should also support previous-month and next-month navigation. Comparisons, when shown, use the previous equivalent period.

## Main summary

The top-level summary includes:

- Income
- Expenses
- Invested
- Net cash flow

Net cash flow is:

`Income - Expenses - Investments`

These values may show change against the previous equivalent period when that comparison is accurate and useful.

## Main visualizations

Visualizations must improve understanding rather than decorate the page.

1. **Cash-flow chart:** income, expenses, and investments over time.
2. **Spending breakdown:** expense category totals, percentages, and a ranked visual bar list.
3. **Investment breakdown:** where investment money is going, primarily grouped by linked project when available.
4. **Net cash-flow trend:** whether retained cash flow is improving or declining over time.

## Categories

Transactions need useful categorization without a large category-management system.

Initial expense direction:

- Food
- Transport
- Bills
- Shopping
- Software
- Business
- Education
- Entertainment
- Health
- Other

Initial income direction:

- Work
- Business
- Sales
- Refund
- Other

Categories should eventually be customizable, but customization should be introduced only when there is a concrete need and with the smallest workable model.

## Transactions

Transactions remain the detailed drill-down below the dashboard. The list should support filtering by:

- Search text
- Selected date range
- Transaction type
- Category
- Project

The transaction list must use the same selected period as every dashboard summary and visualization.

## Projects and money

Project-linked money is a central Personal Base capability. Project financial summaries should eventually show values the stored data can support reliably, such as:

- Revenue
- Expenses
- Investment
- Net cash flow
- Time invested

This connection should make **Time + Work + Money** understandable together. Do not invent accounting metrics that the available transaction and work-session data cannot support.

## Net worth

Do not build or infer net worth from transaction history. Proper net worth requires account balances, assets, liabilities, debt, and related records that Personal Base does not currently maintain.

The following are possible future directions, not current Money V2 scope:

- Accounts
- Assets and liabilities
- Net worth
- Budgets
- Recurring transactions
- Savings goals
- Bank sync
- Portfolio tracking
- Financial forecasting

## Proposed page structure

1. Header and shared date/range selector
2. Income, Expenses, Invested, and Net Cash Flow summary
3. Cash-flow chart
4. Spending breakdown
5. Investment breakdown
6. Net cash-flow trend
7. Transaction search, filters, and list

The interface should remain visually strong, simple, responsive, and easy to scan while reusing the existing Personal Base design system.

## Likely schema direction

The transaction model may need to evolve toward:

- `type`: `income | expense | investment`
- `category` or `category_id`
- `project_id`
- `amount`
- `transaction_date`
- `description`

A minimal transaction-category structure may be introduced if implementation requires it. Any migration must preserve existing owner data and the current RLS/security model. This document does not authorize or include a schema change.

## Current implementation boundary

The Money V2 data foundation is implemented: transactions support `income`, `expense`, and `investment`; `transaction_date` is the financial date source; every transaction has a text category; and project linkage remains optional. Existing rows were preserved and categorized as `Other`. The current Money page still emphasizes current-month totals, project summaries, filters, and transaction CRUD. The shared period system, comparisons, charts, and breakdowns remain future slices.

## Product principles

- Visual understanding first; transactions second.
- One selected period controls everything.
- Simple personal finance, not professional accounting software.
- Keep project linkage central.
- Do not add complexity without a real use case.
- Reuse the existing Personal Base design system.
- Preserve the private, single-owner architecture and owner-only RLS model.
