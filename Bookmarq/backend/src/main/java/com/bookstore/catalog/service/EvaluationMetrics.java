package com.bookstore.catalog.service;

import java.util.List;
import java.util.Map;

/**
 * Evaluation Metrics for Information Retrieval.
 * Contains purely static mathematical functions to evaluate search quality.
 * <p>
 * VIVA NOTE: These metrics are implemented from scratch to ensure full transparency
 * and explainability. They operate on standard IR principles:
 * - Relevance scores are graded (e.g. 0 to 3).
 * - Ideal ranking means sorting by relevance score descending.
 */
public class EvaluationMetrics {

    /**
     * Precision@k: The proportion of retrieved documents in the top-k that are relevant.
     * @param retrievedSlugs List of retrieved book slugs in ranked order.
     * @param relevantSlugs Map of slug to relevance score. Any score > 0 is considered relevant.
     * @param k The cutoff rank.
     * @return Precision at k (0.0 to 1.0).
     */
    public static double precisionAtK(List<String> retrievedSlugs, Map<String, Integer> relevantSlugs, int k) {
        if (retrievedSlugs.isEmpty() || k <= 0) return 0.0;
        int limit = Math.min(k, retrievedSlugs.size());
        int relevantCount = 0;
        
        for (int i = 0; i < limit; i++) {
            String slug = retrievedSlugs.get(i);
            if (relevantSlugs.getOrDefault(slug, 0) > 0) {
                relevantCount++;
            }
        }
        return (double) relevantCount / k; // Note: standard P@k divides by k, not limit.
    }

    /**
     * Recall@k: The proportion of total relevant documents retrieved in the top-k.
     * @param retrievedSlugs List of retrieved book slugs in ranked order.
     * @param relevantSlugs Map of slug to relevance score.
     * @param k The cutoff rank.
     * @return Recall at k (0.0 to 1.0).
     */
    public static double recallAtK(List<String> retrievedSlugs, Map<String, Integer> relevantSlugs, int k) {
        int totalRelevant = 0;
        for (Integer score : relevantSlugs.values()) {
            if (score > 0) totalRelevant++;
        }
        if (totalRelevant == 0) return 1.0; // If nothing is relevant, recall is trivially perfect.
        if (retrievedSlugs.isEmpty() || k <= 0) return 0.0;

        int limit = Math.min(k, retrievedSlugs.size());
        int retrievedRelevantCount = 0;
        
        for (int i = 0; i < limit; i++) {
            String slug = retrievedSlugs.get(i);
            if (relevantSlugs.getOrDefault(slug, 0) > 0) {
                retrievedRelevantCount++;
            }
        }
        return (double) retrievedRelevantCount / totalRelevant;
    }

    /**
     * Mean Reciprocal Rank (MRR): 1 / rank of the first relevant document.
     * Average this across all queries to get the MRR.
     * @param retrievedSlugs List of retrieved book slugs.
     * @param relevantSlugs Map of slug to relevance score.
     * @return RR for this single query.
     */
    public static double reciprocalRank(List<String> retrievedSlugs, Map<String, Integer> relevantSlugs) {
        for (int i = 0; i < retrievedSlugs.size(); i++) {
            String slug = retrievedSlugs.get(i);
            if (relevantSlugs.getOrDefault(slug, 0) > 0) {
                return 1.0 / (i + 1); // Rank is 1-indexed
            }
        }
        return 0.0;
    }

    /**
     * NDCG@k (Normalized Discounted Cumulative Gain): 
     * Measures ranking quality by penalizing highly relevant documents appearing lower in the ranking.
     * 
     * DCG = sum_{i=1}^k (2^rel_i - 1) / log2(i + 1)
     * NDCG = DCG / IDCG (Ideal DCG)
     * 
     * @param retrievedSlugs List of retrieved book slugs.
     * @param relevantSlugs Map of slug to relevance score (0-3).
     * @param k Cutoff rank.
     * @return NDCG at k (0.0 to 1.0).
     */
    public static double ndcgAtK(List<String> retrievedSlugs, Map<String, Integer> relevantSlugs, int k) {
        if (retrievedSlugs.isEmpty() || k <= 0) return 0.0;

        // Calculate actual DCG
        double dcg = 0.0;
        int limit = Math.min(k, retrievedSlugs.size());
        for (int i = 0; i < limit; i++) {
            String slug = retrievedSlugs.get(i);
            int rel = relevantSlugs.getOrDefault(slug, 0);
            if (rel > 0) {
                // VIVA NOTE: (2^rel - 1) gives heavier weight to highly relevant items than just 'rel'.
                // log2(i + 1) is the position discount. At rank 1, log2(2) = 1 (no discount).
                dcg += (Math.pow(2, rel) - 1) / (Math.log(i + 2) / Math.log(2));
            }
        }

        // Calculate Ideal DCG (IDCG)
        // Sort all possible relevant scores descending
        List<Integer> idealScores = relevantSlugs.values().stream()
                .filter(s -> s > 0)
                .sorted((a, b) -> Integer.compare(b, a))
                .toList();

        double idcg = 0.0;
        int idealLimit = Math.min(k, idealScores.size());
        for (int i = 0; i < idealLimit; i++) {
            int rel = idealScores.get(i);
            idcg += (Math.pow(2, rel) - 1) / (Math.log(i + 2) / Math.log(2));
        }

        if (idcg == 0.0) return 0.0;
        return dcg / idcg;
    }
}
