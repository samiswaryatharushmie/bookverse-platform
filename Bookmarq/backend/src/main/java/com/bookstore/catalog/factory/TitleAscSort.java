package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Alphabetical by title. */
public class TitleAscSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("title").ascending();
    }
}
