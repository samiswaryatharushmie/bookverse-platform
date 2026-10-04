package com.bookstore.catalog.cache;

import com.bookstore.catalog.service.LruCache;

import java.util.Collections;
import java.util.Map;

/**
 * Singleton pattern: one application-wide cache of text embeddings, so an
 * expensive ONNX embedding is computed at most once per distinct text.
 *
 * VIVA NOTE: getInstance() is synchronized because the web server handles
 * requests on many threads; without it, two threads could both see
 * instance == null and create two caches.
 */
public class EmbeddingCache {

    private static final int CAPACITY = 1000;

    // Step 2: the single shared instance
    private static EmbeddingCache instance;

    private final Map<String, float[]> cache = Collections.synchronizedMap(new LruCache<>(CAPACITY));

    // Step 1: private constructor prevents "new EmbeddingCache()" elsewhere
    private EmbeddingCache() {}

    // Step 3: global access point
    public static synchronized EmbeddingCache getInstance() {
        if (instance == null) {
            instance = new EmbeddingCache();
        }
        return instance;
    }

    public float[] get(String text) {
        return cache.get(text);
    }

    public void put(String text, float[] embedding) {
        cache.put(text, embedding);
    }

    public int size() {
        return cache.size();
    }
}
