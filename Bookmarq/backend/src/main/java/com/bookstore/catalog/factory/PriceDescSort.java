package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Most expensive first. */
public class PriceDescSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("price").descending();
    }
}
