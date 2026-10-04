package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Most recently published first. */
public class DateDescSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("publishedDate").descending();
    }
}
