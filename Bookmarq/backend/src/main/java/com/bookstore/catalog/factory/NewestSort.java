package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Default ordering: most recently added to the store first. */
public class NewestSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("createdAt").descending();
    }
}
