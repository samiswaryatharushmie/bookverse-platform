package com.bookstore.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for the faceted filtering endpoint.
 * Contains live counts for every facet option given the current filter state.
 *
 * <p>Each facet's counts are computed with all OTHER active filters applied,
 * but NOT the facet's own filter. This ensures the user sees how many results
 * they would get if they toggled any option.</p>
 */
@Data
public class FacetResponse {

    private List<GenreFacet> genre;
    private List<ValueFacet> format;
    private List<ValueFacet> language;
    private List<RatingFacet> rating;
    private List<ValueFacet> availability;
    private PriceHistogram priceHistogram;
    private YearRange yearRange;

    // ── Inner DTOs ──────────────────────────────────────────────────────────

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GenreFacet {
        private UUID id;
        private String name;
        private String slug;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ValueFacet {
        private String value;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RatingFacet {
        private int minRating;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PriceHistogram {
        private BigDecimal min;
        private BigDecimal max;
        private List<Bucket> buckets;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Bucket {
            private BigDecimal from;
            private BigDecimal to;
            private long count;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class YearRange {
        private Integer min;
        private Integer max;
    }
}
