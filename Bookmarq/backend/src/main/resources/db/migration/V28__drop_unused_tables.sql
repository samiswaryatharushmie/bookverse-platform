-- ============================================================================
-- V28__drop_unused_tables.sql
-- Drops tables that have no entity, repository, or query referencing them
-- anywhere in the application. None of these are populated by app code
-- (V22 already cleared out their data); dropped here instead of just left
-- empty so they don't get reintroduced by a fresh migration replay.
--
-- audit_log         - @Auditable/AuditAspect was never implemented; annotation is unused.
-- banners           - superseded by promotions.banner_active / banner_text.
-- refunds           - refund flow is orders.payment_status + order_status_history.
-- transaction_ledger- no references anywhere in the codebase.
-- payments          - never read or written; only dead cascade-delete cleanup referenced it.
-- invoices          - never read or written; only dead cascade-delete cleanup referenced it.
-- ============================================================================

DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS transaction_ledger;
