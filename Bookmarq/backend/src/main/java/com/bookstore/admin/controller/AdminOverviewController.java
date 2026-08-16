package com.bookstore.admin.controller;

import com.bookstore.admin.dto.AdminOverviewDto;
import com.bookstore.admin.service.AdminOverviewService;
import com.bookstore.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/overview")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class AdminOverviewController {

    private final AdminOverviewService overviewService;

    @GetMapping
    public ApiResponse<AdminOverviewDto> getOverview() {
        return ApiResponse.success(overviewService.getOverview(), "Overview retrieved");
    }
}
