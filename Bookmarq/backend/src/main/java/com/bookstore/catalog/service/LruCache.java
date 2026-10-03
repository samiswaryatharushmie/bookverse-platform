package com.bookstore.catalog.service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A simple, thread-safe LRU (Least Recently Used) Cache.
 * 
 * VIVA NOTE: Implemented using a Java LinkedHashMap rather than pulling in
 * a massive external dependency like Redis or Spring Cache. By setting accessOrder=true
 * in the constructor, the map automatically moves accessed elements to the end of the list.
 * When removeEldestEntry returns true (size > capacity), it evicts the least recently used item.
 */
public class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LruCache(int capacity) {
        // initialCapacity, loadFactor, accessOrder (true means order by access, not insertion)
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
