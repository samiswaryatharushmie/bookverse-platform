package com.bookstore.config;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DotenvParserTest {

    @Test
    void parsesKeysStripsQuotesAndSkipsComments() {
        Map<String, Object> v = DotenvEnvironmentPostProcessor.parse(List.of(
                "# comment",
                "",
                "MAIL_HOST=smtp.gmail.com",
                "MAIL_PASSWORD=\"abcd efgh ijkl mnop\"",
                "MAIL_FROM=\"Bookmarq <shop@example.com>\"",
                "SINGLE='x y'",
                "export EXPORTED=1",
                "WITH_EQUALS=a=b=c",
                "EMPTY=",
                "not a setting"
        ));
        assertEquals("smtp.gmail.com", v.get("MAIL_HOST"));
        assertEquals("abcd efgh ijkl mnop", v.get("MAIL_PASSWORD"));
        assertEquals("Bookmarq <shop@example.com>", v.get("MAIL_FROM"));
        assertEquals("x y", v.get("SINGLE"));
        assertEquals("1", v.get("EXPORTED"));
        assertEquals("a=b=c", v.get("WITH_EQUALS"));
        assertEquals("", v.get("EMPTY"));
        assertEquals(7, v.size());
    }
}
