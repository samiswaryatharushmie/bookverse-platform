package com.bookstore.patterns;

import com.bookstore.catalog.cache.EmbeddingCache;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmbeddingCacheTest {

    @Test
    void alwaysReturnsSameInstance() {
        assertSame(EmbeddingCache.getInstance(), EmbeddingCache.getInstance());
    }

    @Test
    void storesAndEvictsBeyondCapacity() {
        EmbeddingCache cache = EmbeddingCache.getInstance();
        float[] vector = {1f, 2f};
        cache.put("singleton-test", vector);
        assertSame(vector, cache.get("singleton-test"));

        for (int i = 0; i < 1500; i++) {
            cache.put("filler-" + i, new float[]{i});
        }
        assertTrue(cache.size() <= 1000);
        assertNull(cache.get("singleton-test"));
    }
}
