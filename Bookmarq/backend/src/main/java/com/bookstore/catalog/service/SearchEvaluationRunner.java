package com.bookstore.catalog.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.repository.BookRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.FileWriter;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class SearchEvaluationRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SearchEvaluationRunner.class);

    private final SearchEngineService searchEngineService;
    private final QueryParserService queryParserService;
    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper;

    public SearchEvaluationRunner(SearchEngineService searchEngineService, QueryParserService queryParserService, BookRepository bookRepository, ObjectMapper objectMapper) {
        this.searchEngineService = searchEngineService;
        this.queryParserService = queryParserService;
        this.bookRepository = bookRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        boolean isEval = Arrays.asList(args).contains("--eval");
        boolean isSweep = Arrays.asList(args).contains("--sweep");

        if (!isEval && !isSweep) {
            return; // Only run if specifically requested
        }

        logger.info("Starting Search Evaluation Harness...");

        // Load fixtures
        InputStream is = new ClassPathResource("eval-fixtures.json").getInputStream();
        List<Fixture> fixtures = objectMapper.readValue(is, new TypeReference<>() {});

        if (isSweep) {
            runSweep(fixtures);
        } else {
            runStandardEval(fixtures);
        }
        
        logger.info("Evaluation complete. Exiting system...");
        System.exit(0); // Exit after eval, since it's a CLI tool
    }

    private void runStandardEval(List<Fixture> fixtures) throws Exception {
        // BM25 Only
        logger.info("Evaluating BM25 Only...");
        MetricsResult bm25Result = evaluateConfig(fixtures, 1.0, 0.0);
        
        // Semantic Only
        logger.info("Evaluating Dense Vector Semantic Only...");
        MetricsResult semanticResult = evaluateConfig(fixtures, 0.0, 1.0);
        
        // Hybrid (RRF)
        logger.info("Evaluating Hybrid RRF...");
        MetricsResult hybridResult = evaluateConfig(fixtures, 1.0, 1.0);

        printComparisonTable(bm25Result, semanticResult, hybridResult);
        
        // Export to CSV
        try (PrintWriter writer = new PrintWriter(new FileWriter("evaluation-results.csv"))) {
            writer.println("Model,NDCG@10,MRR,Precision@5,Recall@10");
            writer.printf("BM25,%.4f,%.4f,%.4f,%.4f\n", bm25Result.ndcg, bm25Result.mrr, bm25Result.p5, bm25Result.r10);
            writer.printf("Semantic,%.4f,%.4f,%.4f,%.4f\n", semanticResult.ndcg, semanticResult.mrr, semanticResult.p5, semanticResult.r10);
            writer.printf("Hybrid,%.4f,%.4f,%.4f,%.4f\n", hybridResult.ndcg, hybridResult.mrr, hybridResult.p5, hybridResult.r10);
        }
        logger.info("Exported results to evaluation-results.csv");
    }

    private void runSweep(List<Fixture> fixtures) throws Exception {
        logger.info("Running RRF Parameter Sweep...");
        try (PrintWriter writer = new PrintWriter(new FileWriter("sweep-results.csv"))) {
            writer.println("LexicalWeight,SemanticWeight,NDCG@10,MRR,Precision@5,Recall@10");
            
            // Sweep lexical from 0.0 to 1.0, semantic from 0.0 to 1.0
            for (double l = 0.0; l <= 1.0; l += 0.1) {
                for (double s = 0.0; s <= 1.0; s += 0.1) {
                    if (l == 0.0 && s == 0.0) continue;
                    MetricsResult res = evaluateConfig(fixtures, l, s);
                    writer.printf("%.1f,%.1f,%.4f,%.4f,%.4f,%.4f\n", l, s, res.ndcg, res.mrr, res.p5, res.r10);
                }
            }
        }
        logger.info("Exported sweep results to sweep-results.csv");
    }

    private MetricsResult evaluateConfig(List<Fixture> fixtures, double lexicalWeight, double semanticWeight) {
        double totalNdcg = 0;
        double totalMrr = 0;
        double totalP5 = 0;
        double totalR10 = 0;
        int validQueries = 0;

        for (Fixture f : fixtures) {
            // Only evaluate non-empty queries for precision/recall maths
            if (f.relevantBooks == null || f.relevantBooks.isEmpty()) {
                continue;
            }
            validQueries++;

            Map<String, Integer> relMap = new HashMap<>();
            for (RelevantBook rb : f.relevantBooks) {
                relMap.put(rb.slug, rb.score);
            }

            QueryIntent intent = queryParserService.parse(f.query);
            List<SearchEngineService.SearchResult> results = searchEngineService.search(intent, lexicalWeight, semanticWeight);
            List<String> retrievedSlugs = results.stream().map(r -> r.book.getSlug()).collect(Collectors.toList());

            totalNdcg += EvaluationMetrics.ndcgAtK(retrievedSlugs, relMap, 10);
            totalMrr += EvaluationMetrics.reciprocalRank(retrievedSlugs, relMap);
            totalP5 += EvaluationMetrics.precisionAtK(retrievedSlugs, relMap, 5);
            totalR10 += EvaluationMetrics.recallAtK(retrievedSlugs, relMap, 10);
        }

        if (validQueries == 0) return new MetricsResult(0, 0, 0, 0);

        return new MetricsResult(
                totalNdcg / validQueries,
                totalMrr / validQueries,
                totalP5 / validQueries,
                totalR10 / validQueries
        );
    }

    private void printComparisonTable(MetricsResult bm25, MetricsResult semantic, MetricsResult hybrid) {
        System.out.println("===============================================================");
        System.out.println("                   EVALUATION RESULTS                          ");
        System.out.println("===============================================================");
        System.out.printf("%-15s | %-10s | %-10s | %-10s | %-10s\n", "Model", "NDCG@10", "MRR", "P@5", "R@10");
        System.out.println("---------------------------------------------------------------");
        System.out.printf("%-15s | %.4f     | %.4f     | %.4f     | %.4f\n", "BM25", bm25.ndcg, bm25.mrr, bm25.p5, bm25.r10);
        System.out.printf("%-15s | %.4f     | %.4f     | %.4f     | %.4f\n", "Semantic", semantic.ndcg, semantic.mrr, semantic.p5, semantic.r10);
        System.out.printf("%-15s | %.4f     | %.4f     | %.4f     | %.4f\n", "Hybrid (RRF)", hybrid.ndcg, hybrid.mrr, hybrid.p5, hybrid.r10);
        System.out.println("===============================================================");
        
        double deltaNdcg = ((hybrid.ndcg - bm25.ndcg) / Math.max(0.001, bm25.ndcg)) * 100;
        System.out.printf("Hybrid improved NDCG@10 by %.1f%% over BM25 alone.\n", deltaNdcg);
        System.out.println("===============================================================");
    }

    // --- DTOs for JSON parsing ---
    public static class Fixture {
        public String query;
        public String type;
        public List<RelevantBook> relevantBooks;
    }

    public static class RelevantBook {
        public String slug;
        public int score;
    }

    public static class MetricsResult {
        public double ndcg, mrr, p5, r10;
        public MetricsResult(double ndcg, double mrr, double p5, double r10) {
            this.ndcg = ndcg; this.mrr = mrr; this.p5 = p5; this.r10 = r10;
        }
    }
}
