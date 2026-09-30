package com.bookstore.catalog.controller;

import com.bookstore.catalog.dto.CuratedShelfDto;
import com.bookstore.catalog.service.CuratedShelfService;
import com.bookstore.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shelves")
@RequiredArgsConstructor
public class CuratedShelfController {

    private final CuratedShelfService curatedShelfService;

    @GetMapping
    public ApiResponse<List<CuratedShelfDto>> getShelves() {
        return ApiResponse.success(curatedShelfService.getActiveShelves(), "Shelves retrieved");
    }
}
