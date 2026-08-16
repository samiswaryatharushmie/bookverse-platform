-- ============================================================================
-- V19__catalog_enhancements.sql
-- Adds columns for faceted filtering, edition/series grouping, badges,
-- sale pricing, and rich book metadata.
-- ============================================================================

-- ── Format facet ────────────────────────────────────────────────────────────
ALTER TABLE books ADD format NVARCHAR(20) NOT NULL DEFAULT 'HARDCOVER';
GO

ALTER TABLE books ADD CONSTRAINT CK_books_format
    CHECK (format IN ('HARDCOVER','PAPERBACK','EBOOK','AUDIOBOOK'));
GO

-- ── Sale / member pricing ──────────────────────────────────────────────────
ALTER TABLE books ADD original_price DECIMAL(19,4) NULL;
ALTER TABLE books ADD member_price   DECIMAL(19,4) NULL;

-- ── Pre-order support ──────────────────────────────────────────────────────
ALTER TABLE books ADD pre_order    BIT  NOT NULL DEFAULT 0;
ALTER TABLE books ADD release_date DATE NULL;

-- ── Badge: signed edition ──────────────────────────────────────────────────
ALTER TABLE books ADD signed_edition BIT NOT NULL DEFAULT 0;

-- ── Series grouping (Phase 3, columns added now for forward-compat) ───────
ALTER TABLE books ADD series_name     NVARCHAR(200) NULL;
ALTER TABLE books ADD series_position INT           NULL;
ALTER TABLE books ADD series_total    INT           NULL;

-- ── Work grouping key (Phase 3 edition collapsing) ────────────────────────
ALTER TABLE books ADD work_key NVARCHAR(100) NULL;

-- ── Translated works (Phase 3) ────────────────────────────────────────────
ALTER TABLE books ADD original_title NVARCHAR(300) NULL;
ALTER TABLE books ADD translator     NVARCHAR(200) NULL;

-- ── Reading metadata (Phase 2 card enrichment) ────────────────────────────
ALTER TABLE books ADD reading_level   NVARCHAR(30)  NULL;
ALTER TABLE books ADD content_warning NVARCHAR(500) NULL;
ALTER TABLE books ADD age_rating      NVARCHAR(20)  NULL;

-- ── Popularity score (calculated from orders + wishlists) ─────────────────
ALTER TABLE books ADD popularity_score INT NOT NULL DEFAULT 0;
GO

-- ── Indexes for filter performance ────────────────────────────────────────
CREATE INDEX IX_books_language       ON books(language);
CREATE INDEX IX_books_format         ON books(format);
CREATE INDEX IX_books_published_date ON books(published_date);
CREATE INDEX IX_books_price          ON books(price);
CREATE INDEX IX_books_avg_rating     ON books(avg_rating);
CREATE INDEX IX_books_work_key       ON books(work_key)    WHERE work_key IS NOT NULL;
CREATE INDEX IX_books_series_name    ON books(series_name)  WHERE series_name IS NOT NULL;
CREATE INDEX IX_books_popularity     ON books(popularity_score);
