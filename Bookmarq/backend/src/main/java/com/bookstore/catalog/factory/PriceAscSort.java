package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Cheapest first. */
public class PriceAscSort implements SortOption {
    @Override
    public Sort toSort() {
        return Sort.by("price").ascending();
    }
}
