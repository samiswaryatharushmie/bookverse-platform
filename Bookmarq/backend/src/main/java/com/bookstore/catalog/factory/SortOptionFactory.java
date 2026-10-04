package com.bookstore.catalog.factory;

/**
 * Factory pattern: maps the sort slug sent by the frontend (e.g. "price_asc")
 * to the matching SortOption. Adding a new sort means adding one class and one
 * branch here, with no change to BookService.
 *
 * Unknown, blank or null slugs fall back to NewestSort, matching the original behaviour.
 */
public class SortOptionFactory {

    public SortOption createSortOption(String slug) {
        String key = slug == null ? "" : slug.toLowerCase();

        if ("price_asc".equals(key)) {
            return new PriceAscSort();
        } else if ("price_desc".equals(key)) {
            return new PriceDescSort();
        } else if ("date_desc".equals(key)) {
            return new DateDescSort();
        } else if ("rating_desc".equals(key)) {
            return new RatingDescSort();
        } else if ("popularity".equals(key)) {
            return new PopularitySort();
        } else if ("title_asc".equals(key)) {
            return new TitleAscSort();
        } else if ("relevance".equals(key)) {
            return new RelevanceSort();
        } else {
            return new NewestSort();
        }
    }
}
