package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Most ratings first, then highest average rating. */
public class PopularitySort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("ratingCount").descending()
                .and(Sort.by("avgRating").descending());
    }
}
