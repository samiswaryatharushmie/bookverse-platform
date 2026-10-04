package com.bookstore.catalog.factory;

import org.springframework.data.domain.Sort;

/** Product interface for the Factory pattern: one way of ordering the book catalog. */
public interface SortOption {
    Sort toSort();
}
