package com.bookstore.common.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a service method for audit logging.
 *
 * <p>The {@link AuditAspect} AOP aspect intercepts methods annotated
 * with {@code @Auditable} and writes an entry to the {@code audit_log}
 * table recording the actor, action, entity, and before/after state.</p>
 *
 * <p>Supports IEEE/ACM Ethics Principle 1 (public interest) by maintaining
 * a transparent, tamper-evident record of all state-changing operations.</p>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /** The action name, e.g., "CREATE_BOOK", "UPDATE_ORDER_STATUS". */
    String action();

    /** The entity type being audited, e.g., "Book", "Order". */
    String entityType();
}
