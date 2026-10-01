package com.bookstore.catalog.service;

import ai.djl.huggingface.tokenizers.Encoding;
import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import ai.djl.inference.Predictor;
import ai.djl.ndarray.NDArray;
import ai.djl.ndarray.NDList;
import ai.djl.ndarray.NDManager;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.translate.NoopTranslator;
import ai.djl.translate.TranslateException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.nio.file.Path;

@Service
public class EmbeddingService {

    private static final Logger logger = LoggerFactory.getLogger(EmbeddingService.class);

    private HuggingFaceTokenizer tokenizer;
    private ZooModel<NDList, NDList> model;
    private Predictor<NDList, NDList> predictor;
    
    private final Map<String, float[]> embeddingCache = Collections.synchronizedMap(new LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, float[]> eldest) {
            return size() > 1000;
        }
    });

    @PostConstruct
    public void init() {
        try {
            logger.info("Loading local HuggingFace tokenizer and ONNX model...");
            // Load tokenizer from resources
            Path tokenizerPath = new ClassPathResource("model/tokenizer.json").getFile().toPath();
            this.tokenizer = HuggingFaceTokenizer.newInstance(tokenizerPath);

            // Load ONNX model
            Path modelPath = new ClassPathResource("model").getFile().toPath();
            Criteria<NDList, NDList> criteria = Criteria.builder()
                    .setTypes(NDList.class, NDList.class)
                    .optModelPath(modelPath) // Directory containing the model
                    .optModelName("model.onnx")
                    .optEngine("OnnxRuntime")
                    .optTranslator(new NoopTranslator())
                    .build();

            this.model = criteria.loadModel();
            this.predictor = model.newPredictor();
            logger.info("Successfully loaded ONNX embedding model.");
        } catch (Exception e) {
            logger.error("Failed to load embedding model. Ensure model.onnx and tokenizer.json are in src/main/resources/model/", e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (predictor != null) predictor.close();
        if (model != null) model.close();
        if (tokenizer != null) tokenizer.close();
    }

    public float[] embed(String text) {
        if (predictor == null) {
            throw new IllegalStateException("Embedding model not loaded.");
        }
        
        // Phase 7: Caching - Check if embedding exists
        float[] cached = embeddingCache.get(text);
        if (cached != null) {
            logger.debug("Cache hit for embedding: '{}'", text);
            return cached;
        }
        
        try (NDManager manager = NDManager.newBaseManager()) {
            Encoding encoding = tokenizer.encode(text);
            long[] inputIds = encoding.getIds();
            long[] attentionMask = encoding.getAttentionMask();
            long[] tokenTypeIds = encoding.getTypeIds();

            NDArray inputIdsArray = manager.create(inputIds).expandDims(0);
            NDArray attentionMaskArray = manager.create(attentionMask).expandDims(0);
            NDArray tokenTypeIdsArray = manager.create(tokenTypeIds).expandDims(0);
            
            inputIdsArray.setName("input_ids");
            attentionMaskArray.setName("attention_mask");
            tokenTypeIdsArray.setName("token_type_ids");

            NDList input = new NDList(inputIdsArray, attentionMaskArray, tokenTypeIdsArray);
            NDList output = predictor.predict(input);

            // Get last_hidden_state (usually first output for MiniLM)
            NDArray lastHiddenState = output.get(0); // Shape: [1, seq_len, 384]
            
            // Mean pooling based on attention mask
            NDArray attentionMaskExpanded = attentionMaskArray.expandDims(-1).broadcast(lastHiddenState.getShape());
            NDArray masked = lastHiddenState.mul(attentionMaskExpanded);
            NDArray sum = masked.sum(new int[]{1});
            NDArray counts = attentionMaskExpanded.sum(new int[]{1}).clip(1e-9, Float.MAX_VALUE);
            
            NDArray meanPooled = sum.div(counts); // Shape: [1, 384]
            
            // L2 Normalize
            NDArray norm = meanPooled.norm(2, new int[]{-1}, true).clip(1e-9, Float.MAX_VALUE);
            NDArray normalized = meanPooled.div(norm);
            
            float[] result = normalized.toFloatArray();
            
            // Phase 7: Caching - Save embedding
            embeddingCache.put(text, result);
            return result;
        } catch (TranslateException e) {
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }
}
