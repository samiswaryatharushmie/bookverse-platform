package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Highest average rating first. */
public class RatingDescSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("avgRating").descending();
    }
}
