-- ============================================================================
-- V29__drop_newsletter_subscribers.sql
-- Removes the newsletter subscribe/unsubscribe feature entirely, per request:
-- the Footer signup form, NewsletterController/Service/Repository/Entity/DTO,
-- and the frontend unsubscribe page/route were all deleted alongside this
-- migration. No other table or code references newsletter_subscribers.
-- ============================================================================

DROP TABLE IF EXISTS newsletter_subscribers;
