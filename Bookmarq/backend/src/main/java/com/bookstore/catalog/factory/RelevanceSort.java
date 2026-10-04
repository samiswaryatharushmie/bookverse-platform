package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Relevance ordering; currently ranks by number of ratings. */
public class RelevanceSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("ratingCount").descending();
    }
}
