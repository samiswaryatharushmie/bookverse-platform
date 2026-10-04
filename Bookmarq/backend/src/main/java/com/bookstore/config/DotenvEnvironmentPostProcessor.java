package com.bookstore.config;

import org.apache.commons.logging.Log;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads KEY=VALUE pairs from the project's .env file into Spring's Environment
 * at startup, so ${MAIL_USERNAME}, ${MAIL_PASSWORD} etc. in application.yml resolve
 * without exporting them in every terminal.
 *
 * Looks for .env in the working directory, then its parent (the backend is
 * normally started from backend/, while .env lives in the project root).
 * Values from .env have the lowest priority: real environment variables and
 * command-line arguments still override them. Surrounding quotes are stripped,
 * so MAIL_PASSWORD="abcd efgh ijkl mnop" works.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "dotenvFile";

    private final Log log;

    public DotenvEnvironmentPostProcessor(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(DotenvEnvironmentPostProcessor.class);
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path workingDir = Paths.get("").toAbsolutePath();
        List<Path> candidates = workingDir.getParent() == null
                ? List.of(workingDir.resolve(".env"))
                : List.of(workingDir.resolve(".env"), workingDir.getParent().resolve(".env"));

        for (Path file : candidates) {
            if (Files.isRegularFile(file)) {
                try {
                    Map<String, Object> values = parse(Files.readAllLines(file, StandardCharsets.UTF_8));
                    environment.getPropertySources().addLast(new MapPropertySource(SOURCE_NAME, values));
                    log.info("Loaded " + values.size() + " settings from " + file);
                } catch (IOException e) {
                    log.warn("Could not read " + file + ": " + e.getMessage());
                }
                return;
            }
        }
        log.info("No .env file found; using environment variables and application.yml defaults");
    }

    static Map<String, Object> parse(List<String> lines) {
        Map<String, Object> values = new LinkedHashMap<>();
        for (String raw : lines) {
            String line = raw.strip();
            if (line.isEmpty() || line.startsWith("#")) continue;
            if (line.startsWith("export ")) line = line.substring(7).strip();

            int eq = line.indexOf('=');
            if (eq <= 0) continue;

            String key = line.substring(0, eq).strip();
            String value = line.substring(eq + 1).strip();
            if (value.length() >= 2
                    && ((value.startsWith("\"") && value.endsWith("\""))
                    || (value.startsWith("'") && value.endsWith("'")))) {
                value = value.substring(1, value.length() - 1);
            }
            values.put(key, value);
        }
        return values;
    }
}
