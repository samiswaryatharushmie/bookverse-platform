package com.bookstore.patterns;

import com.bookstore.catalog.factory.SortOptionFactory;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SortOptionFactoryTest {

    private final SortOptionFactory factory = new SortOptionFactory();

    /** Verbatim copy of the switch BookService used before the refactor. */
    private static Sort originalSort(String sortSlug) {
        if (sortSlug == null) sortSlug = "";
        switch (sortSlug.toLowerCase()) {
            case "price_asc": return Sort.by("price").ascending();
            case "price_desc": return Sort.by("price").descending();
            case "date_desc": return Sort.by("publishedDate").descending();
            case "rating_desc": return Sort.by("avgRating").descending();
            case "popularity": return Sort.by("ratingCount").descending().and(Sort.by("avgRating").descending());
            case "title_asc": return Sort.by("title").ascending();
            case "relevance": return Sort.by("ratingCount").descending();
            default: return Sort.by("createdAt").descending();
        }
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"price_asc", "price_desc", "date_desc", "rating_desc", "popularity",
            "title_asc", "relevance", "PRICE_ASC", "Popularity", "", "newest", "views", "garbage"})
    void matchesOriginalSwitchForEverySlug(String slug) {
        assertEquals(originalSort(slug), factory.createSortOption(slug).toSort());
    }
}
